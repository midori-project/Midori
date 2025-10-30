# 🪙 Unified Token System - Design & Implementation Guide

## 📋 Overview

ระบบ Token แบบรวม (Unified Token System) ที่มีการแยก Wallet ตามประเภท แต่ผู้ใช้เห็นยอดรวมเท่านั้น

## 🎯 Design Decision

### ✅ เลือก: **Unified Token System** (รวม Tokens เข้าด้วยกัน)

**เหตุผล:**
1. ✅ **Simpler UX** - ผู้ใช้เห็นแค่ยอดรวม ไม่ต้องคิดว่าจะใช้ Token แบบไหน
2. ✅ **Auto Priority** - ระบบจัดการลำดับการใช้ Token อัตโนมัติ
3. ✅ **Already Built** - Database schema รองรับแล้ว (WalletType enum)
4. ✅ **Flexible** - รองรับการขยายความสามารถในอนาคต

### ❌ ไม่เลือก: **Separate Token Types** (แยก FREE และ PAID)

**เหตุผล:**
1. ❌ **Confusing UX** - ผู้ใช้ต้องเลือกว่าจะใช้ Token แบบไหนทุกครั้ง
2. ❌ **Complex Logic** - ต้องเขียน logic การเลือก Token หลายที่
3. ❌ **Poor Experience** - ผู้ใช้ซื้อ Token แต่ต้องเลือกใช้เอง

## 🏗️ System Architecture

### Wallet Hierarchy (ลำดับความสำคัญ)

```
User's Total Balance = SUM of all wallets
    ↓
ลำดับการใช้ Token (Priority):
    1. TRIAL (ทดลองใช้ - หมดอายุเร็วสุด)
    2. STANDARD (ได้ฟรีทุกวัน - 5 tokens)
    3. BONUS (โบนัส/โปรโมชั่น)
    4. PREMIUM (ซื้อมา - ไม่หมดอายุ)
```

### Token Flow

```
User สร้างเว็บไซต์ (1.5 tokens)
    ↓
TokenWalletService.deductTokens()
    ↓
หา Wallet ลำดับความสำคัญ:
    1. TRIAL มี 3 tokens → ใช้ 3 tokens → เหลือ 0
    2. STANDARD มี 5 tokens → ใช้ 0.5 tokens → เหลือ 4.5
    ↓
User เห็น Total Balance = 4.5 tokens (รวมทุก wallets)
```

## 📊 Database Schema

### TokenWallet Table

```typescript
model TokenWallet {
  id                String             @id @default(uuid())
  userId            String
  balanceTokens     Decimal            @default(5) @db.Decimal(10, 2)
  lastTokenReset    DateTime?          @default(now())
  walletType        WalletType         @default(STANDARD)
  isActive          Boolean            @default(true)
  expiresAt         DateTime?
  createdAt         DateTime           @default(now())
  updatedAt         DateTime           @updatedAt
  tokenTransactions TokenTransaction[]
  user              User               @relation(...)
}
```

### WalletType Enum

```typescript
enum WalletType {
  STANDARD    // ได้ฟรีทุกวัน (5 tokens)
  PREMIUM     // ซื้อมา (ไม่หมดอายุ)
  BONUS       // โบนัส/โปรโมชั่น
  TRIAL       // ทดลองใช้ (หมดอายุเร็ว)
}
```

## 💰 Pricing Strategy

### Free Tokens (STANDARD)

- **จำนวน:** 5 tokens / วัน
- **รีเซ็ต:** ทุก 0:00 น.
- **ลักษณะ:** ใช้งานได้ 24 ชั่วโมง
- **ค่าใช้จ่าย:** ฟรี

### Paid Tokens (PREMIUM)

- **จำนวน:** ซื้อตามแพคเกจ
- **รีเซ็ต:** ไม่รีเซ็ต (ใช้ได้จนหมด)
- **ลักษณะ:** ไม่หมดอายุ
- **ค่าใช้จ่าย:** ดูใน TOKEN_PACKAGES

### Token Packages

| Package | Tokens | Price (THB) | Price (USD) | Bonus | Value |
|---------|--------|-------------|-------------|-------|-------|
| Starter | 20 | ฿299 | $9.99 | 0 | ฿15/token |
| Pro ⭐ | 50 | ฿649 | $19.99 | 5 | ฿13/token |
| Business | 150 | ฿1,699 | $49.99 | 25 | ฿11/token |
| Enterprise | 500 | ฿4,999 | $149.99 | 100 | ฿10/token |

## 🎨 User Interface

### Pricing Page (`/pricing`)

**Features:**
- แสดงแพคเกจทั้งหมด
- แสดง "Best Value" badge
- ปุ่มซื้อแต่ละแพคเกจ
- FAQ section
- Info cards อธิบายระบบ

**Components:**
- `PricingCard.tsx` - แสดงแพคเกจ
- `PurchaseModal.tsx` - Modal ยืนยันการซื้อ
- `page.tsx` - Pricing page

### Dashboard (Existing)

