# Daytona Preview Component

คอมโพเนนต์สำหรับพรีวิวโปรเจกต์ด้วย Daytona Sandbox ที่ให้ผู้ใช้สร้าง build และเปิดดูผลงานในสภาพแวดล้อมแยกอย่างปลอดภัย

## ฟีเจอร์หลัก

- ✅ สร้างและจัดการ Daytona Sandbox ผ่าน API
- ✅ แสดงสถานะการ build และพรีวิวแบบ real-time
- ✅ ติดตามการใช้งานและบังคับโควตา (1 ชั่วโมง/วัน)
- ✅ Auto-stop เมื่อผู้ใช้ออกจากหน้าหรือปิดแท็บ
- ✅ จำกัด concurrency (1 sandbox ต่อผู้ใช้)
- ✅ UI ที่ใช้งานง่ายและ responsive

## การใช้งาน

### Basic Usage

```tsx
import DaytonaPreviewPage from '@/components/preview/page';

function ProjectPage() {
  return (
    <DaytonaPreviewPage 
      projectId="project-123"
      promptJson={promptData}
      userId="user-456"
    />
  );
}
```

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `projectId` | string | ✅ | ID ของโปรเจกต์ที่ต้องการพรีวิว |
| `promptJson` | Record<string, unknown> | ❌ | ข้อมูล JSON สำหรับ build โปรเจกต์ |
| `userId` | string | ❌ | ID ผู้ใช้ (ถ้าไม่ส่งจะใช้จาก session) |
| `className` | string | ❌ | CSS class เพิ่มเติม |

## API Endpoints

คอมโพเนนต์นี้ต้องการ API endpoints ต่อไปนี้:

### POST /api/preview/daytona
สร้าง sandbox ใหม่
```json
{
  "projectId": "string",
  "promptJson": "object",
  "userId": "string"
}
```

### POST /api/preview/daytona/stop
หยุดและลบ sandbox
```json
{
  "sandboxId": "string"
}
```

### GET /api/preview/daytona/status
ตรวจสอบสถานะ sandbox
```
?sandboxId=string
```

### GET /api/preview/usage
ดึงข้อมูลการใช้งาน
```
?userId=string
```

### POST /api/preview/usage
บันทึกการใช้งาน (heartbeat)
```json
{
  "sandboxId": "string",
  "userId": "string", 
  "deltaSeconds": "number"
}
```

## Hook ที่ใช้

### useDaytonaPreview
Custom hook ที่จัดการสถานะและการทำงานของ sandbox

```tsx
const {
  sandboxState,
  isStarting,
  isStopping,
  startPreview,
  stopPreview,
  loadUsageData,
} = useDaytonaPreview(projectId, userId);
```

## ข้อกำหนดระบบ

1. **ติดตั้ง Daytona SDK**
   ```bash
   npm install @daytonaio/sdk
   ```

2. **ตั้งค่า Environment Variables**
   ```env
   DAYTONA_API_KEY=your-daytona-api-key
   ```

3. **Database Schema** (ต้องมีตารางสำหรับ)
   - `sandbox_states` - สถานะ sandbox
   - `sandbox_usage` - การใช้งานรายวัน

## การทำงาน

1. **เริ่มพรีวิว**: คลิกปุ่ม "เริ่มพรีวิว"
   - ตรวจสอบโควตาและ concurrency
   - สร้าง Daytona sandbox
   - เริ่ม build โปรเจกต์
   - แสดงสถานะแบบ real-time

2. **ในระหว่างพรีวิว**:
   - ส่ง heartbeat ทุก 30 วินาที
   - ติดตามเวลาการใช้งาน
   - แสดงลิงก์พรีวิวเมื่อพร้อม

3. **หยุดพรีวิว**:
   - คลิกปุ่ม "หยุดพรีวิว" 
   - หรือออกจากหน้า/ปิดแท็บ (auto-stop)
   - บันทึกเวลาใช้งานสุดท้าย
   - ลบ sandbox และทำความสะอาด

## การปรับแต่ง

### เปลี่ยนโควตารายวัน
แก้ไขใน `useDaytonaPreview.ts`:
```tsx
maxUsagePerDay: 7200, // 2 ชั่วโมง
```

### เปลี่ยนความถี่ heartbeat
แก้ไขใน `useDaytonaPreview.ts`:
```tsx
}, 60000); // 60 วินาที
```

### ปรับแต่ง UI
ส่ง `className` prop หรือแก้ไข styles ใน `page.tsx`

## ตัวอย่างการใช้งานจริง

ดูตัวอย่างการใช้งานใน:
- `Midori/src/app/(app)/(projects)/projects/[id]/page.tsx`
- `Midori/docs/daytona-preview.md`

## ข้อควรระวัง

1. **ความปลอดภัย**: ตรวจสอบ session และสิทธิ์ทุก API call
2. **ต้นทุน**: กำหนดโควตาและ auto-stop เพื่อควบคุมค่าใช้จ่าย  
3. **ประสิทธิภาพ**: ใช้ polling แบบจำกัดครั้งเพื่อไม่ให้โหลดเซิร์ฟเวอร์
4. **UX**: แสดงสถานะและข้อผิดพลาดให้ชัดเจน

สำหรับข้อมูลเพิ่มเติมดูได้ที่ `Midori/docs/daytona-preview.md`
