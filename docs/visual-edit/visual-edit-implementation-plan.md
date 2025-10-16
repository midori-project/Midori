# Visual Edit Mode Implementation Plan

## 📋 ภาพรวม

แผนการสร้าง Visual Edit Mode สำหรับ Midori โดยใช้แนวทางแบบ Lovable - ผู้ใช้สามารถคลิกบน element ในหน้าพรีวิวแล้วแก้ไขได้เลย โดยไม่ต้องใช้ AI วิเคราะห์

## 🎯 แนวคิดหลัก

1. **Data Attributes Injection**: เพิ่ม `data-editable` attributes ตอน render time
2. **Direct Mapping**: อ่านข้อมูลจาก attributes โดยตรง ไม่ต้องใช้ AI
3. **Override System**: ใช้ระบบ Override ที่มีอยู่แล้วในการบันทึกการเปลี่ยนแปลง
4. **Real-time Update**: อัปเดตและแสดงผลทันที

---

## 🎯 Phase 1: Backend - Template Rendering (เพิ่ม Data Attributes)

### ไฟล์ที่ต้องแก้ไข

**ไฟล์:** `Midori/src/midori/agents/frontend-v2/template-system/override-system/renderer.ts`

### 1.1 เพิ่ม Helper Methods

```typescript
/**
 * Wrap placeholder value with data attributes for visual editing
 */
private wrapWithDataAttributes(
  blockId: string,
  field: string,
  value: string,
  type: 'text' | 'heading' | 'subheading' | 'button' | 'badge'
): string {
  const tag = 'span'; // ใช้ span เพราะไม่รบกวน semantic HTML
  
  return `<${tag} 
    data-editable="true" 
    data-block-id="${blockId}" 
    data-field="${field}"
    data-type="${type}"
    class="midori-editable"
  >${this.escapeHtml(value)}</${tag}>`;
}

/**
 * Infer field type from placeholder name
 */
private inferFieldType(field: string): 'text' | 'heading' | 'subheading' | 'button' | 'badge' {
  if (field === 'heading') return 'heading';
  if (field === 'subheading') return 'subheading';
  if (field === 'badge') return 'badge';
  if (field.includes('cta') || field.includes('Cta') || field.includes('Button')) return 'button';
  return 'text';
}
```

### 1.2 แก้ไข renderBlock() Method

ที่บรรทัด ~125, แก้การ replace placeholders:

```typescript
// Step 1: Collect all placeholder values (WITH data attributes!)
for (const [placeholder, config] of Object.entries(block.placeholders)) {
  // Skip special placeholders...
  if (['menuItems', 'features', 'stats', 'socialLinks', 'quickLinks'].includes(placeholder)) {
    continue;
  }

  const value = this.getUserDataValue(placeholder, userData, config, block.id);
  
  if (value !== undefined) {
    // 🔑 WRAP with data attributes instead of escape HTML
    const wrappedValue = this.wrapWithDataAttributes(
      block.id,
      placeholder,
      String(value),
      this.inferFieldType(placeholder)
    );
    replacements[placeholder] = wrappedValue;
    appliedOverrides.push(`placeholder-${placeholder}`);
  } else if (config.required) {
    const fallbackValue = this.getFallbackValue(placeholder, config);
    const wrappedValue = this.wrapWithDataAttributes(
      block.id,
      placeholder,
      String(fallbackValue),
      this.inferFieldType(placeholder)
    );
    replacements[placeholder] = wrappedValue;
    appliedOverrides.push(`fallback-${placeholder}`);
  }
}
```

### 1.3 แก้ Special Generators (5 ตัว)

#### A. generateMenuItems() - line 323

เพิ่ม data attributes ให้ menu cards และทุก field ที่แก้ไขได้

#### B. generateFeatures() - line 276

เพิ่ม data attributes ให้ feature boxes

#### C. generateStats() - line 301

เพิ่ม data attributes ให้ statistics

#### D. generateSocialLinks() - line 422

เพิ่ม data attributes ให้ social links

