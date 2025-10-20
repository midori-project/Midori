# สรุปโครงสร้างโปรเจ็คสำหรับ Visual Edit Image Upload

**สร้างเมื่อ:** 20 ตุลาคม 2025  
**วัตถุประสงค์:** วิเคราะห์โครงสร้างปัจจุบันก่อนเพิ่มฟีเจอร์อัปโหลดรูปภาพ

---

## 📊 ภาพรวมโครงสร้างปัจจุบัน

### 1. Visual Edit System (✅ มีอยู่แล้ว)

#### 1.1 Frontend Components
```
Midori/src/components/projects/
├── ProjectPreview.tsx          ✅ Component หลัก - ใช้ useVisualEdit hook
├── VisualEditPanel.tsx         ✅ Panel สำหรับแก้ไข (รองรับ image type แล้ว!)
├── PreviewToolbar.tsx          ✅ Toolbar พร้อมปุ่ม Toggle Edit Mode
└── PreviewContent.tsx          ✅ Iframe container
```

**สิ่งที่พบ:**
- ✅ `VisualEditPanel.tsx` **รองรับ image type แล้ว** (บรรทัด 142-176)
- ✅ แสดง Image URL input และ preview
- ❌ แต่ยังไม่มี **ปุ่มอัปโหลดไฟล์** (แค่ paste URL เท่านั้น)

#### 1.2 Hooks
```
Midori/src/hooks/useVisualEdit.ts
├── toggleEditMode()            ✅ เปิด/ปิด edit mode
├── saveEdit()                  ✅ บันทึกผ่าน visualEditService
└── cancelEdit()                ✅ ยกเลิก
```

**สิ่งที่พบ:**
- ✅ รองรับ `type: 'image'`
- ✅ ส่ง value (URL) ไปยัง API
- ✅ ต้องมี `sandboxId` ถึงจะบันทึกได้

#### 1.3 Services
```
Midori/src/libs/services/
├── visualEditService.ts        ✅ จัดการ visual edit logic
└── storageService.ts           ✅ Cloudflare R2 Provider พร้อมใช้งาน!
```

**สิ่งที่พบ:**
- ✅ `CloudflareR2Provider` implement แล้ว
- ✅ รองรับ `upload()`, `delete()`, `getPublicUrl()`, `list()`
- ✅ ใช้ AWS S3 SDK สำหรับ R2
- ✅ มี test endpoint: `/api/test/storage/upload`

---

### 2. Backend API Structure

#### 2.1 Visual Edit API
```
Midori/src/app/api/visual-edit/
└── apply/
    └── route.ts                ✅ อัปเดตค่า placeholder
```

**ฟังก์ชันหลัก:**
1. อ่านไฟล์จาก Daytona Sandbox
2. หาและแทนที่ field
3. เขียนกลับ Daytona (trigger HMR)
4. บันทึก Snapshot + PatchSet ลง DB

**Strategy การแทนที่:**
- Strategy 1: `<span data-field="...">content</span>`
- Strategy 2: `<img data-field="..." src="..." />`
- Strategy 3: Plain placeholder `{field}`

#### 2.2 Storage API
```
Midori/src/app/api/test/storage/
└── upload/
    └── route.ts                ✅ Test upload endpoint (ใช้งานได้)
```

**ฟีเจอร์:**
- ✅ รับ FormData (multipart)
- ✅ Validate image type & size
- ✅ Upload ไป Cloudflare R2
- ✅ Return public URL

---

### 3. Template System

#### 3.1 Renderer
```
Midori/src/midori/agents/frontend-v2/template-system/override-system/
└── renderer.ts
```

**ฟังก์ชันสำคัญ:**
- `wrapWithDataAttributes()` - Wrap placeholder ด้วย data attributes
- `renderBlock()` - Render template พร้อม data attributes
- ✅ **รองรับ `data-editable`, `data-field`, `data-type` แล้ว**

**Logic:**
```typescript
// ถ้า template มี data-field อยู่แล้ว → ไม่ wrap
if (template.includes(`data-field="${placeholder}"`)) {
  replacements[placeholder] = this.escapeHtml(String(value));
}
// ถ้าเป็น attribute value (src, href) → ไม่ wrap
else if (this.isAttributeValue(placeholder)) {
  replacements[placeholder] = this.escapeHtml(String(value));
}
// ถ้าเป็น text content → wrap with span
else {
  replacements[placeholder] = this.wrapWithDataAttributes(...);
}
```

#### 3.2 Template Variants
```
Midori/src/midori/agents/frontend-v2/template-system/shared-blocks/variants/
├── hero-variants.ts           ✅ มี data-field="heroImage" แล้ว
├── about-variants.ts          ✅ มี data-field="aboutImage" แล้ว
├── menu-variants.ts
└── footer-variants.ts
```

**ตัวอย่างจาก hero-variants.ts (บรรทัด 16-24):**
```jsx
<img 
  src="{heroImage}" 
  alt="{heroImageAlt}"
  className="w-full h-full object-cover"
  loading="eager"
  data-editable="true"
  data-block-id="hero-basic"
  data-field="heroImage"
  data-type="image"
/>
```

