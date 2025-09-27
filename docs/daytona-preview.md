## พรีวิวโปรเจกต์ด้วย Daytona Sandbox สำหรับหน้า `src/app/(app)/(projects)/projects/[id]/page.tsx`

เอกสารฉบับนี้สรุปแนวทางเชื่อมต่อ Daytona SDK เพื่อสร้าง sandbox สำหรับรันและพรีวิวงาน (เช่น การ build/serve เนื้อหาเว็บที่ได้จาก `promptJson`) โดยทริกเกอร์จากหน้าโปรเจกต์ `page.tsx` และเตรียมนำไปผนวกกับปุ่ม `GenerateSiteButton` ภายหลัง

- อ้างอิง: [Daytona Documentation](https://www.daytona.io/docs/)

### วัตถุประสงค์
- ใช้ Daytona Sandbox เพื่อรันคำสั่ง build/serve แบบแยกสภาพแวดล้อม (isolated) โดยไม่กระทบเครื่องนักพัฒนา
- รับผลลัพธ์การรันคำสั่งกลับมา (stdout/stderr/exit code) หรือดึง URL สำหรับพรีวิว (ถ้าตั้งค่าเซิร์ฟเวอร์ภายใน sandbox)
- ผูกการทำงานผ่าน API ของ Next.js และเรียกจาก UI หน้าโปรเจกต์ด้วยปุ่มเดียว

### บทบาทของ `page.tsx`
ไฟล์ `src/app/(app)/(projects)/projects/[id]/page.tsx` มีหน้าที่:
- ตรวจสอบ session และอ่าน `projectId` จาก `params`
- ดึง `promptJson` ผ่าน `getPromptJson(projectId)`
- แสดงปุ่ม `GenerateSiteButton` เพื่อสั่งงานสร้าง/พรีวิวไซต์ในขั้นถัดไป

ตัวอย่างโค้ดส่วนสำคัญ (มีอยู่แล้วในโปรเจกต์):
```12:28:Midori/src/app/(app)/(projects)/projects/[id]/page.tsx
  const { id: projectId } = await params;
  const promptJson = await getPromptJson(projectId);
```

### ภาพรวม Daytona SDK (สรุปจาก Quick Start)
Daytona มี SDK สำหรับ Python และ TypeScript เพื่อสร้างและควบคุม sandbox สำหรับรันโค้ด/คำสั่งได้อย่างปลอดภัย:
- ติดตั้งแพ็กเกจ TypeScript: `npm install @daytonaio/sdk`
- สร้าง client: `const daytona = new Daytona({ apiKey: 'your-api-key' });`
- สร้าง sandbox: `const sandbox = await daytona.create({ language: 'typescript' });`
- รันคำสั่ง: `await sandbox.process.codeRun('echo "Hello"')`
- ลบ sandbox: `await sandbox.delete()`

ดูรายละเอียดฉบับเต็มได้ที่เอกสารทางการ [Daytona Documentation](https://www.daytona.io/docs/)

### การตั้งค่าในโปรเจกต์ Midori

1) ติดตั้ง SDK
```bash
npm install @daytonaio/sdk
```

2) ตั้งค่า API Key เป็น environment variable (เช่นใน `.env.local` ของ Next.js)
```
ทรัพยากรและโควตา
กำหนด timeouts ต่อคำสั่งและต่อ sandbox ทั้งวงจรชีวิต
จำกัด concurrency ต่อผู้ใช้/ต่อโปรเจกต์ และคิวงานถ้ามีเรียกพร้อมกัน
ตั้งค่า auto-delete เมื่อไม่มี heartbeat หรือถึง TTL สูงสุด=ใส่ค่า_api_key_ที่ได้จาก_Daytona_Dashboard
```

3) สร้าง API Route สำหรับสั่งพรีวิวด้วย Daytona
สร้างไฟล์ (ตัวอย่าง) `src/app/api/preview/daytona/route.ts` เพื่อ:
- ตรวจสอบสิทธิ์ผู้ใช้จาก session
- รับ `projectId` จาก body
- เรียก Daytona SDK เพื่อสร้าง sandbox และรันคำสั่ง build/serve ตามที่เราต้องการ
- ส่งผลลัพธ์การรันกลับมาที่ client (stdout, stderr, exitCode) และ/หรือ URL สำหรับพรีวิวถ้าได้ตั้งค่าเซิร์ฟเวอร์ภายใน sandbox

