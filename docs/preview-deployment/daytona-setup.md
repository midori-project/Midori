# การตั้งค่า Daytona สำหรับ Midori

## ภาพรวม

Midori ใช้ [Daytona](https://www.daytona.io/docs/) สำหรับการสร้างและจัดการ development sandboxes เพื่อให้ผู้ใช้สามารถพรีวิวโปรเจ็คได้แบบ real-time

## การตั้งค่า

### 1. สร้าง Daytona Account

1. ไปที่ [Daytona Dashboard](https://www.daytona.io/)
2. สร้างบัญชีใหม่
3. เข้าสู่ระบบ

### 2. สร้าง API Key

1. ไปที่ Dashboard
2. คลิก "API Keys" ในเมนู
3. คลิก "Create New API Key"
4. ตั้งชื่อ API Key (เช่น "Midori Production")
5. **สำคัญ**: คัดลอก API Key และเก็บไว้อย่างปลอดภัย (จะไม่แสดงอีกครั้ง)

### 3. ตั้งค่า Environment Variables

สร้างไฟล์ `.env.local` ในโฟลเดอร์ `Midori/`:

```bash
# Daytona Configuration
DAYTONA_API_KEY="your-daytona-api-key-here"
DAYTONA_BASE_URL="https://api.daytona.io"

# Database
DATABASE_URL="postgresql://username:password@localhost:5432/midori"

# Authentication
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Other configurations
NODE_ENV="development"
```

### 4. ติดตั้ง Dependencies

```bash
cd Midori
npm install @daytonaio/sdk
```

## การใช้งาน

### หน้าทดสอบ

เข้าไปที่ `/test` เพื่อทดสอบการทำงานของ Daytona:

1. **ข้อมูลโปรเจ็คทดสอบ**: แสดงข้อมูลจาก `test-cafe.json`
2. **ปุ่มเริ่มทดสอบ**: สร้าง sandbox และ build โปรเจ็ค
3. **สถานะ**: แสดงสถานะการทำงานแบบ real-time
4. **Preview URL**: ลิงก์ไปยังแอปที่รันใน sandbox

### API Endpoints

- `POST /api/preview/daytona` - สร้าง sandbox ใหม่
- `POST /api/preview/daytona/stop` - หยุด sandbox
- `GET /api/preview/daytona/status` - ตรวจสอบสถานะ sandbox

## Configuration

การตั้งค่าหลักอยู่ใน `src/config/daytona.ts`:

```typescript
export const daytonaConfig = {
  // API Key จาก environment variable
  apiKey: process.env.DAYTONA_API_KEY,
  
  // Base URL สำหรับ Daytona API
  baseUrl: process.env.DAYTONA_BASE_URL || 'https://api.daytona.io',
  
  // Default sandbox configuration
  defaultSandboxConfig: {
    language: 'typescript',
  },
  
  // Limits
  limits: {
    maxUsagePerDay: 3600, // 1 ชั่วโมง (วินาที)
    maxConcurrentSandboxes: 1, // จำกัด 1 sandbox ต่อผู้ใช้
  },
  
  // Timeouts
  timeouts: {
    sandboxCreation: 300000, // 5 นาที
    buildProcess: 600000, // 10 นาที
    statusPolling: 10000, // 10 วินาที
  },
};
```

## กระบวนการทำงาน

### 1. สร้าง Sandbox

```typescript
const daytona = new Daytona({ apiKey: daytonaConfig.apiKey });
const sandbox = await daytona.create({
  language: 'typescript',
});
```

### 2. สร้างไฟล์โปรเจ็ค

```typescript
// สร้างไฟล์ทั้งหมดในโปรเจ็ค
for (const file of files) {
  const createFileCommand = `mkdir -p "$(dirname '${file.path}')" && cat > '${file.path}' << 'EOF'\n${file.content}\nEOF`;
  const response = await sandbox.process.shell(createFileCommand);
  if (response.exit_code !== 0) {
    console.error(`Failed to create file ${file.path}:`, response.result);
  }
}
```

### 3. Build โปรเจ็ค

```typescript
// ติดตั้ง dependencies
const installResponse = await sandbox.process.shell('npm install');
if (installResponse.exit_code !== 0) {
  throw new Error(`npm install failed: ${installResponse.result}`);
}

// Build โปรเจ็ค
const buildResponse = await sandbox.process.shell('npm run build');
if (buildResponse.exit_code !== 0) {
  throw new Error(`Build failed: ${buildResponse.result}`);
}

// เริ่ม dev server
const devResponse = await sandbox.process.shell('npm run dev -- --host 0.0.0.0 --port 3000');
```

### 4. ตรวจสอบสถานะและดึง Preview URL

```typescript
const sandbox = await daytona.get(sandboxId);

// ดึง preview URL และ token
const previewInfo = await sandbox.getPreviewLink(3000);
const previewUrl = previewInfo.url; // https://3000-sandbox-123456.proxy.daytona.works
const previewToken = previewInfo.token; // vg5c0ylmcimr8b_v1ne0u6mdnvit6gc0
```

### 5. การเข้าถึง Preview URL

#### ผ่าน Browser
- คลิกลิงค์ preview URL โดยตรง
- ครั้งแรกจะแสดง warning page (security measure)
- หลังจากนั้นจะเข้าสู่แอปพลิเคชัน

#### ผ่าน curl (Programmatic Access)
```bash
# ใช้ header
curl -H "x-daytona-preview-token: vg5c0ylmcimr8b_v1ne0u6mdnvit6gc0" \
  https://3000-sandbox-123456.proxy.daytona.works

# หรือใช้ query parameter
curl "https://3000-sandbox-123456.proxy.daytona.works?DAYTONA_SANDBOX_AUTH_KEY=vg5c0ylmcimr8b_v1ne0u6mdnvit6gc0"
```

#### หลีกเลี่ยง Warning Page
```bash
# ส่ง header เพื่อข้าม warning
curl -H "x-daytona-skip-preview-warning: true" \
  -H "x-daytona-preview-token: vg5c0ylmcimr8b_v1ne0u6mdnvit6gc0" \
  https://3000-sandbox-123456.proxy.daytona.works
```

## การจัดการข้อผิดพลาด

### ข้อผิดพลาดทั่วไป

1. **DAYTONA_API_KEY not configured**
   - ตรวจสอบว่าได้ตั้งค่า environment variable แล้ว
   - ตรวจสอบว่า API Key ถูกต้อง

2. **Sandbox creation failed**
   - ตรวจสอบ API Key และ quota
   - ตรวจสอบ network connection

3. **Build failed**
   - ตรวจสอบไฟล์โปรเจ็ค
   - ตรวจสอบ dependencies ใน package.json

4. **npm install failed: TS2304: Cannot find name 'install'**
   - **สาเหตุ**: ใช้ `sandbox.process.codeRun()` แทน `sandbox.process.shell()`
   - **วิธีแก้**: ใช้ `sandbox.process.shell()` สำหรับ shell commands
   ```typescript
   // ❌ ผิด
   await sandbox.process.codeRun('npm install');
   
   // ✅ ถูก
   await sandbox.process.shell('npm install');
   ```

5. **File creation failed**
   - ตรวจสอบ path ของไฟล์
   - ตรวจสอบ permissions ใน sandbox

### การ Debug

1. ตรวจสอบ logs ใน console
2. ใช้หน้าทดสอบ `/test` เพื่อทดสอบ
3. ตรวจสอบสถานะ sandbox ใน Daytona Dashboard

## ข้อจำกัด

- **โควตาการใช้งาน**: 1 ชั่วโมงต่อวันต่อผู้ใช้
- **Concurrency**: 1 sandbox ต่อผู้ใช้
- **Timeout**: 5 นาทีสำหรับการสร้าง sandbox, 10 นาทีสำหรับ build
- **Idle Timeout**: 5 นาที (ถ้าไม่มี heartbeat จาก frontend จะถูกลบอัตโนมัติ)

## ระบบ Cleanup อัตโนมัติ

Midori มีระบบ cleanup อัตโนมัติเพื่อจัดการ Daytona sandboxes และป้องกันค่าใช้จ่ายที่ไม่จำเป็น

### การทำงานของ Cleanup Service

#### 1. Heartbeat Mechanism
- **Frontend** ส่ง heartbeat ไปยัง backend ทุก **2 นาที** เมื่อหน้าเว็บพรีวิวยังเปิดอยู่
- Heartbeat จะอัปเดต `lastHeartbeatAt` ของ sandbox เพื่อบอกว่ายังมีการใช้งาน

#### 2. Idle Cleanup (ทำงานทุก 5 นาที)
- ตรวจสอบ sandbox ที่ไม่มี heartbeat มากกว่า **5 นาที**
- ลบ sandbox เหล่านั้นออกจาก Daytona โดยอัตโนมัติ
- **พฤติกรรม**:
  - ✅ **หน้าเว็บยังเปิดอยู่**: มี heartbeat ทุก 2 นาที → **ไม่ถูกลบ**
  - ❌ **หน้าเว็บปิดแล้ว**: ไม่มี heartbeat → หลัง **5 นาที** → **ถูกลบ**

#### 3. Expired States Cleanup (ทำงานทุก 1 ชั่วโมง)
- ลบข้อมูล sandbox ที่เก่ามากกว่า **24 ชั่วโมง** ออกจาก memory
- ช่วยป้องกัน memory leak

#### 4. Stopped Cleanup (ทำงานทุก 1 ชั่วโมง)
- ลบข้อมูล sandbox ที่มีสถานะ `stopped` หรือ `error` มากกว่า **2 ชั่วโมง**
- ทำความสะอาด memory state ที่ไม่จำเป็น

### การตั้งค่า Cleanup Service

การตั้งค่าหลักอยู่ในไฟล์ `src/app/api/preview/daytona/route.ts`:

```typescript
class DaytonaCleanupService {
  // Cooldown period ระหว่าง idle cleanup (4 นาที)
  private static readonly IDLE_CLEANUP_COOLDOWN = 4 * 60 * 1000
  
  // Idle timeout: 5 นาที (ต้องมากกว่า heartbeat interval)
  const idleTimeout = 5 * 60 * 1000
  
  // ตรวจสอบ idle sandboxes ทุก 5 นาที
  setInterval(cleanupIdleSandboxes, 5 * 60 * 1000)
  
  // ตรวจสอบ expired states ทุก 1 ชั่วโมง
  setInterval(cleanupExpiredStates, 60 * 60 * 1000)
  
  // ตรวจสอบ stopped sandboxes ทุก 1 ชั่วโมง
  setInterval(cleanupStoppedSandboxes, 60 * 60 * 1000)
}
```

การตั้งค่า heartbeat อยู่ในไฟล์ `src/hooks/useDaytonaPreview.ts`:

```typescript
// ส่ง heartbeat ทุก 2 นาที
const heartbeatInterval = 2 * 60 * 1000
```

### ตัวอย่าง Timeline

```
เวลา   | สถานะหน้าเว็บ | Heartbeat | Sandbox
-------|---------------|-----------|----------
0:00   | เปิด          | ✓ ส่ง     | ยังอยู่ ✅
2:00   | เปิด          | ✓ ส่ง     | ยังอยู่ ✅
4:00   | เปิด          | ✓ ส่ง     | ยังอยู่ ✅
4:30   | ปิด           | ✗ หยุด    | ยังอยู่ ⏰
5:00   | ปิด           | ✗         | ยังอยู่ ⏰ (cleanup ทำงาน)
9:30   | ปิด           | ✗         | ถูกลบ ❌ (idle > 5 นาที)
```

### ประโยชน์

1. **ประหยัดต้นทุน**: ไม่มี sandbox วิ่งค้างเมื่อไม่มีการใช้งาน
2. **จัดการทรัพยากร**: ลบ sandbox ที่หมดอายุโดยอัตโนมัติ
3. **ป้องกัน Memory Leak**: ทำความสะอาด state ที่ล้าสมัย
4. **UX ที่ดี**: ผู้ใช้ไม่ต้องกังวลเรื่องการหยุด sandbox ด้วยตนเอง

### การดีบัก Cleanup Service

ตรวจสอบ console logs ที่มี prefix:
- `🧹 [IDLE CLEANUP]` - การทำงานของ idle cleanup
- `💓 [HEARTBEAT]` - การส่ง heartbeat จาก frontend
- `🔄 [CLEANUP SERVICE]` - สถานะของ cleanup service
- `🗑️` - การลบ sandbox

ตัวอย่าง log:
```
💓 [FRONTEND] Sending heartbeat for sandbox: abc123
✅ [FRONTEND] Heartbeat successful for sandbox: abc123
🧹 [IDLE CLEANUP] Starting idle sandboxes cleanup at 2025-10-09T10:30:00.000Z
⏰ [IDLE CLEANUP] Found idle sandbox: xyz789 (idle for 6 minutes)
🗑️ [IDLE CLEANUP] Successfully cleaned up idle sandbox: xyz789
```

### API สำหรับจัดการ Cleanup Service

#### ดูสถิติ
```bash
GET /api/preview/cleanup
```

Response:
```json
{
  "success": true,
  "stats": {
    "total": 5,
    "running": 3,
    "stopped": 2,
    "isServiceRunning": true
  }
}
```

#### เริ่ม/หยุด Service (Admin)
```bash
POST /api/preview/cleanup
Content-Type: application/json

{
  "action": "start"  // หรือ "stop", "cleanup", "sync", "memory"
}
```

## การอัปเดต

เมื่อมีการอัปเดต Daytona SDK:

```bash
npm update @daytonaio/sdk
```

ตรวจสอบ [Daytona Documentation](https://www.daytona.io/docs/) สำหรับการเปลี่ยนแปลง API