✅ **Template พร้อมแล้ว!**

---

### 4. Database Schema (Prisma)

#### 4.1 ImageAsset Table
```prisma
model ImageAsset {
  id        String      @id @default(uuid())
  projectId String                          // ✅ FK to Project
  briefId   String?     
  fileId    String?     
  provider  String?                         // ✅ เก็บ "cloudflare-r2"
  meta      Json?                           // ✅ เก็บ { url, blockId, field, ... }
  createdAt DateTime    @default(now())
  
  project   Project     @relation(...)
}
```

**✅ Schema รองรับแล้ว - ไม่ต้อง migration**

#### 4.2 Snapshot Table
```prisma
model Snapshot {
  id           String   @id
  projectId    String
  files        Json                         // เก็บไฟล์ทั้งหมด
  templateData Json?                        // ✅ เก็บ metadata
  ...
}
```

**การใช้งาน:**
```json
{
  "lastVisualEdit": "2025-10-20T...",
  "visualEditCount": 5,
  "images": {
    "hero-basic.heroImage": {
      "url": "https://pub-xxx.r2.dev/...",
      "updatedAt": "2025-10-20T..."
    }
  }
}
```

---

## 🔧 Environment Configuration

### ตรวจสอบ .env (สมมติ - ไม่มีไฟล์ใน repo)

**ต้องมี:**
```bash
# Cloudflare R2
CLOUDFLARE_ACCOUNT_ID=xxx
CLOUDFLARE_R2_BUCKET_NAME=project-images
CLOUDFLARE_R2_ACCESS_KEY_ID=xxx
CLOUDFLARE_R2_SECRET_ACCESS_KEY=xxx
CLOUDFLARE_R2_PUBLIC_URL=https://pub-xxx.r2.dev
CLOUDFLARE_R2_JURISDICTION=global

# Storage Provider
STORAGE_PROVIDER=cloudflare-r2

# Database (Supabase)
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...
```

---

## 📦 Dependencies

**ที่มีอยู่แล้ว:**
- ✅ `@aws-sdk/client-s3` (v3.913.0) - สำหรับ Cloudflare R2
- ✅ `@prisma/client` (v6.14.0) - Database ORM
- ✅ `nanoid` (v5.1.6) - Generate unique filename
- ✅ `next` (v15.5.0) - API Routes

**ไม่ต้องติดตั้งเพิ่ม!**

---

## 🎯 สิ่งที่ต้องทำ

### ✅ มีอยู่แล้ว (ไม่ต้องทำ)
1. ✅ Visual Edit UI Components
2. ✅ Cloudflare R2 Provider
3. ✅ Test Upload API
4. ✅ Database Schema (ImageAsset)
5. ✅ Template Renderer พร้อม data attributes
6. ✅ Template Variants พร้อม data-field="image"

### ❌ ต้องสร้างใหม่
1. ❌ **API: `/api/visual-edit/upload-image`**
   - รับไฟล์ + metadata
   - Upload ไป R2
   - บันทึก ImageAsset ลง DB
   - Return URL

2. ❌ **UI: ปุ่มอัปโหลดใน VisualEditPanel**
   - เพิ่ม File Input
   - Loading state
   - Error handling

3. ❌ **Logic: เชื่อมต่อ upload flow**
   - Upload file → ได้ URL → set value → save
   
---

## 📐 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      USER INTERFACE                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ProjectPreview.tsx                                          │
│  ├── useVisualEdit()                                         │
│  ├── VisualEditPanel (Image Upload UI) ← ต้องแก้           │
│  └── PreviewContent (iframe)                                 │
│                                                              │
└───────────────────────┬──────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                     API LAYER                                │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  /api/visual-edit/upload-image  ← ต้องสร้าง                │
│  │                                                           │
│  ├── Validate File                                           │
│  ├── Upload to R2 ─────┐                                    │
│  ├── Save to DB ────┐  │                                    │
│  └── Return URL      │  │                                    │
│                      │  │                                    │
│  /api/visual-edit/apply                                      │
│  │                  │  │                                     │
│  ├── Read from Daytona│ │                                    │
│  ├── Replace field  │  │                                     │
│  ├── Write to Daytona│ │                                     │
│  └── Save Snapshot  │  │                                     │
│                     │  │                                     │
└─────────────────────┼──┼──────────────────────────────────────┘
                      │  │
          ┌───────────┘  └───────────┐
          ▼                          ▼
┌──────────────────┐       ┌─────────────────────┐
│  Supabase (DB)   │       │  Cloudflare R2      │
├──────────────────┤       ├─────────────────────┤
│                  │       │                     │
│ • ImageAsset     │       │ • Image Files       │
│   - url (R2)     │       │ • Public URLs       │
│   - metadata     │       │                     │
│                  │       │                     │
│ • Snapshot       │       │                     │
│   - files        │       │                     │
│   - templateData │       │                     │
│                  │       │                     │
└──────────────────┘       └─────────────────────┘
```

---

## 🔄 Image Upload Flow

```
1. User คลิกรูปภาพใน Preview (Edit Mode ON)
   ↓
