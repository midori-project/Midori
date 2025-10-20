# Cloudflare R2 Usage Guide - Visual Edit Image Upload

**สร้างเมื่อ:** 20 ตุลาคม 2025  
**อัปเดต:** 20 ตุลาคม 2025  
**Version:** 1.0

---

## 📚 ภาพรวม

เอกสารนี้อธิบายวิธีการใช้งานระบบอัปโหลดรูปภาพใน Visual Edit Mode ซึ่งใช้ Cloudflare R2 เป็นที่เก็บไฟล์

---

## 🎯 ฟีเจอร์

- ✅ อัปโหลดรูปภาพจากเครื่อง user
- ✅ เก็บไฟล์บน Cloudflare R2
- ✅ บันทึก metadata ลง Supabase (Prisma)
- ✅ ดึง public URL กลับมาใช้ทันที
- ✅ รองรับ JPEG, PNG, GIF, WEBP
- ✅ จำกัดขนาดไฟล์ 10MB
- ✅ Generate filename แบบ unique
- ✅ Preview รูปภาพทันทีหลังอัปโหลด

---

## 🔧 Environment Variables

ก่อนใช้งาน ต้องตั้งค่า environment variables เหล่านี้:

### `.env` หรือ `.env.local`

```bash
# Cloudflare R2 Configuration
CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_R2_BUCKET_NAME=project-images
CLOUDFLARE_R2_ACCESS_KEY_ID=your_access_key_id
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your_secret_access_key
CLOUDFLARE_R2_PUBLIC_URL=https://pub-xxxx.r2.dev
CLOUDFLARE_R2_JURISDICTION=global

# Storage Provider (ใช้ Cloudflare R2)
STORAGE_PROVIDER=cloudflare-r2

# Database (Supabase)
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...
```

### วิธีหา Environment Variables

#### 1. Cloudflare Account ID
```bash
# เข้า Cloudflare Dashboard → คัดลอก Account ID จากหน้าแรก
# หรือดูที่ URL: https://dash.cloudflare.com/{ACCOUNT_ID}/...
```

#### 2. สร้าง R2 Bucket
```bash
# เข้า Cloudflare Dashboard → R2 → Create Bucket
# ตั้งชื่อ: project-images (หรือชื่ออื่นตามต้องการ)
# Region: Automatic (Global)
```

#### 3. สร้าง R2 API Token
```bash
# Cloudflare Dashboard → R2 → Manage R2 API Tokens
# Create API Token
# Name: midori-visual-edit
# Permissions: Object Read & Write
# คัดลอก Access Key ID และ Secret Access Key
```

#### 4. ตั้งค่า Public Access
```bash
# ที่ Bucket Settings → Public Access
# เปิด "Allow Public Access" (ถ้าต้องการให้รูปภาพเข้าถึงได้โดยไม่ต้อง auth)
# หรือใช้ Custom Domain ผ่าน Cloudflare Workers
```

#### 5. Public URL
```bash
# ถ้าใช้ R2.dev subdomain:
CLOUDFLARE_R2_PUBLIC_URL=https://pub-{account_hash}.r2.dev

# ถ้าใช้ Custom Domain:
CLOUDFLARE_R2_PUBLIC_URL=https://cdn.yourdomain.com
```

---

## 🚀 การใช้งาน

### 1. สำหรับ End Users (ผู้ใช้งานทั่วไป)

#### ขั้นตอนการอัปโหลดรูปภาพ

**1. เปิด Visual Edit Mode**
- คลิกปุ่ม "👁️ Preview" → "✏️ Edit Mode"
- หรือกด `Alt + E`

**2. คลิกที่รูปภาพที่ต้องการแก้ไข**
- Panel ทางขวาจะเปิดขึ้น

**3. อัปโหลดรูปภาพ**
- คลิกปุ่ม "📤 อัปโหลดรูปภาพ"
- เลือกไฟล์จากเครื่อง (JPEG, PNG, GIF, WEBP)
- รอจนกว่าการอัปโหลดจะเสร็จ

**4. Preview และบันทึก**
- รูปภาพจะแสดงใน Preview ทันที
- คลิก "💾 Save" เพื่อบันทึกลง database

**5. ดูผลลัพธ์**
- Preview จะ refresh และแสดงรูปใหม่

