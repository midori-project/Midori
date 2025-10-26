# Daytona Preview Hooks - Refactored

## 📁 โครงสร้างไฟล์ใหม่

```
src/hooks/
├── useDaytonaPreview.ts        # Main hook (150 lines, ลดลง 75%!)
├── useDaytonaPreview.ts.backup # Original file backup (601 lines)
└── daytona/
    ├── index.ts                # Central exports
    ├── hooks/
    │   ├── useFileComparison.ts    # File comparison logic
    │   ├── usePreviewCache.ts      # Cache management
    │   ├── useHeartbeat.ts         # Heartbeat management
    │   └── useApiDebounce.ts       # Request debouncing
    ├── services/
    │   ├── DaytonaApiService.ts    # API calls
    │   └── CacheService.ts         # Cache operations
    ├── utils/
    │   ├── fileUtils.ts           # File utilities
    │   ├── cacheUtils.ts          # Cache utilities
    │   └── constants.ts           # Configuration
    ├── types/
    │   └── preview.ts             # Type definitions
    └── README.md                  # This file
```

## 🔄 การเปลี่ยนแปลงหลัก

### ก่อน Refactor
- ไฟล์ `useDaytonaPreview.ts` เดียว: **601 บรรทัด**
- ทุกอย่างอยู่ในที่เดียว (Mixed Responsibilities)
- ยากต่อการ maintain และ test

### หลัง Refactor
- แบ่งเป็น **13 ไฟล์** ตามหน้าที่
- `useDaytonaPreview.ts` ใหม่: **150 บรรทัด** (ลดลง **75%**!)
- Separation of Concerns ชัดเจน
- Easy to maintain และ extend

## 🏗️ Architecture Overview

```
useDaytonaPreview (Main Hook)
├── useFileComparison (File State Management)
├── usePreviewCache (Cache Operations)
├── useHeartbeat (Keep Sandbox Alive)
├── useApiDebounce (Rate Limit Protection)
└── DaytonaApiService (API Calls)
```

## 📖 การใช้งาน

### 1. **Basic Usage** (เหมือนเดิม)
```typescript
import { useDaytonaPreview } from '@/hooks/useDaytonaPreview'

function MyComponent() {
  const {
    sandboxId,
    status,
    previewUrl,
    previewUrlWithToken,
    error,
    loading,
    startPreview,
    stopPreview,
    updateFiles,
    lastHeartbeat,
    isHeartbeatActive,
  } = useDaytonaPreview({
    projectId: 'my-project',
    files: projectFiles
  })

  // API เหมือนเดิมทุกอย่าง!
}
```

### 2. **Using Specialized Hooks** (ใหม่)
```typescript
import { 
  useFileComparison, 
  usePreviewCache, 
  useHeartbeat,
  useApiDebounce 
} from '@/hooks/daytona'

function AdvancedComponent() {
  // ใช้เฉพาะ file comparison
  const fileComparison = useFileComparison()
  
  // ใช้เฉพาะ cache management
  const cache = usePreviewCache('project-123')
  
  // ใช้เฉพาะ heartbeat
  const heartbeat = useHeartbeat(sandboxId, status)
  
  // ใช้เฉพาะ debounce
  const debounce = useApiDebounce()
}
```

### 3. **Using Services Directly** (ใหม่)
```typescript
import { DaytonaApiService, CacheService } from '@/hooks/daytona'

// API service
const apiService = new DaytonaApiService()
const result = await apiService.createSandbox(projectId, files)

// Cache service
const cacheService = new CacheService('project-123')
const isValid = cacheService.isValid(files)
```

## 🔧 Specialized Hooks อธิบาย

### **useFileComparison**
```typescript
const {
  compareFiles,        // เปรียบเทียบไฟล์หลายไฟล์
  updateFileState,     // อัปเดต file state
  hasChanges,          // เช็คว่ามีการเปลี่ยนแปลงหรือไม่
  getStats,            // ดูสถิติ file states
} = useFileComparison()
```

### **usePreviewCache**
```typescript
const {
  isValid,            // เช็คว่า cache ยังใช้ได้หรือไม่
  loadIfValid,        // โหลดจาก cache ถ้าใช้ได้
  updateAndLog,       // อัปเดต cache พร้อม log
  invalidateOnChange, // ล้าง cache เมื่อไฟล์เปลี่ยน
  getStats,           // ดูสถิติ cache
} = usePreviewCache(projectId)
```

