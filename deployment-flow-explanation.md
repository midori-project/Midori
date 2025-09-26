# 🚀 Midori Deployment Flow - Detailed Explanation

## Overview
ระบบ deployment ของ Midori ทำงานผ่าน multi-agent architecture ที่เชื่อมต่อกับ Vercel API เพื่อ deploy เว็บไซต์ที่ AI generate แล้วอัตโนมัติ

## 🔄 Complete Flow Diagram

```
User Request → Orchestrator AI → DevOps Agent → Deployment API → Vercel → Database → User Response
```

## 📋 Detailed Step-by-Step Flow

### 1. **User Request** 🎯
```
User: "สร้างเว็บไซต์ร้านอาหารและ deploy ให้หน่อย"
```

### 2. **Orchestrator AI Processing** 🧠
```typescript
// orchestratorAI.ts
const analysis = await this.analyzeIntent(message);
// Intent: { type: 'task', complexity: 'high', requiredAgents: ['frontend', 'devops'] }

const command = await this.createCommand(message, analysis);
// Command: { 
//   commandType: 'CREATE_WEBSITE_AND_DEPLOY',
//   payload: { projectContext, requirements }
// }
```

### 3. **Task Planning & Execution** 📝
```typescript
// orchestratorAI.ts → runners/run.ts
const plan = await processWithAI(command);
// Plan: {
//   tasks: [
//     { agent: 'frontend', action: 'select_template', ... },
//     { agent: 'frontend', action: 'customize_template', ... },
//     { agent: 'devops', action: 'deploy_website', ... }
//   ]
// }

const results = await executeTasks(plan);
```

### 4. **Frontend Agent Execution** 🎨
```typescript
// agent_dispatcher.ts
if (this.agentName === 'frontend') {
  const frontendTask = this.transformToFrontendTask(task);
  result = await frontendAgent(frontendTask);
  // Result: { success: true, files: [...], components: [...] }
}
```

### 5. **DevOps Agent - Deployment Task Creation** 🚀
```typescript
// deployment_dispatcher.ts
const deploymentTask = createDeploymentTask(
  projectId,
  generatedFiles,  // จาก Frontend Agent
  {
    subdomain: 'restaurant-site-123',
    buildCommand: 'npm run build',
    outputDirectory: '.next'
  }
);
```

### 6. **Deployment API Call** 📡
```typescript
// deployment_dispatcher.ts
const response = await axios.post('/api/deploy-website', {
  projectId: 'uuid',
  files: [
    { path: 'pages/index.js', content: '...', type: 'code' },
    { path: 'package.json', content: '...', type: 'text' }
  ],
  subdomain: 'restaurant-site-123'
});
```

### 7. **API Route Processing** 🔧
```typescript
// route.ts
export async function POST(request: NextRequest) {
  // 1. Validate with Zod
  const validatedData = DeployWebsiteRequestSchema.parse(body);
  
  // 2. Create deployment record
  const deployment = await prisma.deployment.create({
    data: {
      projectId: validatedData.projectId,
      provider: 'vercel',
      state: 'queued'
    }
  });
  
  // 3. Deploy to Vercel
  const vercelResponse = await deployToVercel(validatedData, deployment.id);
  
  // 4. Update database
  await prisma.deployment.update({
    where: { id: deployment.id },
    data: { url: vercelResponse.url, state: 'ready' }
  });
}
```

### 8. **Vercel API Integration** 🌐
```typescript
// route.ts → deployToVercel()
const vercelResponse = await axios.post(
  'https://api.vercel.com/v13/deployments',
  {
    name: 'restaurant-site-123',
    files: {
      'pages/index.js': 'export default function Home() { ... }',
      'package.json': '{ "name": "restaurant-app" }'
    },
    projectSettings: {
      buildCommand: 'npm run build',
      outputDirectory: '.next',
      framework: 'nextjs'
    }
  },
  {
    headers: { 'Authorization': `Bearer ${VERCEL_TOKEN}` }
  }
);
```

### 9. **Database Updates** 💾
```sql
-- Prisma automatically handles:
INSERT INTO "Deployment" (
  id, projectId, provider, state, url, meta, createdAt
) VALUES (
  'deploy-uuid', 'project-uuid', 'vercel', 'ready', 
  'https://restaurant-site-123.vercel.app',
  '{"vercelDeploymentId": "dpl_xxx", "files": [...]}',
  NOW()
);
```

### 10. **Response Chain** 📤
```typescript
// API Response
{
  success: true,
  data: {
    deploymentId: 'deploy-uuid',
    url: 'https://restaurant-site-123.vercel.app',
    state: 'ready'
  }
}

// → deployment_dispatcher.ts
return {
  success: true,
  result: {
    deploymentId: 'deploy-uuid',
    url: 'https://restaurant-site-123.vercel.app',
    state: 'ready'
  }
};

// → orchestratorAI.ts
const chatResponse = await this.generateTaskSummary(message.content, taskResult);
// "🚀 เว็บไซต์ร้านอาหาร deploy สำเร็จ! URL: https://restaurant-site-123.vercel.app"
```

## 🔧 Key Components Interaction

### **Orchestrator AI** 🧠
- วิเคราะห์ user intent
- สร้าง execution plan
- จัดการ task dependencies
- Generate user-friendly responses

### **Agent Dispatcher** 📡
- รับ tasks จาก orchestrator
- เรียกใช้ agents ตาม type
- Handle parallel/sequential execution
- Return results กลับ orchestrator

### **Deployment Dispatcher** 🚀
- รับ deployment tasks
- เรียกใช้ deployment API
- Monitor deployment status
- Generate deployment summaries

### **Deployment API** 🔧
- Validate requests ด้วย Zod
- เชื่อมต่อ Vercel API
- บันทึกข้อมูลลง database
- Handle errors gracefully

### **Database (Prisma)** 💾
- Track deployment status
- Store Vercel metadata
- Link deployments to projects
- Support multiple providers

## 🎯 Error Handling Flow

```
Error Occurs → Log Error → Update Database State → Return Error Response → User Notification
```

### **Common Error Scenarios:**
1. **Vercel API Error** → Update state to 'failed' → Return error message
2. **File Validation Error** → Return 400 with validation details
3. **Database Error** → Rollback transaction → Return 500
4. **Network Timeout** → Retry mechanism → Fallback response

## 🔄 Status Monitoring

```typescript
// Real-time status checking
const status = await checkDeploymentStatus(deploymentId);
// Status: { state: 'building', progress: 50, url: '...' }
```

## 📊 Performance Metrics

- **Deployment Time**: ~30-60 seconds
- **File Processing**: ~1-5 seconds
- **Vercel Build**: ~20-40 seconds
- **Database Operations**: ~100-500ms

## 🎉 Final Result

User ได้รับ:
- ✅ **Live Website URL**: `https://restaurant-site-123.vercel.app`
- ✅ **Deployment Status**: Ready
- ✅ **Project Files**: All files deployed
- ✅ **Custom Domain**: Auto-assigned subdomain
- ✅ **Build Logs**: Available in Vercel dashboard

## 🔧 Environment Requirements

```bash
# Required
VERCEL_TOKEN=vercel_xxx
DATABASE_URL=postgresql://...

# Optional
VERCEL_TEAM_ID=team_xxx
```

ระบบนี้ทำให้ Midori สามารถ deploy เว็บไซต์ที่ AI generate แล้วได้อัตโนมัติ โดยผู้ใช้ไม่ต้องทำอะไรเลย! 🚀