ตัวอย่างโค้ดแนวทาง (ใช้เพื่ออ้างอิง ไม่ได้ถูกเพิ่มลงโปรเจกต์อัตโนมัติ):
```ts
import { NextRequest, NextResponse } from 'next/server';
import { Daytona } from '@daytonaio/sdk';

export async function POST(req: NextRequest) {
  try {
    const { projectId } = await req.json();
    if (!projectId) {
      return NextResponse.json({ error: 'Missing projectId' }, { status: 400 });
    }

    // TODO: ตรวจสอบ session/role ตามระบบ auth ของโปรเจกต์

    const apiKey = process.env.DAYTONA_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'DAYTONA_API_KEY not configured' }, { status: 500 });
    }

    const daytona = new Daytona({ apiKey });

    // 1) สร้าง sandbox (กำหนด language หรือภาพรวม runtime ที่ต้องการ)
    const sandbox = await daytona.create({ language: 'typescript' });

    // 2) ติดตั้ง dependency/เตรียมไฟล์ (ถ้าต้องการ อาจอัปโหลดไฟล์หรือ git clone ภายใน sandbox ก่อน)
    // ตัวอย่างรันคำสั่งพื้นฐาน
    const installResp = await sandbox.process.codeRun('npm --version');
    if (installResp.exit_code !== 0) {
      await sandbox.delete();
      return NextResponse.json({ error: 'Failed to prepare sandbox', detail: installResp.result }, { status: 500 });
    }

    // 3) รัน build หรือ serve สำหรับพรีวิว
    // ตัวอย่าง: ถ้ามีโฟลเดอร์ `out/` จากขั้นสร้างเว็บอยู่แล้วใน sandbox
    // คุณอาจใช้ http-server เพื่อ serve แบบชั่วคราว (ต้องมีการติดตั้ง)
    // หมายเหตุ: ปรับคำสั่งตามจริงให้เข้ากับวิธี build ของ Midori
    const serveResp = await sandbox.process.codeRun('npx http-server ./out -p 3000');

    // หมายเหตุ: เอกสาร Daytona มีหัวข้อ Preview & Authentication
    // สามารถเชื่อมความสามารถ Preview URL ได้ตามแนวทางในเอกสารอย่างเป็นทางการ

    // 4) ส่งผลลัพธ์กลับมา (ในเบื้องต้นส่ง stdout/stderr/exit code)
    return NextResponse.json({
      result: serveResp.result,
      exitCode: serveResp.exit_code,
      // previewUrl: 'ใส่ URL ถ้าเชื่อมกับฟีเจอร์ Preview ของ Daytona แล้ว',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message ?? 'Unexpected error' }, { status: 500 });
  }
}
```

หมายเหตุ:
- ส่วนการได้มาของ Preview URL ให้ยึดตามหัวข้อ “Preview & Authentication” ในเอกสาร Daytona (ลิงก์รายการหัวข้ออยู่ในหน้าเอกสารหลักเดียวกัน)
- หากต้องการ build โปรเจกต์จริงใน sandbox อาจต้องอัปโหลดไฟล์หรือดึงจาก Git (ดูหัวข้อ “Git Operations” ในเอกสาร)

### การเชื่อมกับ UI (`GenerateSiteButton` บน `page.tsx`)
ขั้นถัดไปเราสามารถแก้ `GenerateSiteButton` ให้เรียก API ข้างต้น:
1) เมื่อคลิกปุ่ม ให้ POST ไปที่ `/api/preview/daytona` พร้อม `{ projectId }`
2) แสดงผลลัพธ์ที่ได้ (เช่น stdout/exitCode) และถ้ามี `previewUrl` ให้เรนเดอร์ลิงก์เปิดพรีวิว

ตัวอย่างแนวคิดฝั่ง client (pseudo-code):
```ts
async function handlePreview(projectId: string) {
  const res = await fetch('/api/preview/daytona', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ projectId }),
  });
  const data = await res.json();
  // แสดง data.result/exitCode และถ้ามี data.previewUrl ให้กดเปิดดูได้
}
```

