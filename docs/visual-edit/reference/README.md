# 📋 Reference - เอกสารอ้างอิง

เอกสารอ้างอิงสำหรับ Visual Edit Mode และระบบที่เกี่ยวข้อง

---

## 📚 เอกสารในโฟลเดอร์นี้

### 📖 **Quick Reference**

#### [Quick Reference](quick-reference.md)
- อ้างอิงด่วนสำหรับ Visual Edit
- Commands และ shortcuts
- Key concepts
- Quick troubleshooting

#### [README](README.md)
- เอกสารอ้างอิงเดิม
- Basic information
- Getting started guide

---

## 🚀 Quick Start

### **Visual Edit Mode**
```bash
# เปิด Visual Edit Mode
Alt + E

# หรือคลิกปุ่ม Visual Edit ใน toolbar
```

### **Image Upload**
```typescript
// ตัวอย่างการใช้งาน
const handleImageUpload = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('projectId', projectId);
  formData.append('blockId', blockId);
  formData.append('field', field);
  
  const response = await fetch('/api/visual-edit/upload-image', {
    method: 'POST',
    body: formData
  });
  
  const result = await response.json();
  return result.url;
};
```

---

## 🔧 API Reference

### **Upload Image API**
```typescript
POST /api/visual-edit/upload-image

// Request
FormData {
  file: File,
  projectId: string,
  blockId: string,
  field: string,
  originalSize?: string,
  compressed?: string
}

// Response
{
  success: boolean,
  url: string,
  imageAssetId: string,
  meta: {
    filename: string,
    size: number,
    type: string,
    blockId: string,
    field: string
  }
}
```

### **Apply Changes API**
```typescript
POST /api/visual-edit/apply

// Request
{
  sandboxId: string,
  projectId: string,
  blockId: string,
  field: string,
  value: string,
  type?: 'text' | 'heading' | 'subheading' | 'button' | 'image'
}

// Response
{
  success: boolean,
  message: string,
  data: {
    blockId: string,
    field: string,
    newValue: string,
    componentPath: string
  }
}
```

---

## 🗄️ Database Schema

### **ImageAsset Table**
```sql
model ImageAsset {
  id        String      @id @default(uuid())
  projectId String
  briefId   String?
  fileId    String?
  provider  String?     -- "cloudflare-r2"
  meta      Json?       -- URL, metadata, compression info
  createdAt DateTime    @default(now())
  
  brief     ImageBrief? @relation(fields: [briefId], references: [id])
  file      File?       @relation(fields: [fileId], references: [id])
  project   Project     @relation(fields: [projectId], references: [id], onDelete: Cascade)
}
```

### **Meta Field Structure**
```json
{
  "url": "https://pub-xxx.r2.dev/projects/123/visual-edit/1234567890-abc123.jpg",
  "blockId": "hero-basic",
  "field": "heroImage",
  "filename": "photo.jpg",
  "originalName": "my-photo.jpg",
  "size": 1258291,
  "type": "image/webp",
  "uploadedAt": "2025-10-20T10:30:00.000Z",
  "uploadedVia": "visual-edit",
  "compression": {
    "enabled": true,
    "originalSize": 8912345,
    "compressedSize": 1258291,
    "reduction": 85.9,
    "savedBytes": 7654054
  }
}
```

---

## ⚙️ Configuration

### **Image Compression Settings**
```typescript
const compressionOptions = {
  maxSizeMB: 1,           // บีบอัดให้เหลือไม่เกิน 1MB
  maxWidthOrHeight: 1920, // ขนาดสูงสุด 1920px
  useWebWorker: true,     // ใช้ Web Worker (ไม่ block UI)
  fileType: 'image/webp', // Convert เป็น WebP
  initialQuality: 0.85    // Quality 85%
};
```

### **Cloudflare R2 Configuration**
```typescript
const r2Config = {
  accountId: process.env.CLOUDFLARE_ACCOUNT_ID,
  accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
  secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
  bucketName: process.env.CLOUDFLARE_R2_BUCKET_NAME,
  region: 'auto'
};
```

### **Environment Variables**
```env
# Cloudflare R2
CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_R2_ACCESS_KEY_ID=your_access_key
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your_secret_key
CLOUDFLARE_R2_BUCKET_NAME=your_bucket_name

# Database
DATABASE_URL=your_database_url

# Daytona
DAYTONA_API_KEY=your_daytona_api_key
```

---

## 🎯 BlockId Mapping