#### ทางเลือก: ใช้ URL แทนการอัปโหลด
- คลิกปุ่ม "🔗" 
- วาง URL รูปภาพจากที่อื่น
- คลิก "💾 Save"

---

### 2. สำหรับ Developers

#### API Endpoint

**POST `/api/visual-edit/upload-image`**

**Request Format:**
```typescript
// FormData (multipart/form-data)
{
  file: File,              // รูปภาพ (required)
  projectId: string,       // Project ID (required)
  blockId: string,         // Block ID (required)
  field: string            // Field name (required)
}
```

**Success Response (200):**
```json
{
  "success": true,
  "url": "https://pub-xxx.r2.dev/projects/proj123/visual-edit/1729420800000-abc123.jpg",
  "imageAssetId": "uuid-xxxx-xxxx",
  "meta": {
    "filename": "projects/proj123/visual-edit/1729420800000-abc123.jpg",
    "size": 245678,
    "type": "image/jpeg",
    "uploadedAt": "2025-10-20T10:30:00.000Z"
  }
}
```

**Error Response (400/500):**
```json
{
  "success": false,
  "error": "File too large (max 10MB). Your file: 12.5 MB"
}
```

#### การใช้งานใน Code

**Frontend - Upload Image:**
```typescript
const handleImageUpload = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('projectId', projectId);
  formData.append('blockId', 'hero-basic');
  formData.append('field', 'heroImage');
  
  const response = await fetch('/api/visual-edit/upload-image', {
    method: 'POST',
    body: formData
  });
  
  const result = await response.json();
  
  if (result.success) {
    console.log('Uploaded URL:', result.url);
    // ใช้ URL นี้ในการแสดงผล
  }
};
```

**Backend - Storage Service:**
```typescript
import { getStorageProvider } from '@/libs/services/storageService';

// Upload ไฟล์
const storage = getStorageProvider();
const publicUrl = await storage.upload(file, filename);

// Delete ไฟล์
await storage.delete(filename);

// List ไฟล์
const files = await storage.list('projects/proj123/');

// Get Public URL
const url = storage.getPublicUrl(filename);
```

---

## 📁 File Structure

### Filename Pattern
```
projects/{projectId}/visual-edit/{timestamp}-{nanoid}.{ext}
```

**ตัวอย่าง:**
```
projects/cm2abc123/visual-edit/1729420800000-xyz9876543.jpg
projects/cm2def456/visual-edit/1729420801234-abc1234567.png
```

### Directory Structure บน R2
```
r2://project-images/
├── projects/
│   ├── cm2abc123/
│   │   └── visual-edit/
│   │       ├── 1729420800000-xyz9876543.jpg
│   │       ├── 1729420801234-abc1234567.png
│   │       └── ...
│   ├── cm2def456/
│   │   └── visual-edit/
│   │       └── ...
│   └── ...
└── test/
    └── (test uploads)
```

---

## 💾 Database Schema

### ImageAsset Table

```prisma
model ImageAsset {
  id        String      @id @default(uuid())
  projectId String      // FK to Project
  briefId   String?     
  fileId    String?     
  provider  String?     // "cloudflare-r2"
  meta      Json?       // Metadata (see below)
  createdAt DateTime    @default(now())
  
  project   Project     @relation(...)
}
```

### Meta JSON Structure
```json
{
  "url": "https://pub-xxx.r2.dev/projects/proj123/visual-edit/...",
  "blockId": "hero-basic",
  "field": "heroImage",
  "filename": "projects/proj123/visual-edit/1729420800000-xyz.jpg",
  "originalName": "my-photo.jpg",
  "size": 245678,
  "type": "image/jpeg",
  "uploadedAt": "2025-10-20T10:30:00.000Z",
  "uploadedVia": "visual-edit"
}
```

### Query ตัวอย่าง

**ดึงรูปภาพทั้งหมดของโปรเจค:**
```typescript
const images = await prisma.imageAsset.findMany({
  where: {
    projectId: 'cm2abc123',
    provider: 'cloudflare-r2'
  },
  orderBy: { createdAt: 'desc' }
});
```

