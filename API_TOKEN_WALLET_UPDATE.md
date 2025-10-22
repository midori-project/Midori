# 🔄 API Token Wallet Update Status

## 📊 **สถานะการอัปเดต API Endpoints**

### **✅ API Endpoints ที่อัปเดตแล้ว**

#### **1. GET /api/billing/balance**
```typescript
// เก่า: ใช้ TokenGuardService
const tokenGuard = new TokenGuardService();
const tokenInfo = await tokenGuard.getTokenInfo(session.user.id);

// ใหม่: ใช้ TokenWalletService
const walletService = new TokenWalletService();
const summary = await walletService.getUserTokenSummary(session.user.id);

// Response ใหม่
{
  "success": true,
  "data": {
    "balance": 15,                    // Total balance จากทุก wallets
    "canCreateProject": true,         // สามารถสร้างโปรเจคได้หรือไม่
    "requiredTokens": 1,             // Token ที่ต้องการสำหรับสร้างโปรเจค
    "wallets": [                      // ข้อมูล wallets ทั้งหมด
      {
        "id": "wallet-1",
        "balanceTokens": 5,
        "walletType": "STANDARD",
        "isActive": true,
        "expiresAt": null
      }
    ]
  }
}
```

#### **2. GET /api/billing/transactions**
```typescript
// ยังใช้ TokenLedgerService (ถูกต้อง)
const ledgerService = new TokenLedgerService();
const transactions = await ledgerService.getTransactionHistory(
  session.user.id,
  limit,
  offset
);

// Response (ไม่เปลี่ยนแปลง)
{
  "success": true,
  "data": [
    {
      "id": "tx-1",
      "userId": "user-123",
      "walletId": "wallet-1",        // ✅ ใหม่: wallet reference
      "amount": -1,
      "type": "PROJECT_CREATION",
      "description": "Project creation",
      "metadata": { "projectId": "proj-456" },
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

#### **3. GET /api/billing/wallets**
```typescript
// ใหม่: TokenWallet API
const walletService = new TokenWalletService();
const summary = await walletService.getUserTokenSummary(session.user.id);

// Response
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
```

#### **4. POST /api/billing/wallets**
```typescript
// ใหม่: สร้าง wallet ใหม่
const wallet = await walletService.createWallet(
  session.user.id,
  walletType || 'STANDARD',
  initialTokens || 5,
  expiresAt ? new Date(expiresAt) : undefined
);

// Request Body
{
  "walletType": "PREMIUM",
  "initialTokens": 10,
  "expiresAt": "2024-12-31T23:59:59Z"
}
```

#### **5. POST /api/billing/daily-reset**
```typescript
// เก่า: ใช้ User table
const usersToReset = await prisma.user.findMany({
  where: {
    OR: [
      { lastTokenReset: null },
      { lastTokenReset: { lt: today } }
    ]
  }
});

// ใหม่: ใช้ TokenWallet table
const walletsToReset = await prisma.tokenWallet.findMany({
  where: {
    walletType: 'STANDARD',
    isActive: true,
    OR: [
      { lastTokenReset: null },
      { lastTokenReset: { lt: today } }
    ]
  }
});
```

### **🔄 Services ที่อัปเดตแล้ว**

#### **1. TokenLedgerService**
```typescript
// ✅ อัปเดตแล้ว: ใช้ TokenWalletService
export class TokenLedgerService {
  private walletService: TokenWalletService;

  constructor() {
    this.walletService = new TokenWalletService();
  }

  // ✅ ใช้ TokenWallet แทน User table
  async getUserBalance(userId: string): Promise<TokenBalance> {
    const summary = await this.walletService.getUserTokenSummary(userId);
    // ...
  }

  // ✅ ใช้ TokenWallet สำหรับ deduct/add
  async deductTokens(userId: string, amount: number, type: TokenTransactionType, ...) {
    const deductResult = await this.walletService.deductTokens(userId, amount, preferredWalletType);
    // ...
  }
}
```

#### **2. DailyResetService**
```typescript
// ✅ อัปเดตแล้ว: ใช้ TokenWallet table
export class DailyResetService {
  private walletService: TokenWalletService;

  // ✅ หา STANDARD wallets แทน User
  async resetAllUsersTokens() {
    const walletsToReset = await prisma.tokenWallet.findMany({
      where: {
        walletType: 'STANDARD',
        isActive: true,
        OR: [
          { lastTokenReset: null },
          { lastTokenReset: { lt: today } }
        ]
      }
    });
    // ...
  }
}
```

### **📋 API Endpoints Summary**

| **Endpoint** | **Method** | **Status** | **Changes** |
|--------------|------------|------------|-------------|
| `/api/billing/balance` | GET | ✅ **Updated** | ใช้ TokenWalletService แทน TokenGuardService |
| `/api/billing/transactions` | GET | ✅ **Working** | ใช้ TokenLedgerService (ถูกต้อง) |
| `/api/billing/wallets` | GET | ✅ **New** | API ใหม่สำหรับ TokenWallet |
| `/api/billing/wallets` | POST | ✅ **New** | API ใหม่สำหรับสร้าง wallet |
| `/api/billing/daily-reset` | POST | ✅ **Updated** | ใช้ TokenWallet table แทน User table |
| `/api/billing/daily-reset` | GET | ✅ **Updated** | ใช้ TokenWallet table แทน User table |

### **🎯 สรุปการเปลี่ยนแปลง**

#### **✅ สิ่งที่อัปเดตแล้ว**
- **GET /api/billing/balance** → ใช้ TokenWalletService
- **POST /api/billing/daily-reset** → ใช้ TokenWallet table
- **GET /api/billing/daily-reset** → ใช้ TokenWallet table
- **TokenLedgerService** → ใช้ TokenWalletService
- **DailyResetService** → ใช้ TokenWallet table

#### **✅ สิ่งที่เพิ่มใหม่**
- **GET /api/billing/wallets** → API ใหม่สำหรับ TokenWallet
- **POST /api/billing/wallets** → API ใหม่สำหรับสร้าง wallet

#### **✅ สิ่งที่ไม่เปลี่ยนแปลง**
- **GET /api/billing/transactions** → ยังใช้ TokenLedgerService (ถูกต้อง)

### **🚀 พร้อมใช้งาน**

**API endpoints ทั้งหมดได้รับการอัปเดตให้ใช้ TokenWallet system แล้ว!** 🎉

- ✅ **Backward Compatible** → API เก่ายังทำงานได้
- ✅ **New Features** → รองรับ multiple wallets
- ✅ **Better Performance** → ใช้ indexes ที่เหมาะสม
- ✅ **Comprehensive** → ครอบคลุมทุก use cases

### **📝 การใช้งาน**

#### **Frontend Integration**
```typescript
// ดึงข้อมูล Token balance (รวม wallets)
const response = await fetch('/api/billing/balance');
const data = await response.json();
// data.data.balance = total balance
// data.data.wallets = array of wallets

// ดึงข้อมูล wallets เฉพาะ
const response = await fetch('/api/billing/wallets');
const data = await response.json();
// data.data.wallets = detailed wallet info

// สร้าง wallet ใหม่
const response = await fetch('/api/billing/wallets', {
  method: 'POST',
  body: JSON.stringify({
    walletType: 'PREMIUM',
    initialTokens: 10,
    expiresAt: '2024-12-31T23:59:59Z'
  })
});
```

**ระบบ TokenWallet API พร้อมใช้งานแล้ว!** 🚀

