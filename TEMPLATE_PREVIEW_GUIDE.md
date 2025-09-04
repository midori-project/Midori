### คู่มือ Template และระบบพรีวิว (Sandpack / StackBlitz / Static / Vite Dev)

เอกสารฉบับนี้สรุปแนวคิด โครงสร้างข้อมูล โฟลว์การประกอบเทมเพลต และการพรีวิวหลายรูปแบบ โดยยึดแนวทาง Hybrid: Block‑first + Theme Tokens เพื่อให้ได้ผลลัพธ์ที่สวย เสถียร และพร้อมรันทันที

---

## เป้าหมาย
- สร้าง “หน้าเริ่มต้น” จาก requirement สั้นๆ (Quick Mode: industry, goal, style, one‑liner) แล้วให้ผู้ใช้ปรับต่อได้
- เก็บเทมเพลตใน DB เป็นโค้ด TSX ฝังโทเคน (token) + มี default props เพื่อประกอบเร็ว
- แยก “โครง” ออกจาก “สไตล์” ด้วย Theme Tokens → แทนเป็นคลาส Tailwind ก่อนพรีวิว
- รองรับพรีวิวหลายแบบ โดยใช้ template เดียว แต่แปลงด้วย Adapter ตามข้อกำหนดแพลตฟอร์ม

---

## แนวทางสถาปัตยกรรม: Hybrid Block‑first + Theme Tokens
- เก็บ template เป็นระดับ Page/Block (เช่น `Home`, `HeroSection`, `MenuHighlights`, `Reservation`)
- ใช้โทเคนสไตล์ใน className (เช่น `{{BTN_PRIMARY}}`, `{{BG_PRIMARY}}`, `{{TEXT_MUTED}}`)
- เก็บ ThemeVariant เป็น mapping โทเคน → คลาส Tailwind
- ประกอบ (compose) ก่อนพรีวิว: ดึง template + theme + overrides → แทนค่า → จัดการคลาส → ตรวจ → ส่งเข้า preview adapter

---

## โครงสร้างข้อมูล (สรุปสคีมา)

- Template (แกนหลัก)
  - key, type(page|block|config|style), path, industry?, variant?
  - compat (router, tailwind), status (draft/approved/deprecated), version, isSandpackSafe, contentHash
  - content (โค้ด TSX มี {{TOKENS}}), defaultProps (JSON)
  - tokens[] (โทเคนที่ใช้), imports[] (import ที่จำเป็น), dependencies[] (key อ้างถึง template อื่น)

- ThemeVariant
  - name, description?, tokens: Record<Token, string> (ค่าคลาส Tailwind จริง)

ตัวอย่างโทเคนแนะนำ
- สี/พื้นผิว: BG_PRIMARY, SURFACE, SURFACE_ALT
- ข้อความ: TEXT_PRIMARY, TEXT_MUTED, HEADING, HIGHLIGHT_TEXT
- ปุ่ม/ลิงก์: BTN_PRIMARY, BTN_SECONDARY, LINK, RING_FOCUS
- การ์ด: CARD_BG, CARD_BORDER, CARD_TEXT

---

## ERD (Mermaid)

```mermaid
erDiagram
  TEMPLATE ||--o{ TEMPLATE_TOKEN : has
  TEMPLATE ||--o{ TEMPLATE_IMPORT : has
  TEMPLATE ||--o{ TEMPLATE_DEPENDENCY : has
  THEME_VARIANT ||--o{ THEME_TOKEN_VALUE : defines

  TEMPLATE {
    string id PK
    string key UNIQUE
    string type
    string path
    string industry
    string variant
    string compatRouter
    string compatTailwind
    string status
    int    version
    boolean isSandpackSafe
    string content
    string contentHash UNIQUE
    json   defaultProps
    datetime createdAt
    datetime updatedAt
  }

  TEMPLATE_TOKEN {
    string id PK
    string token
    string templateId FK
  }

  TEMPLATE_IMPORT {
    string id PK
    string module
    string named
    boolean isDefault
    string templateId FK
  }

  TEMPLATE_DEPENDENCY {
    string id PK
    string dependsOnKey
    string templateId FK
  }

  THEME_VARIANT {
    string id PK
    string name UNIQUE
    string description
    datetime createdAt
    datetime updatedAt
  }

  THEME_TOKEN_VALUE {
    string id PK
    string token
    string value
    string themeId FK
  }
```

---

## การเก็บ Template ตัวอย่าง: Hero (มี highlight + ปุ่มเดียว)

ตัวอย่างระเบียน Template (content เป็น TSX มีโทเคน)