**ดึงรูปภาพตาม block และ field:**
```typescript
const images = await prisma.imageAsset.findMany({
  where: {
    projectId: 'cm2abc123',
    meta: {
      path: ['blockId'],
      equals: 'hero-basic'
    }
  }
});
```

---

## ⚙️ Configuration Options

### File Validation

**ในไฟล์ `upload-image/route.ts`:**
```typescript
// Allowed MIME types
const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

// Max file size (10MB)
const maxSize = 10 * 1024 * 1024;
```

### R2 Configuration

**ในไฟล์ `storageService.ts`:**
```typescript
// Bucket name
this.bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME || 'project-images';

// Public URL
this.publicUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL || `https://pub-${accountId}.r2.dev`;

// Jurisdiction (global, eu, fedramp)
const jurisdiction = process.env.CLOUDFLARE_R2_JURISDICTION || 'global';

// Cache Control
CacheControl: 'public, max-age=31536000, immutable'
```

---

## 🧪 Testing

### Manual Testing

**1. ทดสอบ Upload API:**
```bash
# ใช้ curl
curl -X POST http://localhost:3000/api/visual-edit/upload-image \
  -F "file=@/path/to/image.jpg" \
  -F "projectId=cm2abc123" \
  -F "blockId=hero-basic" \
  -F "field=heroImage"
```

**2. ทดสอบผ่าน UI:**
- เปิด Visual Edit Mode
- คลิกรูปภาพ
- อัปโหลดไฟล์ทดสอบ
- ตรวจสอบ console logs
- ตรวจสอบ Network tab (DevTools)

**3. ตรวจสอบ Database:**
```sql
-- ดู ImageAsset records
SELECT * FROM "ImageAsset" 
WHERE "projectId" = 'cm2abc123'
ORDER BY "createdAt" DESC;
```

**4. ตรวจสอบ R2:**
- เข้า Cloudflare Dashboard → R2 → Bucket
- ดูว่าไฟล์ถูกอัปโหลดหรือไม่
- ลองเข้า public URL

### Test Cases

**✅ ควรสำเร็จ:**
- อัปโหลด JPEG 2MB
- อัปโหลด PNG 5MB
- อัปโหลด WEBP 1MB
- อัปโหลด GIF 3MB

**❌ ควร Error:**
- อัปโหลดไฟล์ที่ไม่ใช่รูปภาพ (PDF, TXT)
- อัปโหลดไฟล์ > 10MB
- ไม่ส่ง projectId
- ไม่ส่ง file

---

## 🐛 Troubleshooting

### ปัญหา #1: Upload Failed - Access Denied

**อาการ:**
```
Upload failed: Access Denied
```

**สาเหตุ:**
- R2 API Token ไม่ถูกต้อง
- Token ไม่มีสิทธิ์ Object Write

**วิธีแก้:**
1. ตรวจสอบ `CLOUDFLARE_R2_ACCESS_KEY_ID` และ `SECRET_ACCESS_KEY`
2. สร้าง API Token ใหม่ที่มี Object Write permission
3. อัปเดต environment variables
4. Restart dev server

---

### ปัญหา #2: URL ไม่สามารถเข้าถึงได้

**อาการ:**
```
Failed to load image: 403 Forbidden
```

**สาเหตุ:**
- Bucket ไม่เปิด Public Access
- หรือ Public URL ไม่ถูกต้อง

**วิธีแก้:**
1. **Option A: เปิด Public Access**
   - Cloudflare Dashboard → R2 → Bucket Settings
   - เปิด "Allow Public Access"
   - ใช้ R2.dev subdomain

2. **Option B: ใช้ Custom Domain**
   - เพิ่ม Custom Domain ผ่าน Cloudflare Workers
   - อัปเดต `CLOUDFLARE_R2_PUBLIC_URL`

---

### ปัญหา #3: File Too Large

**อาการ:**
```
File too large (max 10MB). Your file: 12.5 MB
```

**สาเหตุ:**
- ไฟล์มีขนาดเกิน 10MB

**วิธีแก้:**
1. **ลด resolution:** Resize รูปภาพให้เล็กลง
2. **Compress:** ใช้เครื่องมือ compress (TinyPNG, Squoosh)
3. **เพิ่ม limit (ไม่แนะนำ):** แก้ `maxSize` ใน `route.ts`

---

### ปัญหา #4: Database Error

**อาการ:**
```
Prisma error: Field 'projectId' not found
```

**สาเหตุ:**
- Database schema ไม่ sync
- ตาราง ImageAsset ไม่มี

**วิธีแก้:**
```bash
# Generate Prisma Client
npx prisma generate

