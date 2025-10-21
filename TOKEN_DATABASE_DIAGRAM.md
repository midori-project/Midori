# 🗄️ Token System Database Diagram

## Database Schema สำหรับ Token System

```mermaid
erDiagram
    User {
        string id PK
        string email UK
        string displayName
        string avatarUrl
        string locale
        boolean isActive
        datetime createdAt
        datetime updatedAt
        datetime lastLoginAt
        int balanceTokens "Default: 5"
        datetime lastTokenReset "Default: now()"
    }

    TokenTransaction {
        string id PK
        string userId FK
        int amount "Positive=credit, Negative=debit"
        string type "DAILY_RESET, PROJECT_CREATION, etc."
        string description
        json metadata
        datetime createdAt
    }

    Project {
        string id PK
        string ownerId FK
        string name
        string description
        string visibility
        json options
        int likeCount
        datetime createdAt
        datetime updatedAt
        datetime deletedAt
    }

    Session {
        string id PK
        string userId FK
        string sessionTokenHash UK
        string ip
        string userAgent
        datetime createdAt
        datetime expiresAt
        datetime lastActiveAt
        datetime terminatedAt
    }

    ChatRun {
        string id PK
        string conversationId FK
        string userId FK
        string projectId FK
        string agentId FK
        string model
        int tokensInput
        int tokensOutput
        decimal costUsd
        int latencyMs
        string status
        string error
        json rawRequest
        json rawResponse
        datetime createdAt
        datetime updatedAt
    }

    Generation {
        string id PK
        string projectId FK
        string userId FK
        json prompt
        json promptJson
        json options
        string model
        int tokensInput
        int tokensOutput
        decimal costUsd
        datetime createdAt
    }

    PreviewSession {
        string id PK
        string projectId FK
        string snapshotId FK
        string url
        string state
        json meta
        datetime createdAt
        datetime updatedAt
        datetime expiresAt
        datetime accessedAt
        int buildTimeMs
        string errorMessage
        string authToken
        datetime authExpiresAt
    }

    Deployment {
        string id PK
        string projectId FK
        string provider
        string state
        string url
        json meta
        datetime createdAt
    }

    %% Relationships
    User ||--o{ TokenTransaction : "has transactions"
    User ||--o{ Project : "owns"
    User ||--o{ Session : "has sessions"
    User ||--o{ ChatRun : "initiates"
    User ||--o{ Generation : "creates"
    
    Project ||--o{ ChatRun : "generates"
    Project ||--o{ Generation : "contains"
    Project ||--o{ PreviewSession : "previews"
    Project ||--o{ Deployment : "deploys"
```

## 🔄 Token Flow Diagram

```mermaid
flowchart TD
    A[User Login] --> B[Check Token Balance]
    B --> C{Has Enough Tokens?}
    
    C -->|Yes| D[Create Project]
    C -->|No| E[Show Insufficient Tokens]
    
    D --> F[Project Created Successfully?]
    F -->|Yes| G[Deduct 1 Token]
    F -->|No| H[Refund Token]
    
    G --> I[Update Token Balance]
    H --> I
    
    J[Daily Reset at 0:00] --> K[Reset All Users to 5 Tokens]
    K --> L[Log DAILY_RESET Transaction]
    
    M[User Action] --> N{Action Type}
    N -->|Create Project| O[Check: 1 Token Required]
    N -->|Chat Analysis| P[Check: 0 Tokens Required]
    N -->|Preview Build| Q[Check: 0 Tokens Required]
    N -->|Deploy| R[Check: 0 Tokens Required]
    
    O --> S{Sufficient Tokens?}
    P --> T[Allow Free]
    Q --> T
    R --> T
    
    S -->|Yes| U[Deduct Tokens & Proceed]
    S -->|No| V[Block Action]
```

## 📊 Token Transaction Types

```mermaid
graph LR
    A[TokenTransaction Types] --> B[DAILY_RESET]
    A --> C[PROJECT_CREATION]
    A --> D[CHAT_ANALYSIS]
    A --> E[PREVIEW_BUILD]
    A --> F[DEPLOYMENT]
    A --> G[ADMIN_ADJUSTMENT]
    A --> H[REFUND]
    
    B --> B1["+5 Tokens<br/>Every 24 hours"]
    C --> C1["-1 Token<br/>Per project creation"]
    D --> D1["0 Tokens<br/>Free service"]
    E --> E1["0 Tokens<br/>Free service"]
    F --> F1["0 Tokens<br/>Free service"]
    G --> G1["±X Tokens<br/>Admin adjustment"]
    H --> H1["+X Tokens<br/>Failed operations"]
```

