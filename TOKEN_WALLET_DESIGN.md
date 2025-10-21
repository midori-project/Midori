# 🪙 TokenWallet System Design

## 🎯 **การออกแบบ TokenWallet แบบแยก Table**

### **Database Schema**

#### **1. TokenWallet Table**
```sql
model TokenWallet {
  id              String              @id @default(uuid())
  userId          String              // FK → User.id
  balanceTokens   Int                 @default(5)
  lastTokenReset  DateTime?           @default(now())
  walletType      WalletType          @default(STANDARD)
  isActive        Boolean             @default(true)
  expiresAt       DateTime?           // สำหรับ wallet ชั่วคราว
  createdAt       DateTime            @default(now())
  updatedAt       DateTime            @updatedAt
  
  // Relations
  user                User                @relation(fields: [userId], references: [id], onDelete: Cascade)
  tokenTransactions   TokenTransaction[]
  
  // Indexes
  @@index([userId])
  @@index([walletType])
  @@index([isActive])
  @@index([expiresAt])
  @@unique([userId, walletType]) // หนึ่ง wallet ต่อประเภทต่อผู้ใช้
}
```

#### **2. WalletType Enum**
```sql
enum WalletType {
  STANDARD    // Token ปกติ (รีเซ็ตทุกวัน)
  PREMIUM     // Token premium (ซื้อมา)
  BONUS       // Token โบนัส (โปรโมชั่น)
  TRIAL       // Token ทดลอง (จำกัดเวลา)
}
```

#### **3. TokenTransaction (อัปเดต)**
```sql
model TokenTransaction {
  id          String              @id @default(uuid())
  userId      String              // FK → User.id
  walletId    String?             // FK → TokenWallet.id (optional)
  amount      Int                 // Positive=credit, Negative=debit
  type        TokenTransactionType
  description String?
  metadata    Json?               // projectId, actionType, etc.
  createdAt   DateTime            @default(now())
  
  // Relations
  user        User                @relation(fields: [userId], references: [id], onDelete: Cascade)
  wallet      TokenWallet?        @relation(fields: [walletId], references: [id], onDelete: SetNull)
}
```

## 🔄 **Token Flow ใหม่**

### **1. User Registration**
```
User สมัครสมาชิก
    │
    ▼
┌─────────────────┐
│ สร้าง STANDARD  │ ←─── TokenWalletService.initializeUserWallets()
│ Wallet (5 Token)│
└─────────────────┘
```

### **2. Project Creation**
```
User สร้างโปรเจค
    │
    ▼
┌─────────────────┐
│ ตรวจสอบ Token   │ ←─── TokenWalletService.getUserTokenSummary()
│ ในทุก Wallet     │
└─────────────────┘
    │
    ▼
┌─────────────────┐
│ หัก Token จาก   │ ←─── TokenWalletService.deductTokens()
│ Wallet ที่เหมาะสม│     (ลำดับ: STANDARD → PREMIUM → BONUS → TRIAL)
└─────────────────┘
    │
    ▼
┌─────────────────┐
│ บันทึก Transaction│ ←─── TokenLedgerService.deductTokens()
└─────────────────┘
```

### **3. Daily Reset**
```
Daily Reset (0:00)
    │
    ▼
┌─────────────────┐
│ รีเซ็ต STANDARD │ ←─── TokenWalletService.resetDailyTokens()
│ Wallet เป็น 5    │
└─────────────────┘
    │
    ▼
┌─────────────────┐
│ บันทึก DAILY_   │ ←─── TokenLedgerService.resetDailyTokens()
│ RESET Transaction│
└─────────────────┘
```

## 🎯 **ข้อดีของการแยก TokenWallet**

### **1. Flexibility**
- **Multiple Wallets**: ผู้ใช้สามารถมีหลาย wallet
- **Wallet Types**: แยกประเภท Token (STANDARD, PREMIUM, BONUS, TRIAL)
- **Expiration**: Token หมดอายุได้
- **Priority**: ลำดับการใช้ Token ชัดเจน

### **2. Security & Isolation**
- **Data Separation**: Token data แยกจาก User data
- **Permission Control**: จำกัดการเข้าถึง Token
- **Audit Trail**: ติดตามการเปลี่ยนแปลงแยกต่างหาก

### **3. Scalability**
- **Independent Scaling**: Token table scale แยกจาก User
- **Caching Strategy**: Cache Token balance แยกต่างหาก
- **Sharding Potential**: Shard ตาม region ได้

### **4. Business Logic**
- **Wallet Priority**: STANDARD → PREMIUM → BONUS → TRIAL
- **Expiration Handling**: Token หมดอายุอัตโนมัติ
- **Multiple Sources**: Token จากหลายแหล่ง

## 📊 **API Endpoints ใหม่**