### แนวทางประยุกต์กับข้อมูล `promptJson`
- เมื่อ `page.tsx` โหลดได้ `promptJson` ของโปรเจกต์แล้ว เราสามารถส่งข้อมูลนี้ (หรือไฟล์ที่สร้างจากมัน) เข้าไปยัง sandbox เพื่อ build พรีวิว
- ตัวเลือกการส่งข้อมูลเข้า sandbox:
  - อัปโหลดไฟล์ขึ้น sandbox ก่อน แล้วจึงรัน build
  - ใช้ git repository ที่ commit ไฟล์ผลลัพธ์ไว้ แล้ว `git clone` ภายใน sandbox (ดูหัวข้อ Git Operations ในเอกสาร Daytona)

### ความปลอดภัยและการทำความสะอาดทรัพยากร
- ตรวจสอบสิทธิ์ผู้ใช้เสมอใน API Route
- เก็บรักษา `DAYTONA_API_KEY` ในฝั่ง server เท่านั้น ห้ามเผยใน client
- ลบ sandbox เมื่อพ้นการใช้งาน หากไม่ได้ต้องการรันต่อเนื่อง

### เช็กลิสต์นำไปใช้จริง
- [ ] ตั้งค่า `DAYTONA_API_KEY` ใน `.env.local`
- [ ] สร้าง API Route `/api/preview/daytona` ตามแนวทาง
- [ ] ปรับคำสั่ง build/serve ให้ตรงกับกระบวนการของ Midori
- [ ] เชื่อม `GenerateSiteButton` ให้เรียก API และแสดงผลลัพธ์/ลิงก์พรีวิว
- [ ] จัดการวงจรชีวิต sandbox (สร้าง/ลบ) ให้เหมาะสม

### การปิดคำเตือนพรีวิว (Preview Warning Page)
เมื่อเปิดลิงก์พรีวิวครั้งแรกในเบราว์เซอร์ ระบบจะแสดงหน้าเตือน (Warning Page) เพื่อแจ้งความเสี่ยงจากการเข้าชมพรีวิว URL ซึ่งเป็นมาตรการด้านความปลอดภัย หน้าเตือนนี้จะปรากฏเฉพาะเมื่อโหลดลิงก์จากเบราว์เซอร์เท่านั้น

หากต้องการหลีกเลี่ยงหน้าเตือน ให้ส่ง HTTP header ต่อไปนี้ในการเรียกขอพรีวิว:

```
X-Daytona-Skip-Preview-Warning: true
```

ตัวอย่างการเรียกด้วย `fetch` ฝั่ง client:

```ts
const res = await fetch(previewUrl, {
  method: 'GET',
  headers: {
    'X-Daytona-Skip-Preview-Warning': 'true',
  },
});
```

ตัวอย่างด้วย `curl`:

```bash
curl -H "X-Daytona-Skip-Preview-Warning: true" "${PREVIEW_URL}"
```

หมายเหตุ: โปรดอ้างอิงหัวข้อ Preview & Authentication ในเอกสารทางการเพื่อดูรายละเอียดล่าสุด และตรวจสอบนโยบายความปลอดภัยของระบบคุณประกอบการใช้งาน

### ปิดการทำงานพรีวิวเมื่อผู้ใช้ไม่อยู่ในหน้า (Auto-stop on Inactivity)
เพื่อควบคุมต้นทุนและความปลอดภัย ควรปิด/หยุดพรีวิวเมื่อผู้ใช้ไม่ได้อยู่ในหน้า (เช่น ย้ายแท็บ ปิดแท็บ หรือออกจากหน้า) โดยใช้แนวทางต่อไปนี้:

1) ฝั่ง Client: ใช้ Page Visibility API และ beforeunload เพื่อเรียก API ลบ sandbox

```ts
// ตัวอย่างฝั่ง client (React/Next.js) เรียกหยุดพรีวิวเมื่อผู้ใช้ออกจากหน้า
import { useEffect } from 'react';

export function useAutoStopPreview(sandboxId?: string) {
  useEffect(() => {
    if (!sandboxId) return;

    const stopPreview = async () => {
      try {
        await fetch('/api/preview/daytona/stop', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sandboxId }),
          keepalive: true, // สำคัญสำหรับ unload
        });
      } catch {}
    };

    const onVisibility = () => {
      if (document.hidden) stopPreview();
    };

    const onBeforeUnload = () => {
      // เรียกแบบ sync-ish ผ่าน keepalive เพื่อปิด sandbox
      stopPreview();
    };

    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('beforeunload', onBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('beforeunload', onBeforeUnload);
    };
  }, [sandboxId]);
}
```