**Features:**
- แสดง Total Balance (รวมทุก wallets)
- รายละเอียด Wallets (เฉพาะ ADMIN)

## 🔧 Implementation

### 1. Token Deduction Logic

```typescript
// src/libs/billing/tokenWalletService.ts

async deductTokens(userId: string, amount: number) {
  const walletPriority = ['TRIAL', 'STANDARD', 'BONUS', 'PREMIUM'];
  
  for (const walletType of walletPriority) {
    const wallet = await findWallet(userId, walletType);
    if (wallet && wallet.balanceTokens >= remainingAmount) {
      // หักจาก wallet นี้
      return deductFromWallet(wallet.id, remainingAmount);
    }
  }
}
```

### 2. Token Display

```typescript
// User เห็นแค่ Total Balance
const summary = await tokenWalletService.getUserTokenSummary(userId);
displayTotalBalance(summary.totalBalance); // 15 tokens (รวมทุก wallets)

// ADMIN เห็นรายละเอียด
summary.wallets.forEach(wallet => {
  console.log(`${wallet.walletType}: ${wallet.balanceTokens} tokens`);
});
```

### 3. Purchase Flow

```
User → คลิก "ซื้อเลย"
  ↓
PurchaseModal → ยืนยันการซื้อ
  ↓
API: POST /api/payment/create-checkout
  ↓
Redirect to Payment Page (Stripe/Omise)
  ↓
Payment Success → webhook
  ↓
API: POST /api/payment/webhook
  ↓
Create PREMIUM wallet with purchased tokens
  ↓
Record Transaction
```

## 🧪 Testing

### Manual Testing

1. **Free Token Flow:**
   - Login → เห็น 5 tokens (STANDARD)
   - สร้างเว็บไซต์ → ใช้ 1.5 tokens → เหลือ 3.5 tokens
   - รอ 24 ชม. → รีเซ็ตเป็น 5 tokens

2. **Paid Token Flow:**
   - ไปที่ `/pricing`
   - เลือกแพคเกจ Pro (50 tokens)
   - ซื้อ
   - หลังจากชำระ → มี PREMIUM wallet 55 tokens (รวมโบนัส)
   - Total balance = 5 + 55 = 60 tokens

3. **Priority Usage:**
   - มี TRIAL 3, STANDARD 5, PREMIUM 50
   - สร้างเว็บไซต์ → ใช้ TRIAL 3 tokens แล้วใช้ STANDARD 1.5 tokens
   - เหลือ TRIAL 0, STANDARD 3.5, PREMIUM 50

## 📁 Files Created/Modified

### Created
```
src/
├── app/
│   ├── (app)/(billing)/
│   │   └── pricing/
│   │       └── page.tsx                        # Pricing page
│   └── api/
│       └── payment/
│           └── create-checkout/
│               └── route.ts                    # Create payment checkout
├── components/
│   └── pricing/
│       ├── PricingCard.tsx                     # Package card
│       └── PurchaseModal.tsx                   # Purchase confirmation
└── libs/billing/
    └── tokenPricing.ts                         # Updated with packages
```

### Modified
- `src/libs/billing/tokenWalletService.ts` - Priority-based deduction
- `src/libs/billing/tokenLedgerService.ts` - Grant tokens

## 🚧 TODO (Next Steps)

1. **Payment Integration:**
   - [ ] Integrate Stripe API
   - [ ] Integrate Omise API (for Thailand)
   - [ ] Webhook handling for payment success

2. **Purchase System:**
   - [ ] Create payment table in database
   - [ ] Purchase history page
   - [ ] Receipt generation

3. **Additional Features:**
   - [ ] Referral system (รับโบนัส tokens)
   - [ ] Subscription plans (monthly/yearly)
   - [ ] Gift tokens feature

## 💡 Benefits

### For Users
- ✅ Simple - ไม่ต้องคิดเรื่อง Token types
- ✅ Flexible - ใช้ทั้งฟรีและซื้อได้
- ✅ Clear - เห็นยอดรวม Token ที่มี
- ✅ Fair - ใช้ FREE Tokens ก่อน

### For Business
- ✅ Flexible - เปลี่ยน pricing ได้ง่าย
- ✅ Trackable - ติดตามการใช้ Token แต่ละประเภท
- ✅ Scalable - เพิ่ม Wallet types ได้
- ✅ Monetizable - ขาย Token ได้หลายแพคเกจ

## 📝 Summary

**Unified Token System** เป็นระบบที่มีความสมดุลระหว่าง:
- **Simplicity** (ใช้งานง่าย) กับ **Flexibility** (ยืดหยุ่น)
- **Free Usage** (ใช้งานฟรี) กับ **Monetization** (ทำเงิน)
- **User Experience** (ประสบการณ์ผู้ใช้) กับ **Business Goals** (เป้าหมายธุรกิจ)

ระบบนี้จะช่วยให้ผู้ใช้ได้ประโยชน์สูงสุด ขณะเดียวกันก็สร้างรายได้ให้กับแพลตฟอร์มได้อย่างยั่งยืน! 🚀

