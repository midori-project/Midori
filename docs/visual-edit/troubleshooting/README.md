# 🔧 Troubleshooting - การแก้ไขปัญหา

คู่มือการแก้ไขปัญหา Visual Edit Mode และระบบที่เกี่ยวข้อง

---

## 📚 เอกสารในโฟลเดอร์นี้

### 🚨 **Error Fixes**

#### [VISUAL_EDIT_API_FIX.md](VISUAL_EDIT_API_FIX.md)
- การแก้ไข Visual Edit API errors
- BlockId mapping issues
- Regex pattern problems
- Step-by-step solutions

#### [Visual Edit Fixes](visual-edit-fixes.md)
- การแก้ไขปัญหาต่างๆ ใน Visual Edit
- Common issues และ solutions
- Performance optimization
- Code fixes

### 🛠️ **General Troubleshooting**

#### [Visual Edit Troubleshooting](visual-edit-troubleshooting.md)
- คู่มือแก้ไขปัญหาทั่วไป
- Debugging steps
- Performance issues
- User experience problems

---

## 🚨 Common Issues & Solutions

### **Visual Edit API Errors**

#### ❌ **Field Not Found Error**
```
❌ [VISUAL-EDIT ERROR] Field "heroImage" not found in src/components/Hero.tsx
POST /api/visual-edit/apply 500 in 2414ms
```

**สาเหตุ:** BlockId mapping ชี้ไปยัง path ที่ผิด

**วิธีแก้:**
1. ตรวจสอบ `getComponentPath()` ใน `apply/route.ts`
2. ใช้ `src/components/` path แทน `template-system/`
3. ตรวจสอบไฟล์ใน Daytona sandbox

#### ❌ **Upload Failed Error**
```
❌ [UPLOAD] Upload failed: CORS error
```

**สาเหตุ:** CORS settings ไม่ถูกต้อง

**วิธีแก้:**
1. ตรวจสอบ Cloudflare R2 CORS settings
2. เพิ่ม domain ที่อนุญาต
3. ตรวจสอบ API endpoint configuration

### **Image Upload Issues**

#### ❌ **Compression Failed**
```
⚠️ [UI] Compression failed, uploading original
```

**สาเหตุ:** browser-image-compression library error

**วิธีแก้:**
1. ตรวจสอบ file type และ size
2. ลด compression settings
3. ใช้ fallback to original file

#### ❌ **File Too Large**
```
❌ [UPLOAD] File too large (max 10MB). Your file: 15.2 MB
```

**สาเหตุ:** ไฟล์ใหญ่เกิน limit

**วิธีแก้:**
1. ลดขนาดไฟล์ก่อนอัปโหลด
2. เพิ่ม maxSize limit (ถ้าจำเป็น)
3. ใช้ compression ที่แรงขึ้น

### **Performance Issues**

#### ❌ **Slow Upload**
```
Upload taking more than 10 seconds
```

**สาเหตุ:** Network หรือ compression ช้า

**วิธีแก้:**
1. ตรวจสอบ network connection
2. ลด compression quality
3. ใช้ Web Worker
4. Optimize file size

#### ❌ **High Memory Usage**
```
Browser memory usage high during compression
```

**สาเหตุ:** Large files หรือ inefficient compression

**วิธีแก้:**
1. ลด `maxWidthOrHeight`
2. ใช้ `useWebWorker: true`
3. Process files in chunks
4. Clear memory after processing

---

## 🔍 Debugging Steps

### **1. Check Console Logs**

**Frontend (Browser Console):**
```javascript
// เปิด Browser DevTools → Console
// ดู logs ที่ขึ้นต้นด้วย:
🖼️ [UI] Starting image upload...
🔄 [UI] Compressing image...
✅ [UI] Upload successful!
```

**Backend (Terminal):**
```bash
# ดู logs ใน terminal ที่รัน npm run dev
📁 [UPLOAD] File received:
📊 [COMPRESSION] Metrics:
✅ [UPLOAD] Upload successful!
```

### **2. Check Network Tab**

**Browser DevTools → Network:**
- ตรวจสอบ API calls
- ดู response status codes
- ตรวจสอบ request/response data

### **3. Check Database**

**Supabase Dashboard:**
```sql
-- ตรวจสอบ ImageAsset table
SELECT * FROM "ImageAsset" 
WHERE "projectId" = 'your-project-id' 
ORDER BY "createdAt" DESC 
LIMIT 10;
```

### **4. Check Cloudflare R2**

**Cloudflare Dashboard:**
- ตรวจสอบ bucket contents
- ดู file permissions
- ตรวจสอบ CORS settings

---

## 🛠️ Quick Fixes

### **Reset Visual Edit State**
```javascript
// ใน Browser Console
localStorage.clear();
sessionStorage.clear();
location.reload();
```

### **Clear Upload Cache**
```javascript
// ลบ cached files
if ('caches' in window) {
  caches.keys().then(names => {
    names.forEach(name => {
      caches.delete(name);
    });
  });
}
```

### **Reset API State**
```bash
# Restart dev server
npm run dev
```

---

## 📊 Performance Monitoring

### **Key Metrics to Monitor**

| Metric | Good | Warning | Critical |
|--------|------|---------|----------|
| **Upload Time** | < 2s | 2-5s | > 5s |
| **Compression Time** | < 1s | 1-3s | > 3s |
| **File Size Reduction** | > 70% | 50-70% | < 50% |
| **Error Rate** | < 1% | 1-5% | > 5% |

### **Monitoring Tools**
- Browser DevTools Performance tab
- Network tab for API calls
- Console logs for errors
- Database query performance

---

## 🚨 Emergency Procedures

### **If Visual Edit Completely Broken**

1. **Check API Status**
   ```bash
   curl -X POST http://localhost:3000/api/visual-edit/apply \
     -H "Content-Type: application/json" \
     -d '{"test": true}'
   ```

2. **Check Database Connection**
   ```sql
   SELECT COUNT(*) FROM "ImageAsset";
   ```

3. **Check Cloudflare R2**
   - Login to Cloudflare Dashboard
   - Check R2 bucket status
   - Verify credentials

4. **Rollback if Necessary**
   ```bash
   git checkout HEAD~1
   npm run dev
   ```

---

## 📞 Support Escalation

### **Level 1: Self-Service**
- ตรวจสอบ documentation
- ใช้ troubleshooting guide
- Check console logs

### **Level 2: Developer Support**
- ตรวจสอบ code และ configuration
- Debug API endpoints
- Check database และ storage

### **Level 3: Infrastructure Support**
- ตรวจสอบ Cloudflare R2
- Check network และ DNS
- Verify environment variables

---

## 🎯 Prevention

### **Best Practices**
- ✅ Test changes in development first
- ✅ Monitor performance metrics
- ✅ Keep documentation updated
- ✅ Regular backup ของ configuration

### **Monitoring**
- ✅ Set up alerts สำหรับ errors
- ✅ Monitor upload success rates
- ✅ Track performance metrics
- ✅ Regular health checks

---

**Created by:** Midori Development Team  
**Date:** 20 ตุลาคม 2025