### **TokenWallet Management**
```typescript
// GET /api/billing/wallets
// ดึงข้อมูล wallets ทั้งหมดของผู้ใช้
{
  "success": true,
  "data": {
    "totalBalance": 15,
    "wallets": [
      {
        "id": "wallet-1",
        "balanceTokens": 5,
        "walletType": "STANDARD",
        "isActive": true,
        "expiresAt": null
      },
      {
        "id": "wallet-2", 
        "balanceTokens": 10,
        "walletType": "PREMIUM",
        "isActive": true,
        "expiresAt": "2024-12-31T23:59:59Z"
      }
    ],
    "canCreateProject": true,
    "requiredTokens": 1
  }
}

// POST /api/billing/wallets
// สร้าง wallet ใหม่
{
  "walletType": "PREMIUM",
  "initialTokens": 10,
  "expiresAt": "2024-12-31T23:59:59Z"
}
```

## 🎨 **UI Components ใหม่**

### **1. TokenWallet Display**
```tsx
// แสดง wallets ทั้งหมด
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  {wallets.map(wallet => (
    <div key={wallet.id} className="border rounded-lg p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{wallet.walletType}</span>
        <span className={`text-xs px-2 py-1 rounded-full ${
          wallet.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {wallet.isActive ? 'Active' : 'Inactive'}
        </span>
      </div>
      <div className="text-2xl font-bold">{wallet.balanceTokens}</div>
      <div className="text-sm text-gray-500">Tokens</div>
      {wallet.expiresAt && (
        <div className="text-xs text-orange-600">
          Expires: {formatDate(wallet.expiresAt)}
        </div>
      )}
    </div>
  ))}
</div>
```

### **2. Dashboard Layout**
```
┌─────────────────────────────────────────────────────────────┐
│                    Token Dashboard                          │
├─────────────────────────────────────────────────────────────┤
│ Total Balance: 15 Tokens                                   │
│ Status: ✅ Can Create Project (1 Token required)          │
├─────────────────────────────────────────────────────────────┤
│ Token Wallets:                                             │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐          │
│ │STANDARD │ │PREMIUM  │ │ BONUS   │ │ TRIAL   │          │
│ │   5     │ │   10    │ │   0     │ │   0     │          │
│ │ Active  │ │ Active  │ │ Inactive│ │ Inactive│          │
│ └─────────┘ └─────────┘ └─────────┘ └─────────┘          │
├─────────────────────────────────────────────────────────────┤
│ Transaction History:                                       │
│ • PROJECT_CREATION: -1 Token (STANDARD)                   │
│ • DAILY_RESET: +5 Token (STANDARD)                        │
│ • ADMIN_ADJUSTMENT: +10 Token (PREMIUM)                   │
└─────────────────────────────────────────────────────────────┘
```

## 🔧 **Migration Strategy**

### **Phase 1: Create TokenWallet Table**
```sql
-- สร้าง TokenWallet table
CREATE TABLE "TokenWallet" (...);

-- สร้าง WalletType enum
CREATE TYPE "WalletType" AS ENUM ('STANDARD', 'PREMIUM', 'BONUS', 'TRIAL');

-- Migrate existing data
INSERT INTO "TokenWallet" (id, userId, balanceTokens, lastTokenReset, walletType)
SELECT 
  gen_random_uuid(),
  id,
  COALESCE("balanceTokens", 5),
  COALESCE("lastTokenReset", NOW()),
  'STANDARD'
FROM "User";
```

### **Phase 2: Update Application Code**
```typescript
// เปลี่ยนจาก
const user = await prisma.user.findUnique({
  where: { id: userId },
  select: { balanceTokens: true }
});

// เป็น
const summary = await tokenWalletService.getUserTokenSummary(userId);
const totalBalance = summary.totalBalance;
```

### **Phase 3: Remove Old Columns**
```sql
-- ลบ columns เก่าออกจาก User table
ALTER TABLE "User" DROP COLUMN "balanceTokens";
ALTER TABLE "User" DROP COLUMN "lastTokenReset";
```

## 🎯 **สรุป**

### **✅ ข้อดี**
- **Flexibility**: รองรับ multiple wallets และ types
- **Security**: แยก Token data จาก User data
- **Scalability**: Scale แยกต่างหาก
- **Business Logic**: รองรับ business requirements ซับซ้อน

### **📋 Files ที่สร้างใหม่**
```
src/libs/billing/
├── tokenWalletService.ts     // จัดการ TokenWallet
├── tokenLedgerService.ts     // อัปเดตให้ใช้ TokenWallet
└── tokenPricing.ts           // ราคา Token

src/app/api/billing/
├── wallets/route.ts          // API สำหรับ TokenWallet
└── balance/route.ts          // API สำหรับ balance (อัปเดต)

src/app/(app)/(billing)/dashboard/
└── page.tsx                  // อัปเดตให้แสดง TokenWallets
```

### **🚀 พร้อมใช้งาน**
ระบบ TokenWallet พร้อมใช้งานแล้ว! รองรับ:
- Multiple wallets per user
- Wallet types (STANDARD, PREMIUM, BONUS, TRIAL)
- Expiration handling
- Priority-based token deduction
- Comprehensive dashboard