2) ฝั่ง Server: เพิ่ม API สำหรับลบ sandbox

```ts
// ตัวอย่างแนวทาง: src/app/api/preview/daytona/stop/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Daytona } from '@daytonaio/sdk';

export async function POST(req: NextRequest) {
  try {
    const { sandboxId } = await req.json();
    if (!sandboxId) {
      return NextResponse.json({ error: 'Missing sandboxId' }, { status: 400 });
    }

    // TODO: ตรวจสอบ session/สิทธิ์
    const apiKey = process.env.DAYTONA_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'DAYTONA_API_KEY not configured' }, { status: 500 });
    }

    const daytona = new Daytona({ apiKey });
    // เรียก delete เพื่อลบ sandbox
    await daytona.delete(sandboxId);

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Unexpected error' }, { status: 500 });
  }
}
```

3) ทางเลือกเสริม: Heartbeat/Timeout
- ให้ฝั่ง client ส่ง heartbeat (เช่น ทุก 15–30 วินาที) ไปยัง API พร้อม `sandboxId`
- ฝั่ง server เก็บ timestamp ล่าสุดไว้ (เช่น ใน memory/Redis)
- หากไม่มี heartbeat เกินระยะที่กำหนด ให้ลบ sandbox อัตโนมัติ

ข้อควรระวัง:
- เก็บ `DAYTONA_API_KEY` ฝั่ง server เท่านั้น
- ตรวจสอบสิทธิ์ผู้ใช้ก่อนสั่งลบ sandbox เสมอ
- ระวังการปิด sandbox เร็วเกินไปในกรณีที่ผู้ใช้สลับแท็บชั่วคราว

อ้างอิงแนวทาง Preview/การเข้าถึงและการทำงานของ Sandbox: [Daytona Documentation](https://www.daytona.io/docs/)

### ทรัพยากรและโควตา (Resources & Quotas)
วัตถุประสงค์: คุมต้นทุน, ป้องกันการใช้งานเกินจำเป็น, และเพิ่มความเสถียรของระบบพรีวิว

1) Timeouts ต่อคำสั่งและทั้งวงจรชีวิต sandbox

```ts
// ตัวอย่าง: ห่อการเรียก codeRun ด้วย timeout ฝั่ง server
async function runWithTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return await Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('TIMEOUT')), ms)),
  ]);
}

// ใช้งาน
const resp = await runWithTimeout(sandbox.process.codeRun('npm run build:preview'), 5 * 60_000); // 5 นาที
```

2) จำกัด Concurrency ต่อผู้ใช้/โปรเจกต์ และทำคิว (Queue) หากเรียกพร้อมกัน

แนวคิด:
- กำหนดค่าสูงสุด sandbox ที่อนุญาตต่อ `userId`/`projectId` (เช่น 1–2 simultaneous)
- หากถึงเพดาน ให้คิวคำขอ หรือปฏิเสธด้วยข้อความแนะนำ

ตัวอย่างสเก็ตช์โค้ดตรวจสอบก่อนสร้าง sandbox:

```ts
// pseudo: in-memory counter (แนะนำใช้ Redis/DB ในโปรดักชั่น)
const userRunningCount = new Map<string, number>();

function canStartPreview(userId: string, maxConcurrent = 1) {
  const count = userRunningCount.get(userId) ?? 0;
  return count < maxConcurrent;
}

function markStart(userId: string) {
  userRunningCount.set(userId, (userRunningCount.get(userId) ?? 0) + 1);
}

function markStop(userId: string) {
  const next = Math.max(0, (userRunningCount.get(userId) ?? 0) - 1);
  userRunningCount.set(userId, next);
}
```

3) ตั้งค่า Auto-delete เมื่อไม่มี heartbeat หรือถึง TTL สูงสุด