## 🏗️ Database Tables Structure

### User Table (Updated)
```sql
model User {
  id                 String                  @id @default(uuid())
  email              String?                 @unique
  displayName        String?
  avatarUrl          String?
  locale             String?                 @default("th")
  isActive           Boolean                 @default(true)
  createdAt          DateTime                @default(now())
  updatedAt          DateTime                @updatedAt
  lastLoginAt        DateTime?
  
  -- Token System Fields
  balanceTokens      Int                    @default(5)
  lastTokenReset     DateTime?              @default(now())
  
  -- Relations
  tokenTransactions  TokenTransaction[]
  projects           Project[]
  sessions           Session[]
  -- ... other relations
}
```

### TokenTransaction Table (New)
```sql
model TokenTransaction {
  id          String              @id @default(uuid())
  userId      String
  amount      Int                 // Positive for credit, negative for debit
  type        TokenTransactionType
  description String?
  metadata    Json?               // Additional data like projectId, actionType
  createdAt   DateTime            @default(now())
  user        User                @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([type])
  @@index([createdAt])
}
```

### TokenTransactionType Enum
```sql
enum TokenTransactionType {
  DAILY_RESET        // +5 Tokens daily reset
  PROJECT_CREATION   // -1 Token per project
  CHAT_ANALYSIS      // 0 Tokens (free)
  PREVIEW_BUILD      // 0 Tokens (free)
  DEPLOYMENT         // 0 Tokens (free)
  ADMIN_ADJUSTMENT   // ±X Tokens admin adjustment
  REFUND             // +X Tokens refund
}
```

## 🔍 Key Relationships

1. **User → TokenTransaction**: One-to-Many
   - User can have multiple token transactions
   - Each transaction belongs to one user

2. **User → Project**: One-to-Many
   - User can create multiple projects
   - Each project costs 1 token

3. **TokenTransaction → Project**: Indirect relationship
   - PROJECT_CREATION transactions reference projectId in metadata
   - REFUND transactions reference original projectId

## 📈 Token Lifecycle

```mermaid
sequenceDiagram
    participant U as User
    participant S as System
    participant DB as Database
    participant T as TokenService

    U->>S: Login
    S->>T: Check Token Balance
    T->>DB: Get User Balance
    DB-->>T: Return Balance
    T-->>S: Return Token Info
    S-->>U: Show Token Balance

    U->>S: Create Project
    S->>T: Check Sufficient Tokens
    T->>DB: Validate Balance
    DB-->>T: Return Validation Result
    
    alt Sufficient Tokens
        S->>DB: Create Project
        DB-->>S: Project Created
        S->>T: Deduct 1 Token
        T->>DB: Create TokenTransaction(-1)
        T->>DB: Update User Balance
        S-->>U: Project Created Successfully
    else Insufficient Tokens
        S-->>U: Show Error Message
    end

    Note over S: Daily Reset at 0:00
    S->>T: Reset All Users
    T->>DB: Update All Users to 5 Tokens
    T->>DB: Create DAILY_RESET Transactions
```

## 🛡️ Security & Constraints

1. **Atomic Operations**: All token operations use database transactions
2. **Balance Validation**: Always check balance before deducting
3. **Audit Trail**: Every token change is logged
4. **Refund Mechanism**: Failed operations refund tokens
5. **Daily Reset**: Automatic reset prevents token accumulation

## 📊 Indexes for Performance

```sql
-- User table indexes
@@index([email])
@@index([balanceTokens])
@@index([lastTokenReset])

-- TokenTransaction table indexes
@@index([userId])
@@index([type])
@@index([createdAt])
@@index([userId, createdAt])  -- Composite for user history
```

---

## 🎯 Summary

ระบบ Token Database ถูกออกแบบให้:
- **ง่ายต่อการใช้งาน**: User มี balanceTokens และ lastTokenReset
- **ครบถ้วน**: บันทึกทุกการเปลี่ยนแปลงใน TokenTransaction
- **ปลอดภัย**: ใช้ database transactions และ validation
- **ขยายได้**: รองรับการเพิ่มฟีเจอร์ใหม่ในอนาคต
- **มีประสิทธิภาพ**: มี indexes ที่เหมาะสมสำหรับ query patterns