```json
{
  "key": "hero.v1",
  "type": "block",
  "path": "src/components/HeroSection.tsx",
  "industry": "restaurant",
  "variant": "with-image",
  "compatRouter": "6.x",
  "compatTailwind": "3.3",
  "status": "approved",
  "version": 1,
  "isSandpackSafe": true,
  "contentHash": "sha256:...",
  "content": "import React from 'react';\nimport { Link } from 'react-router-dom';\n\nconst HeroSection: React.FC = () => {\n  return (\n    <div className=\"min-h-[70vh] flex items-center {{BG_PRIMARY}}\">\n      <div className=\"max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-16\">\n        <h1 className=\"{{HEADING}}\">\n          {{TITLE}} <span className=\"{{HIGHLIGHT_TEXT}}\">{{HIGHLIGHT}}</span>\n        </h1>\n        <p className=\"mt-3 text-lg {{TEXT_MUTED}}\">{{SUBTITLE}}</p>\n        <div className=\"mt-6\">\n          <Link to=\"{{CTA_TO}}\" className=\"{{BTN_PRIMARY}} px-6 py-3 rounded-lg font-medium {{RING_FOCUS}}\">\n            {{CTA_LABEL}}\n          </Link>\n        </div>\n      </div>\n    </div>\n  );\n};\n\nexport default HeroSection;\n",
  "defaultProps": {
    "TITLE": "สัมผัสรสชาติความอบอุ่นจากครัวของเรา",
    "HIGHLIGHT": "จองโต๊ะวันนี้",
    "SUBTITLE": "วัตถุดิบสดใหม่ เมนูตามฤดูกาล",
    "CTA_LABEL": "จองโต๊ะ",
    "CTA_TO": "/reservation"
  }
}
```

ตัวอย่าง ThemeVariant (โทเคน → คลาส Tailwind)

```json
{
  "name": "modern-warm",
  "tokens": {
    "BG_PRIMARY": "bg-gradient-to-br from-amber-50 via-white to-orange-50",
    "HEADING": "text-4xl sm:text-5xl font-extrabold text-gray-900",
    "HIGHLIGHT_TEXT": "text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600",
    "TEXT_MUTED": "text-gray-600",
    "BTN_PRIMARY": "bg-amber-600 hover:bg-amber-700 text-white",
    "RING_FOCUS": "focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
  }
}
```

---

## เทมเพลตระดับ Element และการแก้ไขข้อความ

แนวคิด: เก็บ element เป็น TSX ที่ฝังโทเคนข้อความ/สไตล์ เพื่อให้ผู้ใช้ปรับได้ผ่าน defaultProps/overrides โดยไม่ต้องแก้โค้ดด้วยมือ

ตัวอย่างการเก็บ (Heading Element)

```json
{
  "key": "element.heading.v1",
  "type": "block",
  "path": "src/components/elements/Heading.tsx",
  "status": "approved",
  "content": "import React from 'react';\n\nconst Heading: React.FC = () => {\n  return (\n    <h1 className=\"font-extrabold text-4xl sm:text-5xl text-gray-900 {{ALIGN}}\">\n      {{TEXT}} {{#if HIGHLIGHT}}<span class=\"text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600\">{{HIGHLIGHT}}</span>{{/if}}\n    </h1>\n  );\n};\n\nexport default Heading;\n",
  "defaultProps": {
    "TEXT": "พาดหัวหลักของคุณ",
    "HIGHLIGHT": "ข้อความเน้น",
    "ALIGN": "text-left"
  },
  "tokens": ["ALIGN"],
  "imports": [{"module":"react","isDefault":true}]
}
```

ตัวอย่าง element เพิ่มเติม (Button Element)

```json
{
  "key": "element.button.v1",
  "type": "block",
  "path": "src/components/elements/Button.tsx",
  "status": "approved",
  "content": "import React from 'react';\n\nconst Button: React.FC = () => {\n  return (\n    <a href=\"{{HREF}}\" className=\"{{BTN_PRIMARY}} px-6 py-3 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2\">\n      {{LABEL}}\n    </a>\n  );\n};\n\nexport default Button;\n",
  "defaultProps": {
    "LABEL": "คลิกที่นี่",
    "HREF": "/"
  },
  "tokens": ["BTN_PRIMARY"],
  "imports": [{"module":"react","isDefault":true}]
}
```

การคอมไพล์และ override ข้อความ

