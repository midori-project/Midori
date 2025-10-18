# Cloudflare R2 Setup Guide

## 📋 ภาพรวม

คู่มือการตั้งค่า Cloudflare R2 สำหรับเก็บรูปภาพใน Visual Edit Mode

---

## 🚀 ขั้นตอนการ Setup

### 1. สร้าง R2 Bucket

1. เข้า Cloudflare Dashboard: https://dash.cloudflare.com/
2. เลือก **R2** จากเมนูด้านซ้าย
3. คลิก **"Create bucket"**
4. ตั้งชื่อ: `project-images` (หรือชื่ออื่นที่ต้องการ)
5. เลือก Location: **Automatic** (หรือเลือกเฉพาะ region)
6. คลิก **"Create bucket"**

### 2. สร้าง API Token (R2 Token)

1. ใน R2 Dashboard คลิก **"Manage R2 API Tokens"**
2. คลิก **"Create API token"**
3. ตั้งค่า:
   ```
   Token name: midori-r2-upload
   
   Permissions:
   ✅ Object Read & Write
   
   Bucket scope:
   ✅ Apply to specific buckets only
      → เลือก: project-images
   
   TTL: Never expires (หรือกำหนดเวลา)
   ```
4. คลิก **"Create API Token"**
5. **คัดลอกและเก็บรักษา:**
   ```
   Access Key ID: xxxxxxxxxxxxxxxxxxxx
   Secret Access Key: yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy
   ```
   ⚠️ **คำเตือน:** Secret Key จะแสดงครั้งเดียว! เก็บไว้ให้ดี

### 3. ตั้งค่า Public Access (ถ้าต้องการ)

**วิธีที่ 1: ใช้ Public Bucket URL**
- R2 จะให้ public URL อัตโนมัติ: `https://pub-xxx.r2.dev`
- ไม่ต้องตั้งค่าอะไรเพิ่ม

**วิธีที่ 2: Custom Domain (แนะนำสำหรับ Production)**
1. ใน Bucket settings → **"Public buckets"**
2. คลิก **"Connect domain"**
3. เพิ่ม custom domain: `images.yourdomain.com`
4. ตั้ง DNS record ตามที่ Cloudflare แนะนำ
5. รอ SSL provision (อัตโนมัติ)

---

## ⚙️ Environment Variables

เพิ่มใน `.env.local`:

```env
# Storage Provider
STORAGE_PROVIDER=cloudflare-r2

# Cloudflare R2
CLOUDFLARE_ACCOUNT_ID=your_account_id_here
CLOUDFLARE_R2_ACCESS_KEY_ID=xxxxxxxxxxxxxxxxxxxx
CLOUDFLARE_R2_SECRET_ACCESS_KEY=yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy
CLOUDFLARE_R2_BUCKET_NAME=project-images

# Public URL (เลือก 1 ใน 2)
# Option 1: ใช้ R2 public URL
CLOUDFLARE_R2_PUBLIC_URL=https://pub-xxx.r2.dev

# Option 2: ใช้ custom domain
# CLOUDFLARE_R2_PUBLIC_URL=https://images.yourdomain.com

# Jurisdiction (optional - default: global)
CLOUDFLARE_R2_JURISDICTION=global
```

### หา Account ID:
1. เข้า Cloudflare Dashboard
2. คลิก R2
3. ดูที่ URL: `https://dash.cloudflare.com/**{account_id}**/r2/overview`
4. หรือดูที่ sidebar ด้านขวา → **"Account ID"**

---

## 📦 Install Dependencies

```bash
npm install @aws-sdk/client-s3 nanoid
```

---

## 🧪 ทดสอบการทำงาน

### 1. เปิด Test Page

```
http://localhost:3000/test/storage
```

### 2. ทดสอบ Upload

1. เลือกไฟล์รูปภาพ (max 10MB)
2. คลิก **"📤 Upload"**
3. ควรเห็น:
   - ✅ Upload Success
   - URL ของรูปที่อัพโหลด
   - Preview รูป

### 3. ทดสอบ List

1. ใส่ prefix: `test/` (หรือเว้นว่างเพื่อดูทั้งหมด)
2. คลิก **"📋 List Files"**
3. ควอเห็นรายการไฟล์ที่อัพโหลดไว้

### 4. ทดสอบ Delete

1. คลิก **"🗑️ Delete"** ข้างไฟล์ที่ต้องการลบ
2. Confirm
3. ไฟล์ควรหายจากรายการ

---

## 🔍 Troubleshooting

### ❌ Error: "AccessDenied"

**สาเหตุ:**
- API Token ไม่มีสิทธิ์เข้าถึง bucket

**วิธีแก้:**
1. ตรวจสอบว่า Token มี **Object Read & Write** permission
2. ตรวจสอบว่า Bucket scope ถูกต้อง
3. ลองสร้าง Token ใหม่

### ❌ Error: "NoSuchBucket"

**สาเหตุ:**
- Bucket name ไม่ถูกต้อง
- Account ID ผิด

**วิธีแก้:**
1. ตรวจสอบ `CLOUDFLARE_R2_BUCKET_NAME`
2. ตรวจสอบ `CLOUDFLARE_ACCOUNT_ID`

### ❌ Error: "Cannot read properties of undefined"

**สาเหตุ:**
- Environment variables ไม่ครบ

**วิธีแก้:**
1. ตรวจสอบ `.env.local` มีครบทุก field
2. Restart dev server: `npm run dev`

### ❌ รูปอัพโหลดแล้วแต่เปิดไม่ได้

**สาเหตุ:**
- Bucket ยังไม่เปิด public access

**วิธีแก้:**
- ใช้ Public Bucket URL หรือ Custom Domain (ดู Step 3 ด้านบน)

---

## 📊 Cost Estimate

| Operation | Price | Free Tier |
|-----------|-------|-----------|
| Storage | $0.015/GB/month | 10 GB |
| Class A Operations (writes) | $4.50/million | 1 million/month |
| Class B Operations (reads) | $0.36/million | 10 million/month |
| **Egress (ดาวน์โหลด)** | **$0** ✨ | **Unlimited** |

**ตัวอย่าง:**
- เก็บรูป 1,000 รูป (average 500KB) = 500MB
- Upload 1,000 รูป/เดือน = 1,000 Class A ops
- Download 100,000 ครั้ง/เดือน = 100,000 Class B ops

**Cost = $0** (อยู่ใน Free Tier) 🎉

---

## 🔐 Security Best Practices

1. ✅ **ใช้ Account API Token** (ไม่ใช่ Global API Key)
2. ✅ **จำกัด Bucket Scope** เฉพาะที่ต้องการ
3. ✅ **ไม่ commit `.env.local`** ลง Git
4. ✅ **Rotate Token** ทุก 3-6 เดือน
5. ✅ **แยก Token** dev/staging/production
6. ✅ **เปิด CORS** เฉพาะ domain ที่ต้องการ

---

## 📝 Next Steps

หลังจาก setup สำเร็จแล้ว:

1. ✅ ทดสอบใน `/test/storage` page
2. ✅ Integrate กับ Visual Edit API
3. ✅ เพิ่ม Image Upload UI ใน VisualEditPanel
4. ✅ บันทึก URL ลง Database (ImageAsset model)

---

## 🔗 Links

- [Cloudflare R2 Docs](https://developers.cloudflare.com/r2/)
- [R2 Pricing](https://developers.cloudflare.com/r2/pricing/)
- [AWS SDK for JavaScript v3](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/)

---

**สร้างเมื่อ:** 18 ตุลาคม 2025  
**เวอร์ชัน:** 1.0  
**สถานะ:** Ready to use 🚀