แนวคิด:
- เก็บ `lastHeartbeatAt` ต่อ `sandboxId`
- Cron/Background task ตรวจทุก N นาที: ถ้า `now - lastHeartbeatAt > idleTTL` ให้ลบ sandbox
- เพิ่ม hard TTL: ถ้า `now - createdAt > maxTTL` ให้ลบ sandbox แม้ยังมี heartbeat

ตัวอย่างข้อมูลสถานะ (ควรเก็บใน DB/Redis):

```ts
type SandboxState = {
  sandboxId: string;
  userId: string;
  projectId: string;
  createdAt: number;
  lastHeartbeatAt: number;
};
```

4) จำกัดเวลาพรีวิวรวมต่อผู้ใช้: อยู่ในหน้าพรีวิวได้ 1 ชั่วโมง/วัน

กลไกที่แนะนำ:
- บันทึก “เวลาการใช้งานสะสมรายวัน” ต่อ `userId` (เช่น หน่วยเป็นวินาที)
- เริ่มจับเวลาเมื่อพรีวิวเริ่ม และหยุดเมื่อผู้ใช้ออกจากหน้า/สั่ง stop/หมด heartbeat
- ก่อนเริ่มพรีวิวใหม่ ตรวจว่ายอดสะสมวันนี้ < 3600 วินาที หากเกิน ปฏิเสธและแจ้งผู้ใช้

ตัวอย่างสเก็ตช์โค้ดตรวจสิทธิ์ก่อนสร้าง sandbox:

```ts
async function getTodayUsageSeconds(userId: string): Promise<number> {
  // TODO: อ่านจาก DB/Redis ตามวันที่ (UTC หรือโซนที่คุณกำหนด)
  return 0;
}

async function assertUnderDailyCap(userId: string, dailyCapSeconds = 3600) {
  const used = await getTodayUsageSeconds(userId);
  if (used >= dailyCapSeconds) {
    throw new Error('คุณใช้เวลาพรีวิวครบโควตาวันนี้แล้ว (1 ชั่วโมง)');
  }
}

// ก่อนสร้าง sandbox
await assertUnderDailyCap(userId);
```

ตัวอย่าง API บันทึกเวลาการใช้งาน (เรียกเมื่อเริ่ม/หยุด/heartbeat):

```ts
// POST /api/preview/usage
// body: { sandboxId, userId, deltaSeconds }
export async function POST(req: NextRequest) {
  const { sandboxId, userId, deltaSeconds } = await req.json();
  // TODO: บวกค่า deltaSeconds เข้า usage ของวันนี้สำหรับ userId
  // แนะนำป้องกันการบวกถี่ๆ โดยรวมเวลาจาก heartbeat เป็นช่วงๆ
  return NextResponse.json({ ok: true });
}
```

หมายเหตุ:
- ใช้ Redis/DB เพื่อความแม่นยำและรองรับหลายอินสแตนซ์
- ซิงก์การบวกเวลาอย่างระมัดระวัง (idempotent) และป้องกันการนับซ้ำซ้อน
- แจ้งผู้ใช้เมื่อใกล้ถึงโควตา (เช่น เหลือ 5 นาที)

อ้างอิงภาพรวมการจัดการ Sandbox/Preview: [Daytona Documentation](https://www.daytona.io/docs/)

### ต้นทุนและการจัดการวงจรชีวิต (Cost & Lifecycle Management)
แนวทางเพื่อลดค่าใช้จ่ายและป้องกันทรัพยากรค้าง:

1) ค่าเริ่มต้น: หยุด sandbox เมื่อไม่มีผู้ชมพรีวิว และ hard cap ชั่วโมงต่อวัน/ผู้ใช้
- ใช้กลไก auto-stop จากส่วน “ปิดการทำงานพรีวิวเมื่อผู้ใช้ไม่อยู่ในหน้า” เพื่อหยุดเมื่อแท็บไม่โฟกัส/ปิดหน้า
- บังคับ hard cap รายวันต่อผู้ใช้ (เช่น 1 ชั่วโมง/วัน) ก่อนอนุญาตเริ่มพรีวิวใหม่ ดูตัวอย่างในส่วนโควตา

