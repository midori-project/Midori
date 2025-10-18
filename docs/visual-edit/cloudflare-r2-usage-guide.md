# Cloudflare R2 Usage Guide - Midori Visual Edit

## 📋 ภาพรวม

คู่มือการใช้งาน Cloudflare R2 สำหรับระบบ Visual Edit Mode ใน Midori - ครอบคลุมการ setup, การใช้งาน, และ best practices

---

## 🏗️ สถาปัตยกรรมระบบ

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   User Upload   │───▶│  Cloudflare R2  │───▶│  Supabase DB    │
│   (Frontend)    │    │   (Storage)     │    │  (Metadata)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │  Public URL     │
                       │  (Display)      │
                       └─────────────────┘
```

### หลักการออกแบบ:
- **แยก Storage กับ Database** → ย้ายได้ง่าย
- **เก็บไฟล์จริงใน R2** → ประหยัดค่าใช้จ่าย
- **เก็บ metadata ใน Supabase** → ง่ายต่อการ query
- **Public URL สำหรับแสดงรูป** → โหลดเร็ว

---

## ⚙️ การตั้งค่า (Setup)

### 1. Environment Variables

```env
# Storage Provider
STORAGE_PROVIDER=cloudflare-r2

# Cloudflare R2 Configuration
CLOUDFLARE_ACCOUNT_ID=832594a3255fccbb6b3f3e3136b321cc
CLOUDFLARE_R2_ACCESS_KEY_ID=your_access_key_id
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your_secret_access_key
CLOUDFLARE_R2_BUCKET_NAME=midori
CLOUDFLARE_R2_PUBLIC_URL=https://pub-832594a3255fccbb6b3f3e3136b321cc.r2.dev
CLOUDFLARE_R2_JURISDICTION=global
```

### 2. Dependencies

```bash
npm install @aws-sdk/client-s3 nanoid
```

### 3. Cloudflare R2 Setup

1. **สร้าง Bucket:**
   - ชื่อ: `midori` (หรือตามต้องการ)
   - Location: `Asia-Pacific (APAC)`

2. **สร้าง API Token:**
   - Permissions: `Object Read & Write`
   - Bucket scope: `midori` (เฉพาะ bucket ที่ต้องการ)

3. **เปิด Public Access:**
   - Settings → Public Development URL → Enable
   - ได้ Public URL: `https://pub-xxx.r2.dev`

---

## 🛠️ API Endpoints

### 📤 Upload File
```http
POST /api/test/storage/upload
Content-Type: multipart/form-data

FormData:
- file: [File] (required)
```

**Response:**
```json
{
  "success": true,
  "data": {
    "filename": "test/abc123def456.jpg",
    "url": "https://pub-xxx.r2.dev/test/abc123def456.jpg",
    "size": 245678,
    "type": "image/jpeg",
    "uploadedAt": "2025-10-18T10:30:00.000Z"
  }
}
```

### 📋 List Files
```http
GET /api/test/storage/list?prefix=test/
```

**Response:**
```json
{
  "success": true,
  "data": {
    "count": 5,
    "prefix": "test/",
    "files": [
      {
        "path": "test/abc123def456.jpg",
        "url": "https://pub-xxx.r2.dev/test/abc123def456.jpg"
      }
    ]
  }
}
```

### 🗑️ Delete File
```http
DELETE /api/test/storage/delete?path=test/abc123def456.jpg
```

**Response:**
```json
{
  "success": true,
  "data": {
    "path": "test/abc123def456.jpg",
    "deletedAt": "2025-10-18T10:35:00.000Z"
  }
}
```

---

## 💻 การใช้งานใน Code

### 1. Storage Service

```typescript
import { getStorageProvider } from '@/libs/services/storageService'

// Get storage provider (Cloudflare R2)
const storage = getStorageProvider()

// Upload file
const publicUrl = await storage.upload(file, 'test/abc123.jpg')

// Get public URL
const url = storage.getPublicUrl('test/abc123.jpg')

// Delete file
await storage.delete('test/abc123.jpg')

// List files
const files = await storage.list('test/')
```

### 2. Upload Handler

```typescript
// Frontend upload
const handleUpload = async (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  
  const response = await fetch('/api/test/storage/upload', {
    method: 'POST',
    body: formData
  })
  
  const result = await response.json()
  
  if (result.success) {
    console.log('Uploaded:', result.data.url)
    return result.data.url
  } else {
    throw new Error(result.error)
  }
}
```