2. VisualEditPanel แสดง
   - Image URL input (มีอยู่แล้ว)
   - ปุ่ม "อัปโหลดรูปภาพ" (ต้องเพิ่ม)
   ↓
3. User คลิกปุ่มอัปโหลด → เลือกไฟล์
   ↓
4. Frontend:
   - FormData.append('file', file)
   - FormData.append('projectId', projectId)
   - FormData.append('blockId', blockId)
   - FormData.append('field', field)
   - POST /api/visual-edit/upload-image
   ↓
5. Backend (upload-image API):
   - Validate (image type, size < 10MB)
   - Generate filename: projects/{projectId}/visual-edit/{timestamp}-{nanoid}.ext
   - Upload to R2 → get public URL
   - Save to ImageAsset table
   - Return { url, imageAssetId }
   ↓
6. Frontend:
   - setValue(url)  // Set R2 URL
   - แสดง preview
   ↓
7. User กด "Save"
   ↓
8. Frontend:
   - visualEditService.updateField({ value: url })
   ↓
9. Backend (apply API):
   - Read file from Daytona
   - Replace <img src="OLD" /> → <img src="NEW_R2_URL" />
   - Write back to Daytona (HMR)
   - Update Snapshot (บันทึก image URL)
   ↓
10. Preview auto-refresh แสดงรูปใหม่ ✅
```

---

## 📝 Code Structure Summary

### Files to Create (1 file)
```
Midori/src/app/api/visual-edit/upload-image/
└── route.ts                    [~120 lines]
```

### Files to Modify (1 file)
```
Midori/src/components/projects/
└── VisualEditPanel.tsx         [+80 lines]
    ├── Add: File input
    ├── Add: handleImageUpload()
    ├── Add: Loading state
    └── Add: Error handling
```

### Files Already Working (No changes needed)
```
✅ visualEditService.ts          (รองรับ type: 'image')
✅ storageService.ts              (CloudflareR2Provider พร้อม)
✅ apply/route.ts                 (รองรับ image src replacement)
✅ renderer.ts                    (รองรับ data-field attributes)
✅ hero-variants.ts               (มี data-field="heroImage")
✅ about-variants.ts              (มี data-field="aboutImage")
✅ useVisualEdit.ts               (ส่ง type + value ได้)
```

---

## 🎯 Implementation Priority

### Phase 1: Core Upload API (สำคัญที่สุด)
- [ ] สร้าง `/api/visual-edit/upload-image/route.ts`
- [ ] Test upload flow
- [ ] ตรวจสอบ R2 environment variables

### Phase 2: UI Enhancement
- [ ] เพิ่มปุ่มอัปโหลดใน `VisualEditPanel.tsx`
- [ ] เพิ่ม loading indicator
- [ ] เพิ่ม error messages

### Phase 3: Testing
- [ ] Test upload → preview
- [ ] Test save → database
- [ ] Test file size limits
- [ ] Test file type validation

---

## 🔍 Key Findings

### ✅ จุดแข็ง
1. **โครงสร้างพร้อมแล้ว 90%** - ไม่ต้องทำมาก
2. **Cloudflare R2 Integration แล้ว** - เหลือแค่ create API
3. **UI รองรับ image type** - เหลือแค่เพิ่มปุ่มอัปโหลด
4. **Database Schema รองรับ** - ไม่ต้อง migration
5. **Template พร้อม data attributes** - ไม่ต้องแก้

### ⚠️ ข้อควรระวัง
1. **Environment Variables** - ต้องตรวจสอบว่าตั้งค่าครบ
2. **R2 Bucket Permission** - ต้อง public หรือใช้ custom domain
3. **File Size Limit** - กำหนดไว้ 10MB
4. **Sandbox ID Required** - ต้องมี preview running ถึงจะบันทึกได้

---

## 📚 Related Documentation

1. `visual-edit-implementation-plan.md` - แผนการ implement เดิม
2. `visual-edit-fixes.md` - Bug fixes ที่แก้ไปแล้ว
3. `visual-edit-troubleshooting.md` - วิธีแก้ปัญหา
4. `cloudflare-r2-setup.md` - Setup guide (ว่างเปล่า - ต้องเพิ่ม)
5. `cloudflare-r2-usage-guide.md` - Usage guide (ว่างเปล่า - ต้องเพิ่ม)

---

## 🚀 Next Steps

1. ✅ **อ่านเอกสารนี้เพื่อเข้าใจโครงสร้าง**
2. 🔄 **ตรวจสอบ Environment Variables**
3. 🔨 **สร้าง upload-image API**
4. 🎨 **แก้ไข VisualEditPanel UI**
5. 🧪 **ทดสอบ upload flow**
6. 📝 **อัปเดตเอกสาร**

---

**สรุป:** โครงสร้างพร้อมแล้ว 90% - เหลือแค่สร้าง API endpoint 1 ไฟล์และแก้ UI อีก 1 ไฟล์เท่านั้น!

**Estimated Time:** 2-4 ชั่วโมง

**Complexity:** ⭐⭐⭐ (ปานกลาง)