2) Cron/Lambda cleanup สำหรับ sandbox ค้าง
- สร้างงานตามเวลา (เช่น CloudWatch Events/Cron/Serverless Schedule) ตรวจทุก N นาทีเพื่อลบ sandbox ที่เกิน TTL หรือไม่มี heartbeat

ตัวอย่าง Pseudo handler:
```ts
// เรียกทุก 10 นาที: ลบ sandbox ที่หมดอายุหรือ idle เกินกำหนด
export async function cleanupStaleSandboxes() {
  const now = Date.now();
  const states = await listSandboxStates(); // อ่านจาก DB/Redis
  for (const s of states) {
    const idleTooLong = now - s.lastHeartbeatAt > 15 * 60_000; // 15 นาที
    const overMaxTTL = now - s.createdAt > 2 * 60 * 60_000; // 2 ชั่วโมง
    if (idleTooLong || overMaxTTL) {
      try { await deleteSandboxById(s.sandboxId); } catch {}
      await markSandboxDeleted(s.sandboxId);
    }
  }
}
```

3) สรุปยอดการใช้งานต่อโปรเจกต์/ต่อผู้ใช้ เพื่อ monitor ค่าใช้จ่าย
- บันทึกสถิติ: เวลาพรีวิวสะสม, จำนวน sandbox ที่สร้าง/ลบ, จำนวนคำสั่งที่รัน, ขนาดทรัพยากร
- สร้างรายงานรายวัน/รายสัปดาห์ แยกตาม `projectId` และ `userId`
- แสดงบนแดชบอร์ดหรือส่งแจ้งเตือนเมื่อใกล้ชนเพดานโควตา

อ้างอิง: [Daytona Documentation](https://www.daytona.io/docs/)

### สร้าง GitHub Repository สำหรับโค้ดพรีวิวของโปรเจกต์
เป้าหมาย: จัดเก็บโค้ดพรีวิว (เช่น ไฟล์ที่ build แล้วหรือโครงสร้างโปรเจกต์พรีวิว) ลงใน GitHub repo ใหม่โดยอัตโนมัติ เพื่อให้ติดตามการเปลี่ยนแปลง/ร่วมงานได้สะดวก และเชื่อมต่อ workflow อื่นๆ ต่อไป

ทางเลือกการทำงาน:
- สร้าง repo ผ่าน GitHub API แล้วอัปโหลดไฟล์ด้วย Contents API หรือ push ผ่าน git
- ทำกระบวนการ push จากฝั่ง Server หรือจาก Daytona Sandbox (เหมาะเมื่อ build อยู่ใน sandbox อยู่แล้ว)

1) สร้าง Repository ผ่าน GitHub REST API (ฝั่ง Server)

```ts
// ตัวอย่าง Next.js Route: สร้าง repo ใหม่ในบัญชีผู้ใช้/องค์กร
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { name, description = 'Preview repository for Midori project', isPrivate = true, org } = await req.json();

  const token = process.env.GITHUB_TOKEN; // ควรเป็น Fine-grained token หรือ GitHub App token ที่มีสิทธิ์จำเป็น
  if (!token) return NextResponse.json({ error: 'GITHUB_TOKEN not set' }, { status: 500 });

  const endpoint = org
    ? `https://api.github.com/orgs/${org}/repos`
    : 'https://api.github.com/user/repos';

  const resp = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name,
      description,
      private: isPrivate,
      // optional: auto_init: true, license_template: 'mit'
    }),
  });

  const data = await resp.json();
  if (!resp.ok) {
    return NextResponse.json({ error: data?.message ?? 'Create repo failed', detail: data }, { status: resp.status });
  }
  return NextResponse.json({ ok: true, repo: data });
}
```

2) อัปโหลดไฟล์ด้วย GitHub Contents API (เหมาะไฟล์จำนวนน้อย/ขนาดเล็ก)

```ts
// PUT /repos/{owner}/{repo}/contents/{path}
async function putFile(owner: string, repo: string, path: string, contentBase64: string, message: string) {
  const token = process.env.GITHUB_TOKEN!;
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message, content: contentBase64 }),
  });
  if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
}