### 3. Database Integration

```typescript
// Save to Supabase
const imageAsset = await prisma.imageAsset.create({
  data: {
    projectId: 'proj-123',
    provider: 'cloudflare-r2',
    meta: {
      url: 'https://pub-xxx.r2.dev/test/abc123.jpg',
      filename: 'user-photo.jpg',
      size: 245678,
      mimeType: 'image/jpeg',
      altText: 'User profile photo',
      uploadedAt: new Date().toISOString()
    }
  }
})
```

---

## 🧪 การทดสอบ

### 1. Test Page
```
http://localhost:3000/test/storage
```

**Features:**
- ✅ Upload images (drag & drop)
- ✅ List files with prefix filter
- ✅ Delete files
- ✅ Image preview
- ✅ Real-time feedback

### 2. Manual Testing

```bash
# Upload
curl -X POST http://localhost:3000/api/test/storage/upload \
  -F "file=@/path/to/image.jpg"

# List
curl "http://localhost:3000/api/test/storage/list?prefix=test/"

# Delete
curl -X DELETE "http://localhost:3000/api/test/storage/delete?path=test/abc123.jpg"
```

---

## 💰 ต้นทุน (Cost Analysis)

### Free Tier Limits:
| Service | Free Tier | ราคา |
|---------|-----------|------|
| **Storage** | 10 GB | $0.015/GB/เดือน |
| **Class A (Upload)** | 1M requests/เดือน | $4.50/M requests |
| **Class B (Download)** | 10M requests/เดือน | $0.36/M requests |
| **Egress (Bandwidth)** | **Unlimited** | **$0** ✨ |

### ตัวอย่างการใช้งาน:
```
- เก็บรูป 1,000 รูป (average 500KB) = 500MB
- Upload 1,000 รูป/เดือน = 1,000 Class A ops
- Download 100,000 ครั้ง/เดือน = 100,000 Class B ops

Cost = $0 (อยู่ใน Free Tier) 🎉
```

---

## 🔒 ความปลอดภัย (Security)

### ✅ ปลอดภัย:
- **Random filename** - ไม่คาดเดาได้
- **No directory listing** - ไม่เห็นรายการไฟล์
- **API token control** - จำกัดสิทธิ์การเข้าถึง
- **HTTPS only** - เข้ารหัสการส่งข้อมูล

### ⚠️ ข้อควรระวัง:
- **Public URL** - ใครรู้ URL ก็เข้าถึงได้
- **No authentication** - ไม่มี login required
- **URL อาจรั่ว** - ผ่าน browser history, logs

### 🛡️ Best Practices:

```typescript
// ✅ ใช้ random filename
const filename = `${nanoid()}.${ext}`  // abc123def456.jpg

// ✅ Validate file type
if (!file.type.startsWith('image/')) {
  throw new Error('Invalid file type')
}

// ✅ จำกัดขนาดไฟล์
if (file.size > 5 * 1024 * 1024) {  // 5MB
  throw new Error('File too large')
}

// ✅ เก็บ metadata ใน database
await prisma.imageAsset.create({
  data: {
    projectId,
    meta: { url, filename, size, uploadedBy }
  }
})
```

---

## 🔄 การย้าย Provider (Migration)

### เปลี่ยน Provider:
```env
# เปลี่ยนแค่ env variable
STORAGE_PROVIDER=aws-s3  # หรือ cloudflare-r2
```

### ย้ายไฟล์เก่า:
```typescript
// Migration script
const oldImages = await prisma.imageAsset.findMany({
  where: { provider: 'supabase' }
})

for (const img of oldImages) {
  const oldUrl = img.meta.url
  const file = await fetch(oldUrl).then(r => r.blob())
  
  // Upload to new provider
  const newUrl = await storage.upload(file, img.meta.filename)
  
  // Update database
  await prisma.imageAsset.update({
    where: { id: img.id },
    data: {
      provider: 'cloudflare-r2',
      meta: { ...img.meta, url: newUrl }
    }
  })
}
```

---

## 📊 เปรียบเทียบกับ Supabase Storage