```ts
import { compileTemplate } from './compileTemplate';

// คอมไพล์ Heading พร้อมข้อความใหม่และจัดแนวกลาง
const heading = await compileTemplate('element.heading.v1', 'modern-warm', {
  TEXT: 'ยินดีต้อนรับสู่ร้านของเรา',
  HIGHLIGHT: 'จองโต๊ะวันนี้',
  ALIGN: 'text-center'
});

// คอมไพล์ Button พร้อมปรับป้ายและลิงก์
const cta = await compileTemplate('element.button.v1', 'modern-warm', {
  LABEL: 'ดูเมนู',
  HREF: '/menu'
});
```

การนำไปใช้ในหน้า

```tsx
// สร้างไฟล์บน virtual FS ตาม path ที่กำหนดใน template (เช่น /src/components/elements/Heading.tsx)
// แล้ว import มาใช้ตามปกติ
import React from 'react';
import Heading from '../components/elements/Heading.tsx';
import Button from '../components/elements/Button.tsx';

const Home: React.FC = () => (
  <div className="min-h-screen bg-gray-50 px-6 py-12">
    <Heading />
    <div className="mt-6">
      <Button />
    </div>
  </div>
);

export default Home;
```

หมายเหตุพรีวิว:
- Sandpack: ส่งโค้ดหลังคอมไพล์ (ไม่เหลือโทเคน) และคุมจำนวนไฟล์รวม 18–20
- StackBlitz/Static/Vite: ใช้ได้เหมือนจริง เพิ่มไฟล์ config ตามปกติ

---

## โฟลว์ AI‑generate‑new (ย่อ)
1) รับอินพุต Quick Mode → industry, goal, style preset, one‑liner (+ เสริม: CTA, สี/โลโก้)
2) วิเคราะห์เจตนา/บริบท → สร้าง blueprint เพจ/บล็อก (Home + sections)
3) เลือก template ตาม blueprint + เลือกไฟล์ตามเพดานของพรีวิว (เช่น Sandpack 18–20)
4) สร้าง prompt รายไฟล์ (ระบุข้อกำหนด React/Router/Tailwind เข้มงวด)
5) เรียก AI แบบ batch (พร้อม timeout/retry) → ได้โค้ดดิบ
6) ทำความสะอาด/แทนโทเคน/ปรับ AST (ts‑morph) → ใส่ import .tsx, `<Route>`, `Link`
7) จัดฟอร์แมต (Prettier) + รวม/ล้างคลาส (tailwind‑merge/clsx)
8) ตรวจ (React import, export default, JSX เดียว, Link, root=`Home`, JSON/config parse)
9) ไม่ผ่านไฟล์ใด → fallback template ของไฟล์นั้น
10) ส่งเข้า preview adapter (Sandpack/StackBlitz/Static/Vite dev)

---

## ตัวแปลงพรีวิว (Preview Adapters)

### Sandpack Adapter
- ข้อกำหนดสำคัญ:
  - จำกัดจำนวนไฟล์: 18–20 ไฟล์
  - ทุก import ใส่ส่วนขยาย `.tsx/.ts`
  - ใช้ `Link` แทน `<a>`, และตั้ง root route เป็น `Home`
  - ทุก element ต้องมีคลาส Tailwind (ไม่ใช้ `@tailwind`)
- ผลกระทบต่อ template: ใช้ template เดิมได้ แต่ตอนประกอบต้องแทนโทเคนเป็นคลาสจริงและคุมจำนวนไฟล์

### StackBlitz Adapter
- ใช้ WebContainers: รัน Vite + Tailwind CLI/PostCSS ได้จริง, HMR ได้
- tsconfig แนะนำ: `allowImportingTsExtensions: true` (ถ้าต้องการคง `.tsx` ใน import)
- ผลกระทบต่อ template: ใช้ template เดิมได้ เพิ่มไฟล์ config (`postcss.config.cjs`, `tailwind.config.cjs`) และ `@tailwind` ใน `index.css`

### Static build + iframe
- build โปรเจกต์แล้วเสิร์ฟ static ภายใต้โดเมนเดียวกัน → iframe same‑origin
- เสถียร สเกลง่าย แต่ไม่มี HMR (ต้อง build ใหม่เมื่อเปลี่ยน)
- ผลกระทบต่อ template: ใช้ template เดิม + pipeline ปกติของโปรดักชัน

### Vite dev + proxy (เฉพาะจำเป็น)
- มี HMR จริง แต่ต้องดูแลพอร์ต/โปรเซส/timeout/kill, proxy WS, ตั้ง CSP/X‑Frame
- เหมาะกับการดีบักภายใน ไม่แนะนำเป็นค่าเริ่มต้น

---

## เทียบข้อดี–ข้อเสีย (พรีวิว)

