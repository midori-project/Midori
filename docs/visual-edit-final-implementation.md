# Visual Edit Mode - Final Implementation

## 🎯 แนวทางสุดท้าย: ใช้ Partial Update API

แทนที่จะสร้าง API endpoint ใหม่และ regenerate ทั้ง project เราเปลี่ยนมาใช้ **Partial Update API ที่มีอยู่แล้ว**

---

## 🔄 การทำงาน

```
User Click Element
  ↓
Edit Panel เปิด
  ↓
User แก้ไข + Save
  ↓
1. ดึง file content จาก Snapshot
  ↓
2. สร้าง patch operations
  ↓
3. เรียก /api/preview/daytona/partial
  ↓
4. Partial update บันทึกไปที่:
   ├─ Snapshot.files (อัปเดตไฟล์)
   ├─ Snapshot.templateData (metadata)
   ├─ PatchSet (history record)
   └─ Patch (patch details)
  ↓
5. Sandbox อัปเดตไฟล์ทันที
  ↓
6. Preview reload อัตโนมัติ
  ↓
เห็นผลทันที! 🎉
```

---

## 📊 ข้อมูลถูกบันทึกที่ไหน

### **ตาราง `Snapshot`**
```sql
UPDATE Snapshot SET
  files = [
    {
      path: "src/components/Navbar.tsx",
      content: "..." -- อัปเดตแล้ว!
    },
    ...
  ],
  templateData = {
    ...existing,
    lastPartialUpdate: "2025-10-15T...",
    partialUpdateCount: 5,
    lastPartialUpdateFile: "src/components/Navbar.tsx"
  }
WHERE id = 'snapshot-xxx'
```

### **ตาราง `PatchSet`** (History)
```sql
INSERT INTO PatchSet (
  projectId: "8169f09f-6c65-4515-a8b7-b7483edadad0",
  meta: {
    source: "partial-update",
    sandboxId: "xxx",
    timestamp: "2025-10-15T...",
    appliedOperations: 1,
    totalOperations: 1
  }
)
```

### **ตาราง `Patch`** (Details)
```sql
INSERT INTO Patch (
  patchSetId: "patch-set-xxx",
  filePath: "src/components/Navbar.tsx",
  changeType: "update",
  hunks: [
    {
      type: "replace",
      line: 45,
      content: "<span ...>Luma Studio vvv</span>",
      oldContent: "<span ...>ครัวไทย</span>"
    }
  ]
)
```

---

## 🔑 Core Components

### **1. visualEditService.ts**

```typescript
async updateField(update, sandboxId) {
  // 1. ดึง file content จาก snapshot
  const fileContent = await this.getFileContent(projectId, filePath);
  
  // 2. สร้าง patch operations
  const patchOps = this.createPatchOperations(blockId, field, value, fileContent);
  
  // 3. เรียก partial update API
  await fetch('/api/preview/daytona/partial?sandboxId=...', {
    method: 'PATCH',
    body: JSON.stringify({ path, operations: patchOps, projectId })
  });
}
```

**Smart Pattern Matching:**
- ถ้ามี wrapped span อยู่แล้ว → แค่เปลี่ยนค่าข้างใน
- ถ้ายังเป็น placeholder → wrap และใส่ค่า

### **2. useVisualEdit.ts**

```typescript
const { editMode, saveEdit } = useVisualEdit({ 
  projectId,
  sandboxId  // 🔑 ต้องส่ง sandboxId
});

// Save ผ่าน partial update
await visualEditService.updateField(update, sandboxId);
```

### **3. ProjectPreview.tsx**

```typescript
// ส่ง sandboxId จาก useDaytonaPreview
useVisualEdit({ 
  projectId,
  sandboxId  // จาก useDaytonaPreview
});
```

---

## ✅ ข้อดีของวิธีนี้

| ฟีเจอร์ | Regenerate API | **Partial Update API** |
|---------|----------------|----------------------|
| **ความเร็ว** | ช้า (regenerate ทั้งหมด) | **เร็ว (แก้เฉพาะบรรทัด)** |
| **History Tracking** | ❌ ไม่มี | **✅ PatchSet + Patch** |
| **Database Tables** | 1 (Snapshot) | **3 (Snapshot + PatchSet + Patch)** |
| **Undo/Redo** | ❌ ยาก | **✅ ง่าย (มี history)** |
| **Real-time Update** | ❌ ต้อง reload | **✅ อัปเดตทันที** |
| **ใช้ซ้ำได้** | ❌ API ใหม่ | **✅ ใช้ API เดิม** |

---

## 🧪 ตัวอย่าง Logs

### เมื่อ Save:
```
💾 Saving edit: {projectId: "...", sandboxId: "...", blockId: "navbar-basic", field: "brand", value: "Luma Studio vvv"}
📖 Fetching file content from snapshot...
🔄 Replacing wrapped value: "ครัวไทย" → "Luma Studio vvv"
🔧 Created patch operation for line 45: {...}
🔧 Created 1 patch operation(s)
✅ Partial update success: {success: true, savedToDatabase: true, ...}
💾 Saved to database: true
✅ Save successful to database via partial update
```

### ใน Database:
```sql
-- PatchSet ใหม่ถูกสร้าง
-- Patch record ใหม่ถูกสร้าง
-- Snapshot.files อัปเดต
-- Snapshot.templateData อัปเดต metadata
```

---

## 📝 Files Changed

| ไฟล์ | การเปลี่ยนแปลง |
|------|----------------|
| `visualEditService.ts` | ใช้ partial update API แทน custom API |
| `useVisualEdit.ts` | รับ sandboxId parameter |
| `ProjectPreview.tsx` | ส่ง sandboxId ไปยัง hook |
| ~~`visual-edit/update/route.ts`~~ | **ไม่ใช้แล้ว** (ใช้ partial API แทน) |

---

## 🎉 ผลลัพธ์

- ✅ บันทึกข้อมูลลง **3 ตาราง** (Snapshot + PatchSet + Patch)
- ✅ อัปเดต **ทันที** ไม่ต้องรอ regenerate
- ✅ มี **History tracking** สำหรับ undo/redo
- ✅ ใช้ **API เดิม** ไม่ต้องสร้างใหม่
- ✅ **Real-time update** ใน sandbox

---

**Updated:** 15 ตุลาคม 2025  
**Status:** ✅ Complete & Production Ready 🚀