| Feature | Cloudflare R2 | Supabase Storage |
|---------|---------------|------------------|
| **Setup** | ⚠️ ซับซ้อนกว่า | ✅ ง่าย (ใช้ Supabase อยู่แล้ว) |
| **Cost** | ✅ ถูกกว่า (no egress) | ⚠️ มีค่า egress |
| **Performance** | ✅ CDN ทั่วโลก | ✅ ดี |
| **Migration** | ✅ ย้ายได้ง่าย | ⚠️ ผูกกับ Supabase |
| **Free Tier** | ✅ ใหญ่กว่า | ⚠️ เล็กกว่า |
| **Image Processing** | ❌ ไม่มี | ✅ มี (resize, crop) |
| **Security** | ⚠️ Public URLs | ✅ Signed URLs |

---

## 🚀 การใช้งานใน Visual Edit Mode

### 1. VisualEditPanel Integration

```typescript
// src/components/projects/VisualEditPanel.tsx
const handleImageUpload = async (file: File) => {
  setIsUploading(true)
  
  try {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('projectId', projectId)
    
    const response = await fetch('/api/upload/image', {
      method: 'POST',
      body: formData
    })
    
    const data = await response.json()
    
    if (data.success) {
      setValue(data.url)  // Update image URL
      toast.success('อัพโหลดรูปสำเร็จ!')
    }
  } catch (error) {
    toast.error('อัพโหลดล้มเหลว')
  } finally {
    setIsUploading(false)
  }
}
```

### 2. Database Schema

```prisma
model ImageAsset {
  id        String      @id @default(uuid())
  projectId String
  briefId   String?
  fileId    String?     // ไม่ใช้ (เก็บ URL ใน meta แทน)
  provider  String?     // "cloudflare-r2"
  meta      Json?       // { url, filename, size, altText }
  createdAt DateTime    @default(now())
  
  project   Project     @relation(...)
}
```

---

## 🔮 Roadmap อนาคต

### Phase 1 (ปัจจุบัน):
- ✅ Cloudflare R2 setup
- ✅ Test API working
- ✅ Basic upload/delete/list

### Phase 2 (อนาคต):
- 🔜 Image optimization (resize, compress)
- 🔜 Multiple providers support
- 🔜 Signed URLs (สำหรับข้อมูลลับ)
- 🔜 CDN custom domain
- 🔜 Image processing pipeline
- 🔜 Bulk operations

---

## 🐛 Troubleshooting

### ❌ Error: "AccessDenied"
**สาเหตุ:** API Token ไม่มีสิทธิ์
**วิธีแก้:** ตรวจสอบ permissions ใน Cloudflare Dashboard

### ❌ Error: "NoSuchBucket"
**สาเหตุ:** Bucket name ผิด
**วิธีแก้:** ตรวจสอบ `CLOUDFLARE_R2_BUCKET_NAME`

### ❌ Error: "Cannot read properties of undefined"
**สาเหตุ:** Environment variables ไม่ครบ
**วิธีแก้:** ตรวจสอบ `.env.local` และ restart dev server

### ❌ รูปอัพโหลดแล้วแต่เปิดไม่ได้
**สาเหตุ:** Public access ไม่เปิด
**วิธีแก้:** เปิด Public Development URL ใน Cloudflare Dashboard

---

## 📝 Checklist การใช้งาน

### Setup:
- [ ] สร้าง Cloudflare R2 bucket
- [ ] สร้าง API token
- [ ] เปิด Public access
- [ ] ตั้งค่า environment variables
- [ ] Install dependencies
- [ ] ทดสอบ API endpoints

### Development:
- [ ] ใช้ random filename
- [ ] Validate file type & size
- [ ] เก็บ metadata ใน database
- [ ] Handle errors gracefully
- [ ] Cleanup unused files

### Production:
- [ ] ใช้ custom domain
- [ ] Monitor usage & costs
- [ ] Setup backup strategy
- [ ] Implement rate limiting
- [ ] Security audit

---

## 🔗 Links & Resources

- [Cloudflare R2 Documentation](https://developers.cloudflare.com/r2/)
- [R2 Pricing](https://developers.cloudflare.com/r2/pricing/)
- [AWS SDK for JavaScript v3](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/)
- [Test Page: /test/storage](http://localhost:3000/test/storage)

---

**สร้างเมื่อ:** 18 ตุลาคม 2025  
**เวอร์ชัน:** 1.0  
**สถานะ:** Production Ready 🚀  
**ผู้ดูแล:** Midori Development Team
