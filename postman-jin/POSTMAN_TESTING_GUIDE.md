# 🚀 คู่มือการทดสอบ Template API ด้วย Postman

## 📁 ไฟล์ที่เกี่ยวข้อง

1. **`postman-template-api-test.json`** - Postman Collection
2. **`postman-test-bodies.json`** - JSON Bodies สำหรับทดสอบ
3. **`online-shop-enhanced.api.json`** - Template ที่ปรับปรุงแล้ว
4. **`pages-components.json`** - ไฟล์ Pages และ Components

---

## 🛠️ การติดตั้งและใช้งาน

### 1. Import Postman Collection

```bash
# เปิด Postman
# คลิก Import
# เลือกไฟล์: postman-template-api-test.json
```

### 2. ตั้งค่า Environment Variables

สร้าง Environment ใหม่ใน Postman:

```json
{
  "base_url": "http://localhost:3000",
  "template_id": "",
  "project_id": "",
  "template_create_body": "",
  "json_template_body": ""
}
```

### 3. Copy JSON Bodies

จากไฟล์ `postman-test-bodies.json`:
- Copy `template_create_body` → ใส่ใน variable `template_create_body`
- Copy `json_template_body` → ใส่ใน variable `json_template_body`

---

## 🧪 ลำดับการทดสอบ

### **Step 1: สร้าง Template ใหม่**
```http
POST {{base_url}}/api/template
Content-Type: application/json

Body: {{template_create_body}}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "template": {
      "id": "uuid-here",
      "key": "online-shop-enhanced",
      "label": "Online Shop Enhanced Template"
    },
    "meta": { "id": "meta-uuid", "status": "published" },
    "initialVersion": 1
  }
}
```

**⚠️ สำคัญ:** บันทึก `template.id` ใส่ใน variable `template_id`

### **Step 2: เพิ่ม Version ใหม่**
```http
POST {{base_url}}/api/template?action=version
Content-Type: application/json

Body: {
  "templateId": "{{template_id}}",
  "version": 2,
  "semver": "1.1.0",
  "status": "published",
  "sourceFiles": [...]
}
```

### **Step 3: ดึงรายการ Templates**
```http
GET {{base_url}}/api/template?category=e-commerce&status=published&limit=10
```

### **Step 4: ดึง Template Source Files**
```http
GET {{base_url}}/api/template?action=source&category=e-commerce
```

### **Step 5: เติม Placeholder ด้วย AI**
```http
POST {{base_url}}/api/template/placeholder
Content-Type: application/json

Body: {
  "templateId": "{{template_id}}",
  "theme": "modern cozy; primary:sky-600; accent:amber-400; radius:xl; elevation:lg; grid:3; header:underlined; font:inter; imagery:\"coffee latte art\"; tone:thai-casual",
  "projectId": "demo-project",
  "action": "fill_placeholders"
}
```

### **Step 6: ตรวจสอบ Placeholder**
```http
POST {{base_url}}/api/template/placeholder
Content-Type: application/json

Body: {
  "templateId": "{{template_id}}",
  "theme": "modern",
  "action": "validate"
}
```

### **Step 7: อัพโหลด JSON Template**
```http
PUT {{base_url}}/api/template/placeholder
Content-Type: application/json

Body: {{json_template_body}}
```

### **Step 8: สร้าง Project จาก Template**
```http
POST {{base_url}}/api/projects
Content-Type: application/json

Body: {
  "name": "Coffee Delight Shop",
  "description": "ร้านกาแฟออนไลน์ที่สร้างจาก template",
  "templateId": "{{template_id}}",
  "theme": "modern cozy; primary:sky-600; accent:amber-400",
  "customizations": {
    "brandName": "Coffee Delight",
    "primaryColor": "sky-600",
    "imagery": "coffee latte art"
  }
}
```

### **Step 9: ดึง Project Preview**
```http
GET {{base_url}}/api/projects/{{project_id}}/preview
```

---

## 🎯 Template Features ที่ทดสอบ

### ✅ **Pages ที่ครบถ้วน:**
- **Home** - หน้าแรกพร้อม Hero, Features, CTA
- **About** - เกี่ยวกับเรา พร้อม Story, Values, Team
- **Contact** - ติดต่อ พร้อม Form และ Contact Info
- **Products** - รายการสินค้า พร้อม Filter และ Search
- **ProductDetail** - รายละเอียดสินค้า พร้อม Gallery
- **Cart** - ตะกร้าสินค้า
- **Checkout** - ชำระเงิน
- **NotFound** - หน้า 404