#### E. generateQuickLinks() - line 444

เพิ่ม data attributes ให้ quick links

---

## 🎯 Phase 2: API Layer - Update Endpoints

### 2.1 สร้าง Visual Edit Service

**ไฟล์ใหม่:** `Midori/src/libs/services/visualEditService.ts`

**ฟังก์ชันหลัก:**
- `updateField()` - อัปเดตค่า placeholder
- `mergeOverrides()` - merge override configs
- `parseFieldPath()` - parse field path สำหรับ array items

### 2.2 สร้าง API Endpoint

**ไฟล์ใหม่:** `Midori/src/app/api/visual-edit/update/route.ts`

**ฟังก์ชันหลัก:**
- รับ request จาก frontend
- ตรวจสอบ authentication & authorization
- Load project และ existing overrides
- Parse field path (รองรับ array items)
- Merge overrides
- บันทึกลง database
- Return success response

---

## 🎯 Phase 3: Frontend - Visual Edit UI

### 3.1 สร้าง Iframe Script

**ไฟล์ใหม่:** `Midori/public/scripts/visual-edit.js`

**ฟังก์ชันหลัก:**
- Listen for toggle edit mode command
- Hover effect บน editable elements
- Click to select element
- Send data back to parent window
- Inject CSS for visual feedback

### 3.2 สร้าง React Hook

**ไฟล์ใหม่:** `Midori/src/hooks/useVisualEdit.ts`

**ฟังก์ชันหลัก:**
- `toggleEditMode()` - เปิด/ปิด edit mode
- `saveEdit()` - บันทึกการแก้ไข
- `cancelEdit()` - ยกเลิกการแก้ไข
- Listen for messages from iframe

### 3.3 สร้าง Visual Edit Panel Component

**ไฟล์ใหม่:** `Midori/src/components/projects/VisualEditPanel.tsx`

**UI Components:**
- Header (field info + close button)
- Input fields (text, textarea, image URL)
- Character counter
- Save/Cancel buttons
- Loading state

### 3.4 แก้ไข ProjectPreview Component

**ไฟล์:** `Midori/src/components/projects/ProjectPreview.tsx`

**การเปลี่ยนแปลง:**
- Import และใช้ `useVisualEdit` hook
- Import และแสดง `VisualEditPanel` component
- ส่ง props ไปยัง `PreviewToolbar`

### 3.5 แก้ไข PreviewToolbar Component

**ไฟล์:** `Midori/src/components/projects/PreviewToolbar.tsx`

**การเปลี่ยนแปลง:**
- เพิ่ม props: `editMode`, `onToggleEditMode`
- เพิ่มปุ่ม Toggle Visual Edit Mode
- แสดง state (Edit Mode / Preview Mode)

### 3.6 แก้ไข PreviewContent Component

**ไฟล์:** `Midori/src/components/projects/PreviewContent.tsx`

**การเปลี่ยนแปลง:**
- เพิ่ม `data-preview="true"` attribute ให้ iframe
- Inject visual-edit.js script ใน onLoad event

---

## 🎯 Phase 4: Testing & Polish

### 4.1 Test Checklist

- [ ] Simple placeholders แก้ไขได้ (heading, badge, subheading, etc.)
- [ ] Menu items แก้ไขได้ (name, price, description, image, category)
- [ ] Features แก้ไขได้ (title, description)
- [ ] Stats แก้ไขได้ (number, label)
- [ ] Social links แก้ไขได้
- [ ] Quick links แก้ไขได้
- [ ] บันทึกลง database สำเร็จ
- [ ] Refresh preview หลังแก้ไข
- [ ] Keyboard shortcut (Alt + E) ทำงาน
- [ ] Hover effect แสดงชื่อ field
- [ ] Selected state แสดงถูกต้อง
- [ ] Error handling ทำงานถูกต้อง
- [ ] Mobile responsive

### 4.2 Performance Optimization

- [ ] Lazy load visual edit script
- [ ] Debounce save operations
- [ ] Cache iframe contentWindow reference
- [ ] Optimize re-render after save

