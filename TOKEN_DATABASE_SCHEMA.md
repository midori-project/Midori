# 🗄️ Token System Database Schema

## 📋 Database Tables Overview

### 1. **User Table (Updated)**
```
┌─────────────────────────────────────────────────────────────┐
│                        User Table                          │
├─────────────────────────────────────────────────────────────┤
│ id                 String (PK)                             │
│ email              String (Unique)                        │
│ displayName        String                                  │
│ avatarUrl          String                                  │
│ locale             String (default: "th")                 │
│ isActive           Boolean (default: true)                 │
│ createdAt          DateTime                                │
│ updatedAt          DateTime                                │
│ lastLoginAt        DateTime                                │
│ balanceTokens      Int (default: 5) ⭐ NEW                 │
│ lastTokenReset     DateTime (default: now()) ⭐ NEW       │
└─────────────────────────────────────────────────────────────┘
```

### 2. **TokenTransaction Table (New)**
```
┌─────────────────────────────────────────────────────────────┐
│                   TokenTransaction Table                   │
├─────────────────────────────────────────────────────────────┤
│ id          String (PK)                                    │
│ userId      String (FK → User.id)                         │
│ amount      Int (Positive=credit, Negative=debit)         │
│ type        TokenTransactionType                           │
│ description String                                         │
│ metadata    Json (projectId, actionType, etc.)            │
│ createdAt   DateTime                                       │
└─────────────────────────────────────────────────────────────┘
```

### 3. **TokenTransactionType Enum**
```
┌─────────────────────────────────────────────────────────────┐
│                TokenTransactionType Enum                    │
├─────────────────────────────────────────────────────────────┤
│ DAILY_RESET        → +5 Tokens (ทุก 0.00 น.)              │
│ PROJECT_CREATION   → -1 Token (สร้างเว็บไซต์)              │
│ CHAT_ANALYSIS      → 0 Tokens (ฟรี)                        │
│ PREVIEW_BUILD      → 0 Tokens (ฟรี)                        │
│ DEPLOYMENT         → 0 Tokens (ฟรี)                        │
│ ADMIN_ADJUSTMENT   → ±X Tokens (Admin ปรับ)                │
│ REFUND             → +X Tokens (คืนเมื่อล้มเหลว)           │
└─────────────────────────────────────────────────────────────┘
```

## 🔗 Relationships

### **One-to-Many Relationships**
```
User (1) ──────────── (N) TokenTransaction
  │                        │
  │                        │
  │                        ├─ amount: -1, type: PROJECT_CREATION
  │                        ├─ amount: +5, type: DAILY_RESET
  │                        └─ amount: +1, type: REFUND
  │
  └─── (N) Project
       │
       ├─ id: "proj-001", name: "My Website"
       ├─ id: "proj-002", name: "Portfolio"
       └─ id: "proj-003", name: "Blog"
```

## 📊 Token Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    TOKEN SYSTEM FLOW                       │
└─────────────────────────────────────────────────────────────┘

User Login
    │
    ▼
┌─────────────────┐
│ Check Token      │ ←─── User.balanceTokens
│ Balance          │
└─────────────────┘
    │
    ▼
┌─────────────────┐
│ Has Enough      │
│ Tokens?         │
└─────────────────┘
    │
    ├─ YES ──→ Create Project ──→ Deduct 1 Token ──→ Update Balance
    │
    └─ NO ──→ Show "Insufficient Tokens" Message

Daily Reset (0:00)
    │
    ▼
┌─────────────────┐
│ Reset All Users │
│ to 5 Tokens     │
└─────────────────┘
    │
    ▼
