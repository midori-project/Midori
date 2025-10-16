# Visual Edit Mode - Troubleshooting Guide

## 🔍 ขั้นตอนการ Debug

### Step 1: ตรวจสอบว่า Project มี Embedded Script หรือไม่

**สำคัญมาก:** Project ต้อง **regenerate** ถึงจะมี visual edit script!

#### วิธีตรวจสอบ:
1. เปิด Preview
2. Right-click ในหน้า preview → **View Page Source** (หรือ Inspect Element)
3. กด Ctrl+F ค้นหา: `Visual Edit script loaded`
4. ถ้า **เจอ** → มี script ✅
5. ถ้า **ไม่เจอ** → ต้อง regenerate project ❌

---

### Step 2: Regenerate Project (ถ้ายังไม่มี Script)

#### วิธีที่ 1: สร้าง Project ใหม่
1. ไปหน้า Projects
2. คลิก "Create New Project"
3. เลือก template และ generate
4. รอจนเสร็จ → จะมี script อัตโนมัติ

#### วิธีที่ 2: แก้ไข Project เดิมเล็กน้อย
1. เลือก project ที่ต้องการ
2. กด Chat/Edit
3. พิมพ์คำสั่ง: "เปลี่ยน hero heading เป็น ..." (อะไรก็ได้)
4. ระบบจะ regenerate files → จะมี script ใหม่

---

### Step 3: ตรวจสอบ Console Logs

เปิด **Developer Console** (F12) และดู logs:

#### ✅ ถ้า Script ทำงานถูกต้อง:
```
✅ Preview loaded: https://...
🎨 Visual edit script is embedded in generated HTML
🎨 Visual Edit script loaded (embedded)
✅ Visual Edit script initialized (embedded)
✅ Found iframe with data-preview attribute
```

#### ❌ ถ้ามีปัญหา:
```
❌ Could not find iframe after 10 attempts
// หรือ
🔍 Looking for iframe... (attempt 1/10)
🔍 Looking for iframe... (attempt 2/10)
...
```

---

### Step 4: ทดสอบ Toggle Edit Mode

กด **Alt + E** หรือคลิกปุ่ม "👁️ Preview"

#### ✅ ถ้าทำงานถูกต้อง:
```
🎨 Toggle edit mode: true
📤 Sending TOGGLE_EDIT_MODE to iframe: true
✅ Message sent to iframe
🔒 Page frozen - only editable elements clickable
🎨 Edit mode: ON
```

#### ❌ ถ้ามีปัญหา:
```
❌ Iframe not found or no contentWindow
🔍 iframe element: null
// หรือ
🔍 contentWindow: null
```

---

### Step 5: ทดสอบ Hover บน Elements

เมื่อเข้า Edit Mode แล้ว ลอง **hover** บน text/heading:

#### ✅ ถ้าทำงานถูกต้อง:
- เห็น **blue dashed outline**
- เห็น **tooltip** แสดงชื่อ field (เช่น "heading", "badge")
- Links/buttons ไม่ทำงาน (frozen)

#### ❌ ถ้าไม่เห็นอะไร:
- Script อาจไม่ได้โหลด
- หรือ data-editable attributes ไม่ถูก render

---

### Step 6: ทดสอบ Click บน Elements

คลิกบน element ที่มี outline:

#### ✅ ถ้าทำงานถูกต้อง:
```
🎯 Element clicked: {blockId: "hero-basic", field: "heading", ...}
📤 Sending to parent: {...}
📥 Received from iframe: {...}
```
- **Panel ทางขวา** ปรากฏขึ้น

#### ❌ ถ้าไม่มีอะไรเกิดขึ้น:
- ตรวจสอบว่ามี `data-editable="true"` ใน HTML หรือไม่

---

## 🐛 สาเหตุที่พบบ่อย

### 1. Project ยังไม่ได้ Regenerate
**อาการ:**
- ไม่เห็น logs: `Visual Edit script loaded`
- Hover/click ไม่มีอะไรเกิดขึ้น

**วิธีแก้:**
- Regenerate project (ตาม Step 2)

---

### 2. Iframe ยังไม่ได้ Load
**อาการ:**
- เห็น logs: `Looking for iframe... (attempt 1/10)`
- Toggle กด แต่ไม่เห็น "Message sent to iframe"

**วิธีแก้:**
- รอให้ preview load เสร็จก่อน
- หรือ refresh หน้า

---

### 3. CORS/Sandbox Restrictions
**อาการ:**
- Script load แต่ไม่ทำงาน
- Console แสดง security errors

**วิธีแก้:**
- ตรวจสอบ iframe sandbox attributes
- ตรวจสอบว่า preview URL เป็น same origin หรือไม่

---

### 4. Data Attributes ไม่ถูก Render
**อาการ:**
- Edit mode เปิดได้
- Hover แล้วไม่เห็น outline

**วิธีแก้:**
- เปิด Inspector ใน iframe
- ตรวจสอบว่า elements มี `data-editable="true"` หรือไม่
- ถ้าไม่มี → regenerate project

---

## 🧪 Quick Test Script

เปิด Console แล้ววาง code นี้:

```javascript
// Test 1: หา iframe
const iframe = document.querySelector('iframe[data-preview]') || document.querySelector('iframe');
console.log('Iframe found:', !!iframe);
console.log('Has contentWindow:', !!iframe?.contentWindow);

// Test 2: ส่ง message
if (iframe?.contentWindow) {
  iframe.contentWindow.postMessage({ type: 'TOGGLE_EDIT_MODE', enabled: true }, '*');
  console.log('Message sent - check iframe console for response');
}

// Test 3: ตรวจสอบ data attributes (ทำใน iframe console)
// เปิด iframe console: Right-click ใน iframe → Inspect → Console tab
const editables = document.querySelectorAll('[data-editable]');
console.log('Editable elements found:', editables.length);
editables.forEach(el => console.log(el.dataset));
```

---

## 📋 Checklist

- [ ] Project ถูก regenerate แล้ว
- [ ] เห็น log "Visual Edit script loaded (embedded)"
- [ ] เห็น log "Found iframe"
- [ ] กด Alt + E แล้วเห็น "Message sent to iframe"
- [ ] เห็น log "🔒 Page frozen"
- [ ] Hover บน text เห็น blue outline
- [ ] Click บน text เห็น panel ขวามือ

---

## 💡 Tips

1. **ใช้ Browser Console เป็นเพื่อน** - เปิดไว้ตลอดเวลา
2. **Regenerate เสมอ** - เมื่อแก้ template system
3. **Check Iframe Console** - บาง logs อยู่ใน iframe แยก
4. **Hard Refresh** - Ctrl + Shift + R (clear cache)

---

**Updated:** 15 ตุลาคม 2025  
**Status:** Ready for debugging 🔍

