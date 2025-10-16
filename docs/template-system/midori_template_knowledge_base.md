# 📚 Midori Template Knowledge Base (Frontend Agent Version)

## 1. ภาพรวมโครงการ

-   **Midori** = no-code web generator
    สำหรับเจ้าของธุรกิจและผู้ใช้ทั่วไป (SMB, personal, local biz)\
-   **MVP KPI** = จำนวนโปรเจ็คที่สร้างเสร็จและ deploy ได้จริง\
-   **Core features**:
    1.  สร้างเว็บจาก requirement (ถาม-ตอบ + AI refine)\
    2.  Edit/preview code แบบ real-time ผ่าน Daytona\
    3.  Deploy ไปยัง provider (Vercel, GitHub Pages, Netlify)

------------------------------------------------------------------------

## 2. Workflow หลัก

1.  **Input/Chat** → ผู้ใช้พิมพ์ความต้องการ\
2.  **Chat AI** → แปลงเป็น Command JSON\
3.  **Orchestrator AI** → สร้าง OrchestratorPlan (DAG)\
4.  **Frontend Agent** →
    -   เลือก UiTemplateVersion + สร้าง spec patch (Blueprint)\
    -   อัปเดต CopyBlock (Copywriter)\
    -   สร้าง ImageBrief/ImageAsset (Visual)\
    -   สร้าง PatchSet (Editor)\
    -   รวม PatchSet หลายชุด (Squasher)\
    -   Run tests และเก็บ artifacts (Tester)\
    -   วิเคราะห์ความผิดพลาด + เสนอ PatchSet ใหม่ (Debug)\
5.  **Snapshot/PreviewSession** → รัน preview ด้วย Daytona\
6.  **Deployment** → เผยแพร่ production

------------------------------------------------------------------------

## 3. ERD (Prisma Models) -- กลุ่มสำคัญ

### Core

-   **User** -- ผู้ใช้ระบบ\
-   **Project** -- โปรเจ็คเว็บ + owner, files, snapshots, previews,
    deployments\
-   **File** -- ไฟล์แต่ละตัว (code/text/asset)\
-   **Snapshot** -- ภาพรวมไฟล์ ณ เวลาหนึ่ง\
-   **PreviewSession** -- รันบน Daytona\
-   **Deployment** -- deploy ไป provider

### Templates / Spec

-   **UiTemplate** -- template หลัก (Landing, Portfolio, Restaurant
    ฯลฯ)\
-   **UiTemplateVersion** -- เวอร์ชันของ template +
    slots/constraints/files\
-   **SpecBundle / SpecVersion** -- single source of truth ของสเปก

### Content / Visual

-   **CopyBlock** -- text/i18n\
-   **ImageBrief** -- prompt/styleHints\
-   **ImageAsset** -- ภาพที่ generate ได้

### Editing / Testing

-   **PatchSet / Patch** -- การแก้ไข (diff, update/create/delete)\
-   **TestSuite / TestCase / TestRun / TestArtifact** -- การทดสอบ

### Orchestration / Agents

-   **Command / CommandEvent** -- entry point จาก Chat AI\
-   **OrchestratorPlan / OrchestratorTask / OrchestratorEdge** -- DAG
    ของงาน\
-   **Agent / Conversation / Message / ChatRun** -- AI agent, การสนทนา
    และการรัน

------------------------------------------------------------------------

## 4. Mapping Agent ↔️ Table

-   **Chat AI** → Command, CommandEvent, Conversation/Message\
-   **Orchestrator AI** → OrchestratorPlan/Task/Edge, อัปเดต Command\
-   **Frontend Agent** →
    -   Blueprint → UiTemplate/UiTemplateVersion →
        SpecBundle/SpecVersion\
    -   Copywriter → CopyBlock\
    -   Visual → ImageBrief → ImageAsset (โยงกับ File)\
    -   Editor → PatchSet/Patch → File/Snapshot\
    -   Squasher → รวม PatchSet (clean snapshot)\
    -   Tester → TestSuite/TestCase/TestRun/TestArtifact\
    -   Debug → วิเคราะห์ TestRun fail → เสนอ PatchSet ใหม่

------------------------------------------------------------------------

## 5. System Prompt & Config

-   **ไฟล์เก็บที่ /config และ /prompts**\
-   **Agent.systemPrompt** เก็บสรุป prompt หรือ path\
-   **Agent.config** เก็บ runtime config (schema, policy, model)\
-   **Profiles** -- dev vs prod (เลือก model/agent)\
-   **Guardrails** -- ไม่เขียนไฟล์จริง, ต้องผ่าน schema JSON,
    ถ้าไม่ชัวร์ถามทีเดียว

------------------------------------------------------------------------

## 6. แนวปฏิบัติสำคัญ

-   ใช้ **Command** เป็น single entry point → Orchestrator → DAG\
-   ใช้ **PatchSet** แทนการแก้ไฟล์ตรง → review/squash ได้\
-   **SSOT** = SpecBundle + SpecVersion → ลด spec drift\
-   เก็บผลการรัน LLM ใน **ChatRun** และโยงกับสิ่งที่สร้าง (Patch,
    CopyBlock, ฯลฯ)\
-   แยก **PreviewSession** (dev) ออกจาก **Deployment** (prod)\
-   **Policy**: บล็อก deploy ถ้า test ไม่ผ่าน

------------------------------------------------------------------------

## 7. ตัวอย่าง Loop (Thin DAG)

    spec.store_upsert → editor.modify_component → testing.run → preview.build
                            ↘ copywriter.update_copy
                            ↘ visual.generate_image

------------------------------------------------------------------------

## 8. Governance & Safety

-   Least privilege: Frontend Agent → level patch เท่านั้น\
-   Quality gates: lint, tsc, unit, e2e, a11y\
-   Risk rules: ถ้าแก้ \>10 ไฟล์, \>200 lines, หรือ critical paths →
    ต้อง confirm

------------------------------------------------------------------------

## 9. Roadmap การย้าย

-   เปิดใช้ชั้นใหม่: Command + Orchestrator + Patch + Test + Spec\
-   Adapter จาก GenerationFile → Patch\
-   แยก content (CopyBlock) และภาพ (ImageBrief/ImageAsset)

------------------------------------------------------------------------

## 10. Deployment & Preview (Daytona)

-   PreviewSession run บน Daytona → auto close เมื่อ inactive\
-   Manual preview ได้\
-   Public preview ควบคุมการเข้าถึง\
-   Deploy ผ่าน Vercel / GitHub Pages / Netlify