// การแปลง buffer เป็น base64
// const contentBase64 = Buffer.from(fileBuffer).toString('base64');
```

ข้อดี: ง่ายสำหรับไฟล์จำนวนเล็ก ข้อจำกัด: ไม่เหมาะกับโฟลเดอร์ใหญ่หรือ binary จำนวนมาก

3) Push ผ่าน git (เหมาะกับโครงสร้างไฟล์จำนวนมาก/ build artifacts)

ทางเลือก A: ฝั่ง Server (มีไฟล์อยู่บน server)

```bash
# ตัวอย่างสคริปต์: เตรียม repo และ push ขึ้น GitHub (ใช้ PAT ผ่าน HTTPS)
git init
git config user.name "Midori Preview Bot"
git config user.email "preview-bot@example.com"
git add .
git commit -m "chore(preview): initial"
git branch -M preview
git remote add origin https://<TOKEN>@github.com/<owner>/<repo>.git
git push -u origin preview
```

ทางเลือก B: รันจาก Daytona Sandbox (สะดวกเมื่อ build อยู่ใน sandbox)

```ts
// รันคำสั่งใน sandbox (สมมติว่า artifacts อยู่ในโฟลเดอร์ app/out)
await sandbox.process.codeRun(
  [
    'cd app/out',
    'git init',
    'git config user.name "Midori Preview Bot"',
    'git config user.email "preview-bot@example.com"',
    'git add .',
    'git commit -m "chore(preview): initial"',
    'git branch -M preview',
    // แนะนำใช้ Deploy Key/HTTPS + token แบบ least-privilege
    'git remote add origin https://<TOKEN>@github.com/<owner>/<repo>.git',
    'git push -u origin preview',
  ].join(' && ')
);
```

ข้อควรระวังความปลอดภัย:
- หลีกเลี่ยงการฝัง token ใน command logs ใช้ environment variables/Secrets ให้เหมาะสม
- พิจารณาใช้ GitHub App หรือ Deploy Key แทน PAT และจำกัดสิทธิ์เฉพาะ repo ที่จำเป็น
- ลบ/หมุน token เป็นระยะ และไม่เผยแพร่บน client

4) โครงสร้าง repo ที่แนะนำสำหรับพรีวิว
- โฟลเดอร์ `src/` (ถ้ามี source), `out/` (artifacts), และไฟล์ `README.md` อธิบายวิธีพรีวิว
- ตั้ง branch `preview` แยกจาก main เพื่อไม่รบกวนโค้ดหลัก
- ใช้ GitHub Actions สร้างพรีวิวอัตโนมัติ เมื่อมีการอัปเดต (ดูหัวข้อ GitHub Integration)

5) เวิร์กโฟลว์ตัวอย่าง end-to-end
- สร้าง repo -> build ใน Daytona -> push artifacts ไป branch `preview` -> คอมเมนต์ลิงก์พรีวิวใน PR -> auto-stop และ cleanup ตามโควตา/TTL

อ้างอิง: [Daytona Documentation](https://www.daytona.io/docs/)

### การเชื่อมต่อกับ GitHub (GitHub Integration)
เป้าหมาย: ให้พรีวิวถูกสร้างจากสาขา (branch) หรือ Pull Request โดยอัตโนมัติ และส่งลิงก์พรีวิวกลับไปที่ GitHub

ข้อกำหนดเบื้องต้น:
- จัดเก็บ GitHub Token ที่มีสิทธิ์อ่าน repo (และเขียนคอมเมนต์ PR หากต้องการ) ไว้ฝั่ง server เช่น `GITHUB_TOKEN`
- ระบุ `repo`, `branch` หรือ `pull_request` ที่ต้องการสร้างพรีวิว

1) สร้าง sandbox แล้ว `git clone`

```ts
import { Daytona } from '@daytonaio/sdk';

const daytona = new Daytona({ apiKey: process.env.DAYTONA_API_KEY! });

// ตัวอย่างอินพุต
const repoUrl = 'https://github.com/your-org/your-repo.git';
const branch = 'feature/preview';

const sandbox = await daytona.create({ language: 'typescript' });

// ส่ง token ผ่าน env ของคำสั่งถ้าจำเป็น (เช่น ใช้ HTTPS + PAT)
// หมายเหตุ: พิจารณาใช้ GitHub App/Deploy Key ตามนโยบายความปลอดภัยขององค์กร
const setup = await sandbox.process.codeRun(
  `git clone --depth=1 --branch ${branch} ${repoUrl} app && cd app && npm ci && npm run build:preview`
);