### 4.3 Error Handling

- [ ] Network errors
- [ ] Invalid values
- [ ] Permission errors (unauthorized users)
- [ ] Iframe communication errors
- [ ] Missing fields

---

## 📊 สรุปไฟล์ที่ต้องสร้าง/แก้ไข

| Phase | ไฟล์ | ประเภท | จำนวนบรรทัด |
|-------|------|--------|-------------|
| **Phase 1** | `renderer.ts` | แก้ไข | +150 |
| **Phase 2** | `visualEditService.ts` | สร้างใหม่ | 80 |
| **Phase 2** | `api/visual-edit/update/route.ts` | สร้างใหม่ | 120 |
| **Phase 3** | `visual-edit.js` | สร้างใหม่ | 100 |
| **Phase 3** | `useVisualEdit.ts` | สร้างใหม่ | 90 |
| **Phase 3** | `VisualEditPanel.tsx` | สร้างใหม่ | 150 |
| **Phase 3** | `ProjectPreview.tsx` | แก้ไข | +30 |
| **Phase 3** | `PreviewToolbar.tsx` | แก้ไข | +20 |
| **Phase 3** | `PreviewContent.tsx` | แก้ไข | +15 |
| **รวม** | **9 ไฟล์** | 6 ใหม่ + 3 แก้ | **~755 บรรทัด** |

---

## 🚀 Timeline การทำงาน

| Phase | ระยะเวลา | ความยาก |
|-------|----------|---------|
| Phase 1: Renderer | 3-4 ชั่วโมง | ⭐⭐⭐⭐ |
| Phase 2: API | 1-2 ชั่วโมง | ⭐⭐⭐ |
| Phase 3: UI | 4-5 ชั่วโมง | ⭐⭐⭐⭐ |
| Phase 4: Testing | 2-3 ชั่วโมง | ⭐⭐ |
| **รวม** | **10-14 ชั่วโมง** | |

---

## 🔑 Key Concepts

### Data Attributes Structure

```html
<!-- Simple Placeholder -->
<span 
  data-editable="true"
  data-block-id="hero-basic"
  data-field="heading"
  data-type="heading"
  class="midori-editable"
>
  ลิ้มรสอาหารไทยแท้
</span>

<!-- Array Item -->
<div
  data-editable="true"
  data-block-id="menu-basic"
  data-field="menuItems[0].name"
  data-item-index="0"
  data-type="heading"
  class="midori-editable"
>
  ข้าวผัดกุ้ง
</div>
```

### Override System

```typescript
const override: OverrideConfig = {
  blockId: 'hero-basic',
  placeholderOverrides: {
    heading: 'ข้อความใหม่'
  }
};
```

### Communication Flow

```
User Click on Element
  ↓
Iframe detects click
  ↓
Read data-* attributes
  ↓
PostMessage to parent
  ↓
Parent shows edit panel
  ↓
User edits and saves
  ↓
API call to update
  ↓
Save to database
  ↓
Refresh preview
```

---

## 📝 Notes

- ไม่ต้องแก้ template variants เลย - แก้แค่ที่ renderer
- ใช้ระบบ Override ที่มีอยู่แล้ว
- รองรับทั้ง simple placeholders และ array items
- Real-time preview update
- Keyboard shortcuts support
- Mobile responsive design

---

## 🎉 Expected Result

เมื่อทำเสร็จ ผู้ใช้จะสามารถ:
1. เปิด Visual Edit Mode ด้วยปุ่มหรือ keyboard shortcut
2. คลิกบน element ที่ต้องการแก้ไข
3. แก้ไขข้อความ/รูปภาพ ใน panel ด้านขวา
4. บันทึกและเห็นผลทันที
5. การเปลี่ยนแปลงถูกบันทึกลง database อัตโนมัติ

---

**สร้างเมื่อ:** 15 ตุลาคม 2025  
**เวอร์ชัน:** 1.0  
**สถานะ:** Ready to implement 🚀