| วิธี | ข้อดี | ข้อเสีย | เหมาะกับ |
| - | - | - | - |
| Sandpack | เบา เร็ว ฝังง่าย | ไม่มี build tool, จำกัด 18–20 ไฟล์, ต้อง .tsx ใน import, ต้อง inline classes | เดโมเร็ว/โค้ดเบา |
| StackBlitz | Dev จริง (Vite/Tailwind CLI/HMR), ไม่ต้องดูแลเซิร์ฟเวอร์ | โควต้า/ทรัพยากรจำกัดกว่าเครื่องจริง | พรีวิว dev ที่ยืดหยุ่น |
| Static + iframe | เสถียร สเกลง่าย คุม CSP ง่าย | ไม่มี HMR ต้อง build ใหม่ | แชร์พรีวิว/เวอร์ชันนิ่ง |
| Vite dev + proxy | HMR เต็ม | สเกลยาก บริหารทรัพยากร/ความปลอดภัยยาก | ดีบักภายในทีม |

หมายเหตุ: โครง “template แกน” เหมือนกันทุกวิธี ต่างกันที่ adapter ขั้นตอนประกอบ/เลือกไฟล์ และโหมด CSS

---

## ตัวอย่างการคอมไพล์ Template → โค้ดพร้อมพรีวิว

ฟังก์ชัน compile (Handlebars) แบบย่อ

```ts
import Handlebars from 'handlebars';

type CompileArgs = {
  templateContent: string;              // โค้ด TSX ที่มี {{TOKENS}}
  themeTokens: Record<string, string>;  // map โทเคน → คลาสจริง
  overrides?: Record<string, string>;   // ข้อความ/ลิงก์ที่อยากแทนค่า
};

export function compileTemplate({ templateContent, themeTokens, overrides = {} }: CompileArgs) {
  const context = { ...themeTokens, ...overrides };
  return Handlebars.compile(templateContent, { noEscape: true })(context);
}
```

ตัวอย่างเปิดพรีวิวบน StackBlitz (ย่อ)

```ts
import sdk from '@stackblitz/sdk';

export async function openOnStackBlitz(files: Record<string, string>) {
  await sdk.openProject(
    {
      title: 'Preview',
      template: 'node',
      files,
    },
    { newWindow: true }
  );
}
```

---

## การเก็บ Requirement แบบ UX เบา (Quick Mode)
- เก็บเพียง 4 ช่อง: industry, goal, style preset, one‑liner/tagline
- ระบบเดา/เติมให้: โครงหน้า (Hero → Highlights → CTA/Reservation → Location/Hours), CTA เส้นทาง, theme mapping, เมนูนำทาง
- เพิ่มตัวเลือกเสริม (ไม่บังคับ): โลโก้/สีหลัก, CTA ปลายทาง, เลือกบล็อก 2–3 อัน

---

## เช็คลิสต์คุณภาพก่อนพรีวิว
- React import ครบ, export default ครบ, JSX มี root เดียว
- การนำทางใช้ `Link` (ห้าม `<a>` ภายในแอป)
- `App.tsx` root route = `Home`
- Sandpack: import ใส่ `.tsx/.ts`, ทุก element มีคลาส Tailwind, จำนวนไฟล์ 18–20
- StackBlitz/Static/Vite: ตั้งค่า Tailwind/PostCSS/tsconfig ให้สอดคล้อง
- ผ่าน Validator (JSON/config parse ได้, ไม่มี import ซ้ำ, path ถูกต้อง)

---

## ข้อแนะนำการเลือกพรีวิว
- ค่าพื้นฐาน: Static build + iframe (เสถียร/สเกลง่าย)
- ต้อง HMR dev จริง: StackBlitz (เบากว่าเปิด dev server เอง)
- เดโมโค้ดเบา/โหลดไวมาก: Sandpack (ใช้ adapter บังคับกฎเข้ม)
- เลี่ยง: เปิด Vite dev หลายอินสแตนซ์ให้ผู้ใช้ทั่วไป (ซับซ้อนและเปลืองทรัพยากร)

---

## สรุป
- ใช้ “template เดียว” (block‑first + tokens) แล้วมี preview adapter แปลงตามแพลตฟอร์ม
- ต่างกันเฉพาะขั้นตอนประกอบ/เลือกไฟล์และโหมด CSS (inline vs @tailwind)
- Sandpack: คุม 18–20 ไฟล์และกฎเข้ม, StackBlitz: dev จริง, Static: เสถียรที่สุด, Vite dev: สำหรับดีบักภายใน


