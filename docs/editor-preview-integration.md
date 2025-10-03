# Editor Preview Integration

## ภาพรวม
การเปลี่ยนแปลงนี้ทำให้ส่วน ProjectPreview ในหน้า `projects/[id]` ไปดึงข้อมูล preview จาก editor แทนการใช้ `useDaytonaPreview` โดยตรง

## ไฟล์ที่เปลี่ยนแปลง

### 1. สร้างไฟล์ใหม่

#### `src/services/editorPreviewService.ts`
- Service สำหรับจัดการข้อมูล preview จาก editor
- มีการ cache ข้อมูลและ real-time updates
- รองรับการ subscribe/unsubscribe สำหรับการเปลี่ยนแปลงข้อมูล

#### `src/hooks/useEditorPreview.ts`
- Hook ใหม่สำหรับดึงข้อมูล preview จาก editor
- รองรับ auto-fetch, refresh interval, และ real-time updates
- มีฟังก์ชันสำหรับ create, stop, และ refresh preview

#### `src/app/api/editor/preview/[projectId]/route.ts`
- API endpoint สำหรับดึงข้อมูล preview ของ project
- รองรับ GET (ดึงข้อมูล) และ DELETE (หยุด preview)

#### `src/app/api/editor/preview/create/route.ts`
- API endpoint สำหรับสร้าง preview ใหม่
- รองรับ POST method

### 2. แก้ไขไฟล์เดิม

#### `src/components/projects/ProjectPreview.tsx`
- เปลี่ยนจาก `useDaytonaPreview` เป็น `useEditorPreview`
- ปรับปรุงการจัดการข้อมูลและ error handling
- ยังคงฟังก์ชันการทำงานเดิมไว้

## การทำงาน

1. **ProjectPreview component** จะเรียกใช้ `useEditorPreview` hook
2. **useEditorPreview** จะเรียกใช้ `editorPreviewService` เพื่อดึงข้อมูล
3. **editorPreviewService** จะเรียก API endpoints ที่สร้างขึ้น
4. ข้อมูลจะถูก cache และส่งต่อไปยัง component
5. รองรับ real-time updates ผ่าน subscription system

## API Endpoints

### GET `/api/editor/preview/[projectId]`
ดึงข้อมูล preview สำหรับ project ที่ระบุ

**Response:**
```json
{
  "projectId": "string",
  "sandboxId": "string | null",
  "previewUrl": "string | null", 
  "previewToken": "string | null",
  "status": "idle | creating | running | stopped | error",
  "files": [],
  "lastUpdated": "string | null"
}
```

### POST `/api/editor/preview/create`
สร้าง preview ใหม่สำหรับ project

**Request Body:**
```json
{
  "projectId": "string",
  "files": [
    {
      "path": "string",
      "content": "string",
      "type": "string",
      "language": "string"
    }
  ]
}
```

### DELETE `/api/editor/preview/[projectId]`
หยุด preview สำหรับ project ที่ระบุ

## การใช้งาน

### ใน Component
```tsx
import { useEditorPreview } from '@/hooks/useEditorPreview'

const MyComponent = ({ projectId }) => {
  const {
    data,
    loading,
    error,
    refresh,
    createPreview,
    stopPreview
  } = useEditorPreview({ 
    projectId,
    autoFetch: true,
    refreshInterval: 30000 // 30 seconds
  })

  return (
    <div>
      {loading && <div>Loading...</div>}
      {error && <div>Error: {error}</div>}
      {data?.previewUrl && (
        <iframe src={data.previewUrl} />
      )}
    </div>
  )
}
```

### ใน Service
```tsx
import { editorPreviewService } from '@/services/editorPreviewService'

// ดึงข้อมูล
const result = await editorPreviewService.getProjectPreview('project-id')

// สร้าง preview
const result = await editorPreviewService.createPreview('project-id', files)

// หยุด preview  
const result = await editorPreviewService.stopPreview('project-id')

// Subscribe เพื่อรับ real-time updates
const unsubscribe = editorPreviewService.subscribe('project-id', (data) => {
  console.log('Preview updated:', data)
})
```

## ข้อดี

1. **แยกหน้าที่ชัดเจน**: Editor จัดการ preview, Projects แค่แสดงผล
2. **Real-time updates**: ข้อมูลอัปเดตแบบ real-time
3. **Caching**: ลดการเรียก API ซ้ำซ้อน
4. **Error handling**: จัดการ error ได้ดีขึ้น
5. **Scalable**: สามารถขยายฟีเจอร์ได้ง่าย

## TODO

1. เชื่อมต่อกับ editor service จริง (ตอนนี้ใช้ mock data)
2. เพิ่มการจัดการ authentication และ authorization
3. เพิ่ม unit tests
4. เพิ่ม error recovery mechanisms
5. เพิ่ม performance monitoring
