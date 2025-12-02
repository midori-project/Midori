# Visual Edit Mode - Bug Fixes

## 🐛 ปัญหาที่พบ

### ปัญหา #1: Invalid JSX - Wrapped Attribute Values
**Error:**
```
Unexpected token (10:25)
<img src="<span data-editable='true'>https://...</span>" />
```

**สาเหตุ:** Renderer wrap **ทุก placeholder** รวมถึง attribute values (src, href, alt)

**การแก้ไข:**
- เพิ่ม `isAttributeValue()` method เพื่อตรวจสอบ
- แก้ `renderBlock()` ให้ skip wrapping สำหรับ attribute values
- เพิ่ม `data-editable` attributes ใน template img tags โดยตรง

---

### ปัญหา #2: คลิกแล้วไม่มีอะไรเกิดขึ้น - Events ถูก Capture โดย React
**อาการ:** 
- เปิด Edit Mode แล้ว
- Hover/Click บน elements แล้วไม่มีอะไรเกิดขึ้น
- Links และ buttons ทำงานปกติ

**สาเหตุ:** 
1. React Router จับ click events บน Links ก่อน
2. ไม่ได้ freeze หน้าเว็บ
3. Events ไม่ได้ใช้ capture phase

**การแก้ไข:**

#### 1. เพิ่ม Page Freeze (Pointer Events)
```javascript
// ใน visual-edit.js
if (editModeEnabled) {
  // FREEZE ทุกอย่าง
  document.body.style.pointerEvents = 'none';
  // ENABLE เฉพาะ editable elements
  document.querySelectorAll('[data-editable]').forEach(el => {
    el.style.pointerEvents = 'auto';
  });
}
```

#### 2. ใช้ CSS Freeze ด้วย
```css
/* FREEZE ทุก element */
.midori-edit-mode * {
  pointer-events: none !important;
}

/* ENABLE เฉพาะ editable */
.midori-edit-mode [data-editable] {
  pointer-events: auto !important;
}

/* ENABLE child elements ของ editable ด้วย */
.midori-edit-mode [data-editable] * {
  pointer-events: auto !important;
}
```

#### 3. ใช้ Capture Phase
```javascript
// จับ events ก่อน React
document.addEventListener('click', handler, true); // capture phase
document.addEventListener('mouseover', handler, true);
document.addEventListener('mouseout', handler, true);
```

#### 4. Stop All Events
```javascript
e.preventDefault();
e.stopPropagation();
e.stopImmediatePropagation(); // หยุดทุก listener
```

---

## ✅ สรุพการแก้ไข

### ไฟล์ที่แก้ไข:

1. **renderer.ts**
   - เพิ่ม `isAttributeValue()` method
   - แก้ `renderBlock()` skip wrapping attributes
   - ✅ No linter errors

2. **shared-blocks/index.ts**
   - เพิ่ม data attributes ใน hero-basic `<img>`
   - ✅ No linter errors

3. **variants/about-variants.ts**
   - เพิ่ม data attributes ใน aboutImage (3 จุด)
   - ✅ No linter errors

4. **variants/hero-variants.ts**
   - เพิ่ม data attributes ใน heroImage (4 จุด)
   - ✅ No linter errors

5. **visual-edit.js**
   - เพิ่ม page freeze logic (pointer-events)
   - เพิ่ม CSS freeze rules
   - ใช้ capture phase ใน event listeners
   - เพิ่ม stopImmediatePropagation()
   - ✅ Updated

6. **PreviewContent.tsx**
   - เพิ่ม debug logs สำหรับ script injection
   - เพิ่ม error handling
   - เพิ่ม connection test
   - ✅ No linter errors

---

## 🧪 วิธีทดสอบ

### 1. ตรวจสอบ Console Logs

เมื่อเปิดหน้า preview ควรเห็น:
```
✅ Preview loaded: https://...
🎨 Visual edit script injected to iframe
🎨 Visual edit script loaded
✅ Visual Edit script initialized
```

### 2. เปิด Edit Mode (Alt + E)

ควรเห็น:
```
🎨 Toggle edit mode: true
🔒 Page frozen - only editable elements clickable
🎨 Edit mode: ON
```

### 3. Hover บน Elements

- ควรเห็น **blue dashed outline**
- ควอเห็น **tooltip** แสดงชื่อ field
- Links/buttons ไม่ทำงาน (frozen)

### 4. คลิกบน Element

ควรเห็น:
```
🎯 Element clicked: {blockId: "hero-basic", field: "heading", ...}
📤 Sending to parent: {...}
```

และ **panel ทางขวา** ควรปรากฏขึ้น

### 5. แก้ไขและบันทึก

- พิมพ์ข้อความใหม่
- กด Save
- Preview ควร refresh
- ข้อความควรเปลี่ยน

---

## 🔍 Troubleshooting

### ถ้า Script ไม่ Load:
```
❌ Visual edit script failed to load - check if /scripts/visual-edit.js exists
```

**วิธีแก้:**
- ตรวจสอบว่าไฟล์อยู่ที่ `Midori/public/scripts/visual-edit.js`
- Restart dev server

### ถ้า Cannot Access Iframe:
```
⚠️ Cannot access iframe content - possible CORS issue
```

**วิธีแก้:**
- Preview URL ต้องเป็น same origin
- หรือต้อง configure CORS headers

### ถ้า Elements ไม่มี Outline:
- ตรวจสอบว่า data attributes ถูก render หรือไม่
- เปิด Inspector ดูใน iframe ว่ามี `data-editable="true"` หรือไม่
- ลอง regenerate project

---

## 📋 Checklist

- [x] แก้ไข renderer.ts ให้ skip wrapping attributes
- [x] เพิ่ม data attributes ใน templates
- [x] เพิ่ม page freeze logic
- [x] ใช้ capture phase ใน events
- [x] เพิ่ม debug logs
- [x] เพิ่ม error handling

---

**Updated:** 15 ตุลาคม 2025  
**Status:** ✅ Fixed & Ready for testing