# Push schema to database
npx prisma db push

# หรือ run migration
npx prisma migrate dev
```

---

### ปัญหา #5: Environment Variables ไม่ Load

**อาการ:**
```
Error: Missing CLOUDFLARE_ACCOUNT_ID
```

**สาเหตุ:**
- ไฟล์ `.env` ไม่อยู่ในตำแหน่งที่ถูกต้อง
- ชื่อ variable ผิด

**วิธีแก้:**
1. ตรวจสอบว่ามีไฟล์ `.env` หรือ `.env.local` ที่ root
2. ตรวจสอบชื่อ variables ว่าถูกต้อง
3. Restart dev server (Next.js ต้อง restart เพื่อโหลด env)

---

## 📊 Performance & Cost

### Cloudflare R2 Pricing

**Storage:**
- **$0.015 per GB/month** (ถูกกว่า S3 ~10 เท่า)
- First 10GB free every month

**Operations:**
- **Class A (Write):** $4.50 per million requests
- **Class B (Read):** $0.36 per million requests

**Egress:**
- **Free!** (ไม่มีค่า bandwidth)

### ตัวอย่างการคำนวณ

**สมมติ:**
- อัปโหลด 1,000 รูป/เดือน (average 2MB/รูป)
- ผู้ใช้เข้าดูรูป 10,000 ครั้ง/เดือน

**ค่าใช้จ่าย:**
```
Storage: 1,000 × 2MB = 2GB
  → $0.015 × 2 = $0.03

Uploads (Class A): 1,000 requests
  → $4.50 / 1,000,000 × 1,000 = $0.0045

Views (Class B): 10,000 requests
  → $0.36 / 1,000,000 × 10,000 = $0.0036

Total: ~$0.04 per month
```

**เทียบกับ AWS S3:**
```
S3 Storage: $0.023 × 2 = $0.046
S3 PUT: $0.005 × 1,000 / 1,000 = $0.005
S3 GET: $0.0004 × 10,000 / 1,000 = $0.004
S3 Egress: $0.09 × 2GB × 10 = $1.80

Total: ~$1.86 per month (แพงกว่า R2 ~46 เท่า!)
```

---

## 🔐 Security Best Practices

### 1. Validate File Types
```typescript
// ใช้ MIME type validation
if (!file.type.startsWith('image/')) {
  throw new Error('Invalid file type');
}
```

### 2. Limit File Size
```typescript
// จำกัด 10MB
const maxSize = 10 * 1024 * 1024;
if (file.size > maxSize) {
  throw new Error('File too large');
}
```

### 3. Generate Unique Filenames
```typescript
// ใช้ timestamp + nanoid
const filename = `projects/${projectId}/visual-edit/${Date.now()}-${nanoid(10)}.${ext}`;
```

### 4. Sanitize Filenames
```typescript
// ไม่ใช้ชื่อไฟล์ที่ user ส่งมาโดยตรง
// ใช้ nanoid แทน
```

### 5. Set Proper CORS
```typescript
// ใน route.ts
export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      'Access-Control-Allow-Origin': '*', // หรือระบุ domain
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
```

### 6. Rate Limiting (แนะนำ)
```typescript
// ใช้ middleware หรือ upstash/ratelimit
import { Ratelimit } from '@upstash/ratelimit';

const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(10, '1 m'), // 10 requests per minute
});
```

---

## 📚 References

- [Cloudflare R2 Documentation](https://developers.cloudflare.com/r2/)
- [AWS SDK for JavaScript v3](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)

---

## 🤝 Support

หากมีปัญหาหรือคำถาม:

1. ตรวจสอบ console logs (Browser DevTools และ Server)
2. ดู Troubleshooting section ด้านบน
3. ตรวจสอบ Cloudflare R2 Dashboard
4. ตรวจสอบ Database records

---

**สร้างโดย:** Midori Development Team  
**เวอร์ชัน:** 1.0  
**Last Updated:** 20 ตุลาคม 2025
