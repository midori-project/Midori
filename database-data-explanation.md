# 💾 ข้อมูลที่บันทึกลง Database - Deployment System

## 🗄️ Database Schema Overview

### **Deployment Model** (หลัก)
```sql
model Deployment {
  id        String         @id @default(uuid())     -- UUID ของ deployment
  projectId String                                 -- เชื่อมโยงกับ Project
  provider  DeployProvider                        -- 'vercel' | 'github_pages' | 'netlify'
  state     DeployState    @default(queued)        -- 'queued' | 'building' | 'ready' | 'failed'
  url       String?                               -- URL ของเว็บไซต์ที่ deploy แล้ว
  meta      Json?                                 -- ข้อมูลเพิ่มเติม (JSON)
  createdAt DateTime       @default(now())        -- เวลาที่สร้าง
  project   Project        @relation(...)         -- Foreign key ไปยัง Project
}
```

## 📊 ข้อมูลที่บันทึกในแต่ละขั้นตอน

### **1. Initial Deployment Record** (ตอนสร้าง deployment)
```json
{
  "id": "deploy-uuid-123",
  "projectId": "project-uuid-456", 
  "provider": "vercel",
  "state": "queued",
  "url": null,
  "meta": {
    "files": [
      {
        "path": "pages/index.js",
        "content": "export default function Home() { return <div>Hello World</div> }",
        "type": "code"
      },
      {
        "path": "package.json", 
        "content": "{\"name\": \"my-app\", \"scripts\": {\"build\": \"next build\"}}",
        "type": "text"
      }
    ],
    "buildCommand": "npm run build",
    "outputDirectory": ".next",
    "environmentVariables": {
      "NODE_ENV": "production"
    }
  },
  "createdAt": "2024-01-15T10:30:00Z"
}
```

### **2. After Vercel Deployment** (หลัง deploy สำเร็จ)
```json
{
  "id": "deploy-uuid-123",
  "projectId": "project-uuid-456",
  "provider": "vercel", 
  "state": "ready",
  "url": "https://my-awesome-site-123.vercel.app",
  "meta": {
    "files": [...],  // ข้อมูลเดิม
    "buildCommand": "npm run build",
    "outputDirectory": ".next", 
    "environmentVariables": {...},
    
    // ข้อมูลจาก Vercel API
    "vercelDeploymentId": "dpl_abc123def456",
    "vercelUrl": "https://my-awesome-site-123.vercel.app",
    "vercelState": "READY",
    "vercelCreatedAt": 1705312200000,
    "vercelBuildingAt": 1705312210000,
    "vercelReadyAt": 1705312250000
  },
  "createdAt": "2024-01-15T10:30:00Z"
}
```

## 🔍 รายละเอียดข้อมูลใน `meta` field

### **Files Information**
```json
"files": [
  {
    "path": "pages/index.js",
    "content": "export default function Home() { ... }",
    "type": "code"
  },
  {
    "path": "styles/globals.css", 
    "content": "body { margin: 0; }",
    "type": "text"
  },
  {
    "path": "public/logo.png",
    "content": "base64-encoded-image-data",
    "type": "asset"
  }
]
```

### **Build Configuration**
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "environmentVariables": {
    "NODE_ENV": "production",
    "NEXT_PUBLIC_API_URL": "https://api.example.com"
  }
}
```

### **Vercel API Response**
```json
{
  "vercelDeploymentId": "dpl_abc123def456",
  "vercelUrl": "https://my-awesome-site-123.vercel.app", 
  "vercelState": "READY",
  "vercelCreatedAt": 1705312200000,
  "vercelBuildingAt": 1705312210000,
  "vercelReadyAt": 1705312250000,
  "vercelTeamId": "team_xyz789",
  "vercelProjectId": "prj_abc123"
}
```

## 📈 State Transitions

### **Deployment States**
```
queued → building → ready
   ↓
failed
```

### **Database Updates ตาม State**
```typescript
// 1. Initial state
await prisma.deployment.create({
  data: {
    state: 'queued',
    meta: { files, buildCommand, ... }
  }
});

// 2. After Vercel API call
await prisma.deployment.update({
  where: { id: deploymentId },
  data: {
    state: 'building',
    meta: { ...existingMeta, vercelDeploymentId: 'dpl_xxx' }
  }
});

// 3. Final state
await prisma.deployment.update({
  where: { id: deploymentId },
  data: {
    state: 'ready',
    url: 'https://site.vercel.app',
    meta: { ...existingMeta, vercelUrl: 'https://site.vercel.app' }
  }
});
```

## 🔗 Related Models

### **Project Model** (เชื่อมโยง)
```sql
model Project {
  id          String        @id @default(uuid())
  name        String        -- "ร้านอาหาร ABC"
  description String?       -- "เว็บไซต์ร้านอาหาร"
  deployments Deployment[]  -- 1-to-many relationship
  files       File[]        -- ไฟล์ในโปรเจค
  owner       User          -- เจ้าของโปรเจค
}
```

### **File Model** (ไฟล์ในโปรเจค)
```sql
model File {
  id        String   @id @default(uuid())
  projectId String
  path      String   -- "pages/index.js"
  type      FileType -- 'code' | 'text' | 'asset'
  content   String?  -- เนื้อหาไฟล์
  blob      Bytes?   -- ไฟล์ binary
}
```

## 🎯 ข้อมูลที่สำคัญสำหรับ User

### **Deployment Summary**
```json
{
  "deploymentId": "deploy-uuid-123",
  "projectName": "ร้านอาหาร ABC", 
  "url": "https://restaurant-abc-123.vercel.app",
  "status": "ready",
  "deployedAt": "2024-01-15T10:35:00Z",
  "buildTime": "45 seconds",
  "fileCount": 12
}
```

### **Error Information** (กรณีล้มเหลว)
```json
{
  "state": "failed",
  "error": "Build failed: Module not found",
  "meta": {
    "vercelError": "BuildError: Cannot resolve module 'react'",
    "buildLogs": "npm ERR! missing dependency...",
    "retryCount": 1
  }
}
```

## 📊 Database Queries ที่ใช้บ่อย

### **Get Latest Deployment**
```sql
SELECT * FROM "Deployment" 
WHERE "projectId" = 'project-uuid' 
ORDER BY "createdAt" DESC 
LIMIT 1;
```

### **Get All Deployments for Project**
```sql
SELECT d.*, p.name as project_name 
FROM "Deployment" d
JOIN "Project" p ON d."projectId" = p.id
WHERE d."projectId" = 'project-uuid'
ORDER BY d."createdAt" DESC;
```

### **Get Deployment Status**
```sql
SELECT id, state, url, "createdAt"
FROM "Deployment" 
WHERE id = 'deployment-uuid';
```

## 🔄 Data Flow Summary

1. **Create** → บันทึก deployment record พร้อม files
2. **Update** → อัปเดต state และ Vercel response  
3. **Query** → ดึงข้อมูล deployment status
4. **Archive** → เก็บ deployment history

ข้อมูลทั้งหมดนี้ช่วยให้ Midori สามารถ:
- ✅ Track deployment status
- ✅ Store deployment history  
- ✅ Monitor build performance
- ✅ Handle error recovery
- ✅ Provide user feedback