// serve พรีวิว (ปรับให้ตรงกับเครื่องมือที่ใช้จริง)
const serve = await sandbox.process.codeRun('cd app && npx http-server ./out -p 3000');

// TODO: หากตั้งค่า Preview URL ผ่านความสามารถของ Daytona ให้ดึง URL ตรงนี้
```

2) Webhook จาก GitHub เพื่อสร้าง/อัปเดตพรีวิวเมื่อมี PR/Push

แนวคิด:
- ตั้งค่า GitHub Webhook (events: `pull_request`, `push`) ให้ชี้มาที่ API ของคุณ เช่น `/api/integrations/github`
- เมื่อได้รับอีเวนต์ ให้ตรวจสอบ repo/branch/PR แล้วเรียกกระบวนการสร้าง sandbox + build/serve ตามข้อ 1
- เก็บ mapping ระหว่าง `pull_number` และ `sandboxId` เพื่ออัปเดต/ลบเมื่อ PR ถูก close/merge

ร่าง API handler (ย่อ):
```ts
// POST /api/integrations/github
export async function POST(req: NextRequest) {
  const event = req.headers.get('x-github-event');
  const payload = await req.json();

  // TODO: ตรวจสอบลายเซ็น webhook (X-Hub-Signature-256)

  if (event === 'pull_request') {
    const action = payload.action; // opened/synchronize/closed
    const repoUrl = payload.repository.clone_url;
    const branch = payload.pull_request.head.ref;
    const prNumber = payload.number;

    if (action === 'opened' || action === 'synchronize') {
      // สร้าง/อัปเดตพรีวิว
      // - ถ้ามี sandbox เดิมของ PR นี้: ลบทิ้งก่อนหรือ reuse ตามนโยบาย
      // - สร้าง sandbox ใหม่แล้ว build/serve
      // - บันทึก sandboxId ผูกกับ prNumber
    }

    if (action === 'closed') {
      // ลบ sandbox ที่ผูกกับ PR เพื่อคืนทรัพยากร
    }
  }

  return NextResponse.json({ ok: true });
}
```

3) คอมเมนต์ URL พรีวิวกลับไปยัง Pull Request

```ts
// เมื่อได้ previewUrl แล้ว ใช้ GitHub API คอมเมนต์กลับไปยัง PR
await fetch(`https://api.github.com/repos/${owner}/${repo}/issues/${prNumber}/comments`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
  },
  body: JSON.stringify({ body: `Preview is ready: ${previewUrl}` }),
});
```

4) GitHub Actions (ทางเลือก)
- ตั้ง workflow ให้ยิงคำขอไปยัง API พรีวิวของคุณเมื่อมี PR/Push

ตัวอย่าง workflow ย่อ (`.github/workflows/preview.yml`):
```yaml
name: Preview
on:
  pull_request:
    types: [opened, synchronize, closed]
jobs:
  trigger-preview:
    runs-on: ubuntu-latest
    steps:
      - name: Call Preview API
        run: |
          curl -X POST \
            -H 'Content-Type: application/json' \
            -H 'Authorization: Bearer ${{ secrets.PREVIEW_API_TOKEN }}' \
            -d '{"repo":"${{ github.repository }}","prNumber":${{ github.event.number }}}' \
            https://your-api.example.com/api/integrations/github
```

5) ความปลอดภัยและแนวปฏิบัติ
- ใช้ least-privilege สำหรับ `GITHUB_TOKEN` หรือ GitHub App เฉพาะ repo ที่ต้องใช้
- ตรวจสอบลายเซ็น webhook (`X-Hub-Signature-256`) ทุกครั้ง
- Validate ชื่อ repo/branch/PR จาก allowlist/regex เพื่อลดความเสี่ยง
- ลบ sandbox อัตโนมัติเมื่อ PR ถูกปิด/merge หรือไม่มีการอัปเดตเกินกำหนด

อ้างอิง: [Daytona Documentation](https://www.daytona.io/docs/)

### อ้างอิง
- Daytona Docs: [https://www.daytona.io/docs/](https://www.daytona.io/docs/)