### **useHeartbeat**
```typescript
const {
  lastHeartbeat,      // เวลา heartbeat ล่าสุด
  isHeartbeatActive,  // สถานะ heartbeat
  forceHeartbeat,     // ส่ง heartbeat ทันที
  getHeartbeatInfo,   // ข้อมูล heartbeat
} = useHeartbeat(sandboxId, status)
```

### **useApiDebounce**
```typescript
const {
  canProceed,         // เช็คว่าส่ง request ได้หรือไม่
  debounced,          // Execute function with debounce
  getTimeRemaining,   // เวลาที่เหลือก่อนส่ง request ได้
  getStats,           // สถิติ debounce
} = useApiDebounce()
```

## 🛠️ Services

### **DaytonaApiService**
```typescript
const api = new DaytonaApiService()

// Create sandbox
const result = await api.createSandbox(projectId, files)

// Update files
const updateResult = await api.updateFiles(sandboxId, projectId, comparisonResult)

// Delete sandbox
await api.deleteSandbox(sandboxId)

// Send heartbeat
await api.sendHeartbeat(sandboxId)
```

### **CacheService**
```typescript
const cache = new CacheService(projectId)

// Check validity
const isValid = cache.isValid(files)

// Update cache
cache.update(sandboxId, previewUrl, previewToken, files)

// Get stats
const stats = cache.getStats()
```

## ⚙️ Configuration

### **Customizing Heartbeat**
```typescript
// utils/constants.ts
export const HEARTBEAT_CONFIG = {
  interval: 2 * 60 * 1000, // 2 minutes
  timeout: 30 * 1000,      // 30 seconds
}
```

### **Customizing Cache**
```typescript
export const CACHE_CONFIG = {
  ttl: 5 * 60 * 1000,      // 5 minutes
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
}
```

### **Customizing Debounce**
```typescript
export const DEBOUNCE_CONFIG = {
  delay: 1000, // 1 second
}
```

## 📊 ประสิทธิภาพที่ดีขึ้น

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| **Main Hook Size** | 601 lines | 150 lines | 75% ลดลง |
| **Responsibilities** | 6+ mixed | 1 main + specialized | ชัดเจน |
| **Testability** | ❌ ยาก | ✅ ง่าย | มาก |
| **Reusability** | ❌ ไม่ได้ | ✅ ได้ | มาก |
| **Import Size** | ทั้งหมด | เฉพาะที่ต้องการ | เล็กลง |

## 🔄 Backward Compatibility

**API เหมือนเดิม 100%!** โค้ดที่ใช้ `useDaytonaPreview` จะทำงานเหมือนเดิมโดยไม่ต้องแก้อะไร

```typescript
// โค้ดเดิมยังใช้ได้เหมือนเดิม
const { status, previewUrl, startPreview } = useDaytonaPreview({
  projectId,
  files
})
```

## 🔄 วิธี Rollback (ถ้าจำเป็น)

```bash
# กลับไปใช้ไฟล์เดิม
cd src/hooks
cp useDaytonaPreview.ts.backup useDaytonaPreview.ts

# ลบ folder ที่สร้างใหม่ (ถ้าต้องการ)
rm -rf daytona
```

## 🚀 การใช้งานต่อไป

### ขยายฟีเจอร์ใหม่
1. เพิ่มฟีเจอร์ใน specialized hooks
2. สร้าง hook ใหม่ใน `hooks/` folder
3. เพิ่ม service ใหม่ใน `services/` folder

### การ Debug
- แต่ละ hook มี logging ชัดเจน
- Error handling ครอบคลุม
- Stats และ monitoring built-in

## ✅ สรุป

การ refactor ทำให้:
- **Main hook เล็กลงและอ่านง่าย** (601 → 150 บรรทัด)
- **แยกหน้าที่ชัดเจน** (Separation of Concerns)
- **ใช้ซ้ำได้** (Reusable specialized hooks)
- **Performance ดีขึ้น** (Import เฉพาะที่ต้องการ)
- **API เหมือนเดิม** (100% backward compatible)

🎉 **ความสำเร็จ: จาก 601 บรรทัด → 150 บรรทัด (ลดลง 75%!)**

