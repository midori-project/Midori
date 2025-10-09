# 📦 ProjectPreview Components

> ระบบ Preview และ Deployment สำหรับโปรเจค Midori  
> Refactored Version - กระชับ อ่านง่าย แยกฟีเจอร์ชัดเจน

---

## 📚 สารบัญ

1. [ภาพรวม](#ภาพรวม)
2. [โครงสร้างไฟล์](#โครงสร้างไฟล์)
3. [Custom Hooks](#custom-hooks)
4. [UI Components](#ui-components)
5. [การใช้งาน](#การใช้งาน)
6. [ฟีเจอร์หลัก](#ฟีเจอร์หลัก)
7. [Data Flow](#data-flow)

---

## 🎯 ภาพรวม

**ProjectPreview** เป็นระบบสำหรับแสดงและจัดการ Live Preview ของโปรเจค โดยรวมฟีเจอร์หลักดังนี้:

- ✅ **Live Preview** - แสดงผลแบบ real-time ผ่าน Daytona Sandbox
- ✅ **Code Editor** - แก้ไขโค้ดและดูผลทันที
- ✅ **WebSocket Sync** - อัพเดทอัตโนมัติเมื่อมีการเปลี่ยนแปลง
- ✅ **Deployment** - Deploy ไปยัง subdomain (*.midori.lol)
- ✅ **Responsive** - รองรับหลาย device types (desktop, tablet, mobile)

**ก่อน Refactor:** 832 บรรทัด (1 ไฟล์ยักษ์)  
**หลัง Refactor:** ~210 บรรทัด (แยกเป็น 13 ไฟล์)

---

## 📁 โครงสร้างไฟล์

```
src/
├── components/projects/
│   ├── ProjectPreview.tsx          # Main Component (210 บรรทัด)
│   ├── PreviewToolbar.tsx          # Toolbar with action buttons
│   ├── PreviewContent.tsx          # Content area (Editor + Preview)
│   ├── PreviewFooter.tsx           # Footer with status info
│   ├── DeploymentToast.tsx         # Toast notification
│   ├── EmptyStates/
│   │   ├── index.ts                # Export all empty states
│   │   ├── LoadingState.tsx        # Loading indicator
│   │   ├── NoSnapshotState.tsx     # No template message
│   │   ├── ErrorState.tsx          # Error display
│   │   └── PreviewLoadingState.tsx # Preview loading
│   └── README.md                   # This file
│
└── hooks/
    ├── useProjectData.ts           # Project data fetching
    ├── useDeployment.ts            # Deployment management
    └── useProjectWebSocket.ts      # WebSocket connection
```

---

## 🪝 Custom Hooks

### 1. `useProjectData`

**ไฟล์:** `src/hooks/useProjectData.ts`

จัดการการดึงและจัดเก็บข้อมูลโปรเจค

**Usage:**
```tsx
const {
  projectData,      // ข้อมูลโปรเจคทั้งหมด
  projectFiles,     // ไฟล์ของโปรเจค
  projectName,      // ชื่อโปรเจค
  isLoading,        // สถานะการโหลด
  error,            // ข้อผิดพลาด (ถ้ามี)
  hasSnapshot,      // มี snapshot หรือไม่
  refetch,          // ฟังก์ชันโหลดข้อมูลใหม่
} = useProjectData(projectId);
```

**ความรับผิดชอบ:**
- ดึงข้อมูลจาก `/api/projects/:id/snapshot`
- จัดการ loading และ error states
- ตรวจสอบว่ามี snapshot หรือไม่

---

### 2. `useDeployment`

**ไฟล์:** `src/hooks/useDeployment.ts`

จัดการ Deployment ไปยัง subdomain

**Usage:**
```tsx
const {
  deploy,              // ฟังก์ชัน deploy
  isDeploying,         // สถานะกำลัง deploy
  deploymentError,     // Error (ถ้ามี)
  deploymentSuccess,   // ข้อมูล deployment ที่สำเร็จ
  history,             // ประวัติ deployment
  clearError,          // ล้าง error
  generateSubdomain,   // สร้าง subdomain จากชื่อ
} = useDeployment(projectId, projectName);
```

**ความรับผิดชอบ:**
- Deploy โปรเจคไปยัง subdomain
- ดึงประวัติ deployment
- สร้าง subdomain จากชื่อโปรเจค
- จัดการ deployment states

---

### 3. `useProjectWebSocket`

**ไฟล์:** `src/hooks/useProjectWebSocket.ts`

จัดการ WebSocket connection สำหรับ real-time updates

**Usage:**
```tsx
const {
  isConnected,  // สถานะการเชื่อมต่อ
  error,        // Error (ถ้ามี)
} = useProjectWebSocket(projectId, onUpdate);
```

**ความรับผิดชอบ:**
- เชื่อมต่อ WebSocket
- Subscribe ไปยังโปรเจค
- ตรวจจับการอัพเดท
- เรียก callback เมื่อมีการเปลี่ยนแปลง

---

## 🧩 UI Components

### 1. `ProjectPreview` (Main)

**ไฟล์:** `src/components/projects/ProjectPreview.tsx`

Component หลักที่รวมทุกอย่างเข้าด้วยกัน

**Props:**
```tsx
interface ProjectPreviewProps {
  projectId: string;  // ID ของโปรเจค
}
```

**ความรับผิดชอบ:**
- ประสานงานระหว่าง hooks และ components
- จัดการ local state (device type, editor visibility)
- Keyboard shortcuts (Ctrl+E)

---

### 2. `PreviewToolbar`

**ไฟล์:** `src/components/projects/PreviewToolbar.tsx`

Toolbar ด้านบนพร้อมปุ่มควบคุมต่างๆ

**ฟีเจอร์:**
- ✅ Project info และ status
- ✅ ปุ่ม Refresh, Start/Stop Preview
- ✅ ปุ่ม Deploy
- ✅ Device selector (Desktop/Tablet/Mobile)
- ✅ Toggle Code Editor
- ✅ Files count

---

### 3. `PreviewContent`

**ไฟล์:** `src/components/projects/PreviewContent.tsx`

พื้นที่แสดงเนื้อหาหลัก

**ฟีเจอร์:**
- ✅ แสดง Empty States ตามสถานะ
- ✅ Code Editor (ซ้าย 2/3)
- ✅ Live Preview iframe (ขวา 1/3)
- ✅ Full screen mode

---

### 4. `PreviewFooter`

**ไฟล์:** `src/components/projects/PreviewFooter.tsx`

Footer ด้านล่างแสดงข้อมูลสถานะ

**ฟีเจอร์:**
- ✅ Files count
- ✅ Preview status
- ✅ Sandbox ID
- ✅ Deployment status และ link
- ✅ Invite/Upgrade buttons

---

### 5. `EmptyStates`

**ไฟล์:** `src/components/projects/EmptyStates/`

ชุด components สำหรับแสดงสถานะต่างๆ

#### `LoadingState`
แสดงเมื่อกำลังโหลดข้อมูล

#### `NoSnapshotState`
แสดงเมื่อยังไม่มีเทมเพลต พร้อมคำแนะนำการใช้งาน

#### `ErrorState`
แสดงเมื่อเกิดข้อผิดพลาด

#### `PreviewLoadingState`
แสดงก่อนเริ่ม preview หรือระหว่างโหลด พร้อม loading messages ที่สนุกสนาน

---

### 6. `DeploymentToast`

**ไฟล์:** `src/components/projects/DeploymentToast.tsx`

Toast notification สำหรับแสดงผลการ Deploy

---

## 🚀 การใช้งาน

### Basic Usage

```tsx
import ProjectPreview from '@/components/projects/ProjectPreview';

function ProjectPage() {
  return <ProjectPreview projectId="project-123" />;
}
```

### ใช้ Hooks แยก

```tsx
// ใช้เฉพาะ hook ที่ต้องการ
import { useProjectData } from '@/hooks/useProjectData';
import { useDeployment } from '@/hooks/useDeployment';

function CustomComponent({ projectId }: { projectId: string }) {
  const { projectFiles, hasSnapshot } = useProjectData(projectId);
  const { deploy, isDeploying } = useDeployment(projectId, 'my-project');

  return (
    <button onClick={deploy} disabled={!hasSnapshot || isDeploying}>
      {isDeploying ? 'Deploying...' : 'Deploy Now'}
    </button>
  );
}
```

---

## ✨ ฟีเจอร์หลัก

### 1. Live Preview
- ใช้ Daytona Sandbox สำหรับ preview แบบ real-time
- รองรับหลาย device types
- Auto-refresh เมื่อมี snapshot ใหม่

### 2. Code Editor
- แก้ไขไฟล์ได้โดยตรง
- ดูผลแปลงทันทีใน Preview
- Toggle on/off ด้วย Ctrl+E

### 3. WebSocket Sync
- อัพเดทอัตโนมัติเมื่อมีการสร้าง snapshot ใหม่
- แสดงสถานะการเชื่อมต่อ
- ไม่ต้องรีเฟรชหน้าเพจ

### 4. Deployment
- Deploy ไปยัง subdomain (*.midori.lol)
- Auto-generate subdomain จากชื่อโปรเจค
- แสดงประวัติ deployment
- Link ไปยัง deployed site

### 5. Empty States
- Loading state พร้อม animation
- No snapshot state พร้อมคำแนะนำ
- Error state พร้อมปุ่ม retry
- Preview loading พร้อม funny messages

---

## 🔄 Data Flow

```
┌─────────────────┐
│  ProjectPreview │  (Main Component)
└────────┬────────┘
         │
         ├─── useProjectData ────────> API: /api/projects/:id/snapshot
         │         │
         │         └─── projectFiles, hasSnapshot, projectName
         │
         ├─── useDeployment ─────────> API: /api/projects/:id/deploy
         │         │
         │         └─── deploy(), deploymentSuccess
         │
         ├─── useProjectWebSocket ───> WebSocket: /api/project-context/ws
         │         │
         │         └─── isConnected, onUpdate callback
         │
         ├─── useDaytonaPreview ─────> Daytona API
         │         │
         │         └─── previewUrl, sandboxId, startPreview()
         │
         ├──> PreviewToolbar
         │         └─── Action buttons, Device selector
         │
         ├──> PreviewContent
         │         ├─── EmptyStates (Loading, NoSnapshot, Error)
         │         ├─── CodeEditor
         │         └─── Live Preview iframe
         │
         ├──> PreviewFooter
         │         └─── Status info, Deploy button
         │
         └──> DeploymentToast
                   └─── Error notifications
```

---

## 🎨 Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl + E` (Windows) | Toggle Code Editor |
| `Cmd + E` (Mac) | Toggle Code Editor |

---

## 🐛 Troubleshooting

### ไม่มี Snapshot
**อาการ:** แสดง "ยังไม่มีเทมเพลตสำหรับโปรเจคนี้"  
**วิธีแก้:** สร้างเทมเพลตผ่าน Chat Interface ทางซ้าย

### WebSocket ไม่เชื่อมต่อ
**อาการ:** แสดง "🔌 Disconnected"  
**วิธีแก้:** ตรวจสอบว่า WebSocket server ทำงานปกติ

### Preview ไม่โหลด
**อาการ:** Loading นานเกินไป  
**วิธีแก้:** คลิก Stop Preview แล้วลอง Start Preview ใหม่

### Deploy ล้มเหลว
**อาการ:** แสดง "Deployment Failed"  
**วิธีแก้:** 
- ตรวจสอบว่ามี snapshot
- ตรวจสอบว่าชื่อโปรเจคถูกต้อง (ไม่มีตัวอักษรพิเศษ)
- ลองใหม่อีกครั้ง

---

## 📝 Maintenance Notes

### Adding New Empty State
1. สร้างไฟล์ใน `EmptyStates/`
2. Export ใน `EmptyStates/index.ts`
3. เพิ่ม condition ใน `PreviewContent.tsx`

### Adding New Hook
1. สร้างไฟล์ใน `src/hooks/`
2. Export ใน `src/hooks/index.ts`
3. Import และใช้ใน `ProjectPreview.tsx`

### Modifying Toolbar
แก้ไขใน `PreviewToolbar.tsx` - ปุ่มทั้งหมดอยู่ที่นี่

### Modifying Footer
แก้ไขใน `PreviewFooter.tsx` - status info อยู่ที่นี่

---

## 🙏 Credits

**Refactored by:** Midori Team  
**Date:** 2025  
**Version:** 2.0

**จากเดิม:** 832 บรรทัด (1 ไฟล์)  
**ปัจจุบัน:** ~210 บรรทัด (13 ไฟล์)  
**ปรับปรุง:** 74% reduction in main file size 🎉

---

## 📖 Additional Resources

- [Daytona Documentation](https://www.daytona.io/docs)
- [WebSocket API Documentation](../../../docs/websocket-api.md)
- [Deployment System Documentation](../../../docs/subdomain-deployment-system.md)
- [Preview Overview](../../../docs/preview-overview.md)

---

**Happy Coding! 🚀**