### **Component Paths**
```typescript
const componentMap = {
  'hero': 'src/components/Hero.tsx',
  'hero-basic': 'src/components/Hero.tsx',
  'about': 'src/components/About.tsx',
  'about-basic': 'src/components/About.tsx',
  'features': 'src/components/Features.tsx',
  'features-basic': 'src/components/Features.tsx',
  'cta': 'src/components/CTA.tsx',
  'cta-basic': 'src/components/CTA.tsx',
  'footer': 'src/components/Footer.tsx',
  'footer-basic': 'src/components/Footer.tsx',
  'header': 'src/components/Header.tsx',
  'header-basic': 'src/components/Header.tsx',
  'navbar': 'src/components/Navbar.tsx',
  'navbar-basic': 'src/components/Navbar.tsx',
  'menu': 'src/components/Menu.tsx',
  'menu-basic': 'src/components/Menu.tsx',
  'contact': 'src/components/Contact.tsx',
  'contact-basic': 'src/components/Contact.tsx'
};
```

---

## 📊 Performance Benchmarks

### **Compression Results**
| Original | Format | Size | → | Compressed | Format | Size | Reduction |
|----------|--------|------|---|------------|--------|------|-----------|
| photo1.jpg | JPEG | 8.5 MB | → | photo1.webp | WebP | 1.2 MB | **85.9%** |
| image2.png | PNG | 10.2 MB | → | image2.webp | WebP | 1.5 MB | **85.3%** |
| banner.jpg | JPEG | 6.8 MB | → | banner.webp | WebP | 0.9 MB | **86.8%** |
| product.png | PNG | 4.2 MB | → | product.webp | WebP | 0.7 MB | **83.3%** |

**เฉลี่ย: ลดขนาด 85.3%**

### **Speed Improvements**
| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| **Upload Time** | 5-8 วินาที | 0.8-1.5 วินาที | **5-6x ⚡** |
| **Page Load** | 3-5 วินาที | 0.5-1 วินาที | **5-6x ⚡** |
| **Storage Cost** | $0.127/month | $0.019/month | **85% 💰** |

---

## 🔍 Debugging Commands

### **Check API Status**
```bash
# Test upload API
curl -X POST http://localhost:3000/api/visual-edit/upload-image \
  -F "file=@test.jpg" \
  -F "projectId=test" \
  -F "blockId=hero-basic" \
  -F "field=heroImage"

# Test apply API
curl -X POST http://localhost:3000/api/visual-edit/apply \
  -H "Content-Type: application/json" \
  -d '{
    "sandboxId": "test",
    "projectId": "test",
    "blockId": "hero-basic",
    "field": "heroImage",
    "value": "https://example.com/image.jpg"
  }'
```

### **Database Queries**
```sql
-- ดูรูปภาพทั้งหมดในโปรเจค
SELECT 
  id,
  meta->>'url' as image_url,
  meta->>'originalName' as filename,
  meta->>'field' as field_name,
  meta->'compression'->>'reduction' as compression_percent,
  "createdAt"
FROM "ImageAsset"
WHERE "projectId" = 'your-project-id'
ORDER BY "createdAt" DESC;

-- ดูรูปภาพที่ถูกบีบอัดมากที่สุด
SELECT 
  id,
  meta->>'originalName' as filename,
  (meta->'compression'->>'originalSize')::bigint / 1024 / 1024 as original_mb,
  (meta->'compression'->>'compressedSize')::bigint / 1024 / 1024 as compressed_mb,
  (meta->'compression'->>'reduction')::float as reduction_percent
FROM "ImageAsset"
WHERE meta->'compression'->>'enabled' = 'true'
ORDER BY (meta->'compression'->>'reduction')::float DESC
LIMIT 10;
```

---

## 🚨 Error Codes

### **Upload Errors**
| Code | Error | Solution |
|------|-------|----------|
| 400 | Missing required fields | ตรวจสอบ FormData |
| 400 | Invalid file type | ใช้ไฟล์รูปภาพเท่านั้น |
| 400 | File too large | ลดขนาดไฟล์ |
| 500 | Upload failed | ตรวจสอบ R2 configuration |

### **Apply Errors**
| Code | Error | Solution |
|------|-------|----------|
| 400 | Missing required fields | ตรวจสอบ request body |
| 500 | Field not found | ตรวจสอบ blockId mapping |
| 500 | File not found | ตรวจสอบ component path |

---

## 📞 Support

### **Quick Help**
- ตรวจสอบ [Troubleshooting Guide](../troubleshooting/)
- ดู [Implementation Docs](../implementation/)
- อ่าน [Guides](../guides/)

### **Emergency**
- ตรวจสอบ console logs
- Restart dev server
- Check environment variables

---

**Created by:** Midori Development Team  
**Date:** 20 ตุลาคม 2025