### ✅ **Components ที่ครบถ้วน:**
- **Header** - Navigation พร้อม Mobile Menu
- **Footer** - Footer พร้อม Links และ Newsletter
- **ProductCard** - การ์ดสินค้า
- **CartSummary** - สรุปตะกร้า

### ✅ **Placeholder Support:**
- **`<tw/>`** - Tailwind classes (45+ instances)
- **`<text/>`** - ข้อความภาษาไทย (28+ instances)
- **`<img/>`** - รูปภาพ (12+ instances)
- **`<data key="..."/>`** - ข้อมูลโครงสร้าง (8+ instances)

### ✅ **Routes ที่เชื่อมโยงกัน:**
```typescript
<Routes>
  <Route path="/" element={<Home />} />
  <Route path="/about" element={<About />} />
  <Route path="/contact" element={<Contact />} />
  <Route path="/products" element={<Products />} />
  <Route path="/products/:slug" element={<ProductDetail />} />
  <Route path="/cart" element={<Cart />} />
  <Route path="/checkout" element={<Checkout />} />
  <Route path="*" element={<NotFound />} />
</Routes>
```

---

## 🔍 การตรวจสอบผลลัพธ์

### **1. Template Creation**
- ✅ Template สร้างสำเร็จ
- ✅ Version 1 สร้างสำเร็จ
- ✅ Source files บันทึกสำเร็จ
- ✅ Slots และ Constraints บันทึกสำเร็จ

### **2. Placeholder Filling**
- ✅ AI เติม `<tw/>` เป็น Tailwind classes
- ✅ AI เติม `<text/>` เป็นข้อความภาษาไทย
- ✅ AI เติม `<img/>` เป็น URL รูปภาพ
- ✅ AI เติม `<data/>` เป็นข้อมูลโครงสร้าง

### **3. Theme Application**
- ✅ Primary color: `sky-600`
- ✅ Accent color: `amber-400`
- ✅ Border radius: `xl`
- ✅ Elevation: `lg`
- ✅ Font: `inter`
- ✅ Imagery: `coffee latte art`
- ✅ Tone: `thai-casual`

### **4. Build & Preview**
- ✅ TypeScript build ผ่าน
- ✅ React Router ทำงานถูกต้อง
- ✅ Tailwind CSS ทำงานถูกต้อง
- ✅ Responsive design ทำงานถูกต้อง

---

## 🚨 Troubleshooting

### **Error: Template key already exists**
```json
{
  "error": "Template key already exists"
}
```
**Solution:** เปลี่ยน `key` ใน template หรือลบ template เดิม

### **Error: Template not found**
```json
{
  "error": "Template not found"
}
```
**Solution:** ตรวจสอบ `template_id` ใน environment variables

### **Error: AI API failed**
```json
{
  "error": "Failed to fill placeholders"
}
```
**Solution:** ตรวจสอบ `QUESTION_API_KEY` ใน environment variables

### **Error: Validation failed**
```json
{
  "error": "Validation failed",
  "details": [...]
}
```
**Solution:** ตรวจสอบ JSON structure และ required fields

---

## 📊 Expected Results

### **Template Statistics:**
- **Files:** 8 source files
- **Placeholders:** 93 total placeholders
  - `<tw/>`: 45 instances
  - `<text/>`: 28 instances
  - `<img/>`: 12 instances
  - `<data/>`: 8 instances
- **Routes:** 8 routes
- **Components:** 4 main components
- **Pages:** 8 pages

### **Performance Metrics:**
- **Build Time:** < 30 seconds
- **Bundle Size:** < 2MB
- **Lighthouse Score:** 
  - Performance: ≥ 90
  - Accessibility: ≥ 90
  - Best Practices: ≥ 90
  - SEO: ≥ 90

---

## 🎉 Success Criteria

✅ **Template สร้างสำเร็จ**  
✅ **Placeholder เติมด้วย AI สำเร็จ**  
✅ **Theme ใช้ได้ถูกต้อง**  
✅ **Routes เชื่อมโยงกันได้**  
✅ **Build ผ่าน**  
✅ **Preview ทำงานได้**  
✅ **Responsive Design**  
✅ **TypeScript ไม่มี Error**  

**🎯 Template พร้อมใช้งานสำหรับ Production!**