┌─────────────────┐
│ Log DAILY_RESET │
│ Transaction     │
└─────────────────┘
```

## 🎯 Token Usage Matrix

| Action | Token Cost | Type | Description |
|--------|------------|------|-------------|
| **Create Website** | -1 | PROJECT_CREATION | สร้างเว็บไซต์ใหม่ |
| **Chat Analysis** | 0 | CHAT_ANALYSIS | วิเคราะห์ chat (ฟรี) |
| **Preview Build** | 0 | PREVIEW_BUILD | สร้าง preview (ฟรี) |
| **Deploy** | 0 | DEPLOYMENT | deploy เว็บไซต์ (ฟรี) |
| **Daily Reset** | +5 | DAILY_RESET | รีเซ็ตทุก 0.00 น. |
| **Refund** | +X | REFUND | คืนเมื่อล้มเหลว |
| **Admin Adjust** | ±X | ADMIN_ADJUSTMENT | Admin ปรับยอด |

## 🔄 Token Transaction Examples

### **Example 1: User สร้างเว็บไซต์สำเร็จ**
```
┌─────────────────────────────────────────────────────────────┐
│                    TokenTransaction                         │
├─────────────────────────────────────────────────────────────┤
│ id: "tx-001"                                               │
│ userId: "user-123"                                         │
│ amount: -1 (debit)                                         │
│ type: PROJECT_CREATION                                     │
│ description: "Project creation"                            │
│ metadata: {"projectId": "proj-456"}                       │
│ createdAt: "2024-01-15 10:30:00"                          │
└─────────────────────────────────────────────────────────────┘
```

### **Example 2: Daily Reset**
```
┌─────────────────────────────────────────────────────────────┐
│                    TokenTransaction                         │
├─────────────────────────────────────────────────────────────┤
│ id: "tx-002"                                               │
│ userId: "user-123"                                         │
│ amount: +5 (credit)                                        │
│ type: DAILY_RESET                                          │
│ description: "Daily token reset"                           │
│ metadata: {"resetDate": "2024-01-16 00:00:00"}            │
│ createdAt: "2024-01-16 00:00:00"                          │
└─────────────────────────────────────────────────────────────┘
```

### **Example 3: Refund เมื่อสร้างล้มเหลว**
```
┌─────────────────────────────────────────────────────────────┐
│                    TokenTransaction                         │
├─────────────────────────────────────────────────────────────┤
│ id: "tx-003"                                               │
│ userId: "user-123"                                         │
│ amount: +1 (credit)                                        │
│ type: REFUND                                                │
│ description: "Refund for failed project creation"          │
│ metadata: {"projectId": "proj-456", "reason": "DB error"}  │
│ createdAt: "2024-01-15 10:35:00"                          │
└─────────────────────────────────────────────────────────────┘
```

## 🏗️ Database Indexes

### **User Table Indexes**
```sql
@@index([email])                    -- Login lookup
@@index([balanceTokens])           -- Token balance queries
@@index([lastTokenReset])          -- Daily reset queries
```

### **TokenTransaction Table Indexes**
```sql
@@index([userId])                  -- User transaction history
@@index([type])                    -- Transaction type queries
@@index([createdAt])               -- Time-based queries
@@index([userId, createdAt])       -- User history with time
```

## 🔍 Query Examples

### **Get User Token Balance**
```sql
SELECT balanceTokens, lastTokenReset 
FROM User 
WHERE id = 'user-123';
```

### **Get User Transaction History**
```sql
SELECT * FROM TokenTransaction 
WHERE userId = 'user-123' 
ORDER BY createdAt DESC 
LIMIT 20;
```

### **Find Users Needing Daily Reset**
```sql
SELECT id, email, balanceTokens, lastTokenReset 
FROM User 
WHERE lastTokenReset < NOW() - INTERVAL '24 hours' 
   OR lastTokenReset IS NULL;
```

### **Get Token Usage Statistics**
```sql
SELECT 
  type,
  COUNT(*) as transaction_count,
  SUM(amount) as total_amount
FROM TokenTransaction 
WHERE userId = 'user-123'
GROUP BY type;
```

## 🛡️ Security & Constraints

### **Database Constraints**
```sql
-- User balance cannot be negative
ALTER TABLE User ADD CONSTRAINT check_balance_positive 
CHECK (balanceTokens >= 0);

-- TokenTransaction amount validation
ALTER TABLE TokenTransaction ADD CONSTRAINT check_amount_not_zero 
CHECK (amount != 0);
```

### **Transaction Safety**
```sql
-- Example: Safe token deduction
BEGIN TRANSACTION;
  -- Check balance
  SELECT balanceTokens FROM User WHERE id = 'user-123' FOR UPDATE;
  
  -- Deduct token
  UPDATE User SET balanceTokens = balanceTokens - 1 WHERE id = 'user-123';
  
  -- Log transaction
  INSERT INTO TokenTransaction (userId, amount, type, description) 
  VALUES ('user-123', -1, 'PROJECT_CREATION', 'Project creation');
COMMIT;
```

## 📈 Performance Considerations

### **Query Optimization**
- ใช้ indexes สำหรับ frequent queries
- Cache token balance ใน application layer
- Batch operations สำหรับ daily reset

### **Monitoring Queries**
```sql
-- Monitor token usage patterns
SELECT 
  DATE(createdAt) as date,
  type,
  COUNT(*) as count,
  SUM(amount) as total
FROM TokenTransaction 
WHERE createdAt >= NOW() - INTERVAL '7 days'
GROUP BY DATE(createdAt), type
ORDER BY date DESC;
```

---

## 🎯 **สรุป Database Design**

### **จุดเด่น**
✅ **ง่ายต่อการใช้งาน** - User มี balanceTokens และ lastTokenReset  
✅ **ครบถ้วน** - บันทึกทุกการเปลี่ยนแปลงใน TokenTransaction  
✅ **ปลอดภัย** - ใช้ database transactions และ validation  
✅ **ขยายได้** - รองรับการเพิ่มฟีเจอร์ใหม่ในอนาคต  
✅ **มีประสิทธิภาพ** - มี indexes ที่เหมาะสมสำหรับ query patterns  

### **การใช้งาน**
1. **User Login** → ตรวจสอบ balanceTokens
2. **Create Project** → หัก 1 Token, บันทึก transaction
3. **Daily Reset** → รีเซ็ตเป็น 5 Token, บันทึก DAILY_RESET
4. **Failed Operation** → คืน Token, บันทึก REFUND
