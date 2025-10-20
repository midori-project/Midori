# 📖 Guides - คู่มือการใช้งาน

คู่มือการใช้งาน Visual Edit Mode และระบบที่เกี่ยวข้อง

---

## 📚 เอกสารในโฟลเดอร์นี้

### 🔧 **Setup & Configuration**

#### [Cloudflare R2 Setup](cloudflare-r2-setup.md)
- การตั้งค่า Cloudflare R2
- Environment variables
- Bucket configuration
- CORS settings

#### [Cloudflare R2 Usage Guide](cloudflare-r2-usage-guide.md)
- คู่มือการใช้งาน R2 แบบละเอียด
- API documentation
- Security best practices
- Cost optimization
- Troubleshooting

### 🖼️ **Image Processing**

#### [Image Compression Guide](image-compression-guide.md)
- การบีบอัดรูปภาพอัตโนมัติ
- Configuration options
- Performance benchmarks
- Best practices
- Troubleshooting

---

## 🚀 เริ่มต้นใช้งาน

### **สำหรับ Developer ใหม่**
1. เริ่มจาก [Cloudflare R2 Setup](cloudflare-r2-setup.md)
2. อ่าน [R2 Usage Guide](cloudflare-r2-usage-guide.md)
3. ศึกษา [Image Compression Guide](image-compression-guide.md)

### **สำหรับ DevOps**
1. ดู [R2 Setup](cloudflare-r2-setup.md) สำหรับ production
2. อ่าน [R2 Usage Guide](cloudflare-r2-usage-guide.md) สำหรับ optimization
3. ศึกษา security และ cost optimization

### **สำหรับ QA/Testing**
1. อ่าน [Image Compression Guide](image-compression-guide.md)
2. ทดสอบ compression settings
3. ตรวจสอบ performance metrics

---

## 📊 Performance Targets

| Feature | Target | Current |
|---------|--------|---------|
| **Compression Ratio** | 80%+ | 85.3% ✅ |
| **Upload Speed** | 3x faster | 5-6x ✅ |
| **Storage Cost** | 70% savings | 85% ✅ |
| **Page Load** | 3x faster | 5-6x ✅ |

---

## 🔧 Configuration Examples

### **Image Compression**
```typescript
const options = {
  maxSizeMB: 1,           // บีบอัดให้เหลือไม่เกิน 1MB
  maxWidthOrHeight: 1920, // ขนาดสูงสุด 1920px
  useWebWorker: true,     // ใช้ Web Worker
  fileType: 'image/webp', // Convert เป็น WebP
  initialQuality: 0.85    // Quality 85%
};
```

### **Cloudflare R2**
```typescript
const config = {
  accountId: process.env.CLOUDFLARE_ACCOUNT_ID,
  accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
  secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
  bucketName: process.env.CLOUDFLARE_R2_BUCKET_NAME,
  region: 'auto'
};
```

---

## 🎯 Best Practices

### **Image Compression**
- ✅ ใช้ Web Worker เพื่อไม่ block UI
- ✅ ตั้งค่า quality ที่เหมาะสม (0.85)
- ✅ Convert เป็น WebP สำหรับ browser สมัยใหม่
- ✅ แสดง progress indicator

### **Cloudflare R2**
- ✅ ใช้ signed URLs สำหรับ security
- ✅ ตั้งค่า CORS ที่เหมาะสม
- ✅ ใช้ CDN integration
- ✅ Monitor usage และ costs

---

## 🚨 Common Issues

### **Compression Issues**
- **Problem:** Compression ช้าเกินไป
- **Solution:** ลด `maxWidthOrHeight` หรือ `initialQuality`

### **R2 Issues**
- **Problem:** Upload failed
- **Solution:** ตรวจสอบ CORS settings และ credentials

---

**Created by:** Midori Development Team  
**Date:** 20 ตุลาคม 2025
