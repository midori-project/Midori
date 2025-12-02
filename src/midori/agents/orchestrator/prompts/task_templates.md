# Orchestrator Task Templates

## 🎯 **Common Task Patterns**

เหล่านี้คือ templates สำหรับ tasks ที่พบบ่อยใน Midori development:

### 🎨 **Frontend Development Patterns**

#### **1. Create New Component**
```json
{
  "taskId": "fe-component-{name}",
  "agent": "frontend",
  "action": "create_component",
  "description": "Create {componentName} component",
  "dependencies": [],
  "estimatedDuration": 30,
  "priority": "medium",
  "payload": {
    "componentName": "{componentName}",
    "type": "functional|class",
    "props": ["{propName}: {propType}"],
    "features": ["typescript", "accessibility", "responsive"],
    "styling": "tailwind",
    "tests": true
  }
}
```

#### **2. Update Existing Component**
```json
{
  "taskId": "fe-update-{component}",
  "agent": "frontend", 
  "action": "update_component",
  "description": "Update {componentName} component",
  "dependencies": [],
  "estimatedDuration": 20,
  "priority": "low",
  "payload": {
    "filePath": "src/components/{ComponentName}.tsx",
    "changes": [
      {"type": "add_prop", "name": "{propName}", "type": "{propType}"},
      {"type": "update_styling", "selector": ".{className}", "changes": "{cssChanges}"}
    ]
  }
}
```

### ⚙️ **Backend Development Patterns**

#### **3. Create API Endpoint**
```json
{
  "taskId": "be-api-{endpoint}",
  "agent": "backend",
  "action": "create_api_endpoint",
  "description": "Create {method} {endpoint} API",
  "dependencies": ["{db-schema-dependency}"],
  "estimatedDuration": 40,
  "priority": "high",
  "payload": {
    "endpoint": "{endpoint-path}",
    "method": "GET|POST|PUT|DELETE",
    "schema": {
      "request": "{RequestSchema}",
      "response": "{ResponseSchema}"
    },
    "authentication": "required|optional|none",
    "validation": "zod",
    "businessLogic": "{serviceFunction}"
  }
}
```

### 🚀 **DevOps Patterns**

#### **4. Deploy Application**
```json
{
  "taskId": "do-deploy-{env}",
  "agent": "devops", 
  "action": "deploy_application",
  "description": "Deploy application to {environment}",
  "dependencies": ["{build-dependency}"],
  "estimatedDuration": 30,
  "priority": "high",
  "payload": {
    "environment": "staging|production",
    "platform": "vercel|aws|gcp",
    "healthChecks": true,
    "rollback": true,
    "monitoring": true
  }
}
```

## 🔄 **Multi-Agent Workflow Patterns**

### **5. Complete Feature Development**
```json
{
  "planId": "feature-{name}",
  "description": "Develop complete {featureName} feature",
  "tasks": [
    {
      "taskId": "be-{feature}-api",
      "agent": "backend",
      "action": "create_api_endpoints",
      "dependencies": []
    },
    {
      "taskId": "fe-{feature}-ui", 
      "agent": "frontend",
      "action": "create_feature_ui",
      "dependencies": ["be-{feature}-api"]
    },
    {
      "taskId": "do-{feature}-deploy",
      "agent": "devops",
      "action": "deploy_feature",
      "dependencies": ["fe-{feature}-ui"]
    }
  ],
  "executionGraph": {
    "sequential": ["be-{feature}-api", "fe-{feature}-ui", "do-{feature}-deploy"]
  }
}
```

## 🎯 **Template Usage Guidelines**

### **เมื่อไหร่ใช้ Template:**
1. **Command ตรงกับ pattern** - ใช้ template ที่เหมาะสม
2. **Customize parameters** - แทนที่ `{variables}` ด้วยค่าจริง
3. **Adjust dependencies** - ปรับ dependencies ตามบริบท
4. **Estimate duration** - ปรับเวลาตามความซับซ้อน

### **Best Practices:**
- ✅ ใช้ descriptive task IDs
- ✅ กำหนด dependencies ที่ชัดเจน  
- ✅ ประเมินเวลาที่สมจริง
- ✅ ระบุ priority ตามความสำคัญ
- ✅ ใส่ rollback plan สำหรับ destructive operations
