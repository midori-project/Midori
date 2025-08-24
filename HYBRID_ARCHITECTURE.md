# 🏗️ Midori Hybrid Architecture Guide

## Overview

Midori ใช้ **Hybrid Architecture** ที่แยก flow การทำงานตามการใช้งาน เพื่อให้ได้ทั้งประสิทธิภาพสูงสุดสำหรับ internal usage และความยืดหยุ่นสำหรับ external integration

## 🎯 Architecture Flows

### 🏠 Internal Usage Flow (เว็บเรา)
```
Server Component → Action → Business Service → Database
```

**ใช้สำหรับ:**
- Login/Register ภายในเว็บไซต์
- การดำเนินการภายใน Next.js app
- ฟีเจอร์ที่ไม่ต้องการ external access

**ข้อดี:**
- ⚡ ประสิทธิภาพสูงสุด (ไม่มี HTTP overhead)
- 🔒 Type safety เต็มรูปแบบ
- 🛠️ Easy debugging และ maintenance

### 🌐 External Usage Flow (Mobile Apps + External APIs)
```
Server Component → Action → HTTP Service → API Route → Business Service → Database
```

**ใช้สำหรับ:**
- Mobile apps เรียก API ของเรา
- External services integration
- Third-party webhooks
- OAuth และ authentication providers

**ข้อดี:**
- 🔗 API reusability สำหรับ external clients
- 📱 รองรับ mobile applications
- 🌍 Third-party integration
- 🔄 Microservice ready

## 📂 File Structure

```
src/
├── libs/
│   └── auth/
│       ├── authBusinessService.ts    # Pure business logic
│       ├── authHttpService.ts        # HTTP client for external APIs
│       └── session.ts                # Session management
├── app/
│   ├── login/
│   │   └── action.ts                 # Server Action (Internal flow)
│   ├── examples/
│   │   └── externalActions.ts        # External API examples
│   └── api/
│       └── auth/
│           └── login/
│               └── route.ts          # API Route (External flow)
└── schemas/
    └── auth/
        └── login.ts                  # Shared validation schemas
```

## 🎯 Usage Guidelines

### เมื่อไหร่ใช้ Internal Flow

```typescript
// ✅ ใช้ Internal Flow เมื่อ:
// - Login/Register ภายในเว็บไซต์
// - การดำเนินการภายใน Next.js
// - ไม่ต้องการ external access

// src/app/login/action.ts
'use server';
import { authBusinessService } from '@/libs/auth/authBusinessService';

export async function loginAction(formData: FormData) {
  try {
    // เรียก Business Service โดยตรง
    await authBusinessService.login({ email, password, remember });
    redirect('/');
  } catch (error) {
    return { ok: false, error: error.message };
  }
}
```

### เมื่อไหร่ใช้ External Flow

```typescript
// ✅ ใช้ External Flow เมื่อ:
// - ต้องเรียก external APIs
// - รองรับ mobile applications
// - Third-party integrations

// src/app/examples/externalActions.ts
'use server';
import { authHttpService } from '@/libs/auth/authHttpService';

export async function oauthAction() {
  try {
    // เรียก external API ผ่าน HTTP Service
    const result = await authHttpService.callExternalAPI('https://oauth.provider.com/token');
    return result;
  } catch (error) {
    return { error: error.message };
  }
}
```

## 🔧 Service Layer Architecture

### 1. Business Service (authBusinessService.ts)
- **Pure business logic** ไม่มี HTTP calls
- เชื่อมต่อ database โดยตรงผ่าน Prisma
- ใช้สำหรับ internal calls จาก Server Actions
- มี type safety เต็มรูปแบบ

```typescript
export class AuthBusinessService {
  async login(credentials: LoginCredentials): Promise<User> {
    // Business logic + Database access โดยตรง
    const user = await prisma.user.findUnique({ ... });
    await createSession(user.id, credentials.remember);
    return user;
  }
}
```

### 2. HTTP Service (authHttpService.ts)
- **HTTP client** สำหรับเรียก APIs
- รองรับ external API calls
- ใช้ axios สำหรับ HTTP requests
- มี error handling สำหรับ network issues

```typescript
export class AuthHttpService {
  async login(loginData: LoginRequest): Promise<LoginResponse> {
    // HTTP call เฉพาะ
    const response = await axios.post('/api/auth/login', loginData);
    return response.data;
  }
  
  async callExternalAPI<T>(url: string): Promise<T> {
    // สำหรับ third-party APIs
    const response = await axios.get<T>(url);
    return response.data;
  }
}
```

### 3. API Routes (route.ts)
- **HTTP handlers** สำหรับ external clients
- จัดการ HTTP protocol เท่านั้น
- เรียก Business Service (ไม่มี business logic)
- มี proper error handling และ status codes

```typescript
export async function POST(request: NextRequest) {
  try {
    const validatedData = LoginSchema.parse(await request.json());
    
    // เรียก Business Service
    const user = await authBusinessService.login(validatedData);
    
    return NextResponse.json({ success: true, user });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
```

## 📊 Performance Comparison

| Aspect | Internal Flow | External Flow |
|--------|---------------|---------------|
| **Performance** | ⚡ Very Fast | 🐌 Slower (HTTP overhead) |
| **Type Safety** | ✅ Full TypeScript | ⚠️ Limited (JSON serialization) |
| **Error Handling** | ✅ Direct business errors | ⚠️ HTTP + business errors |
| **Memory Usage** | ✅ Low | ⚠️ Higher (HTTP buffers) |
| **Network** | ✅ No network calls | ❌ Internal HTTP calls |
| **Debugging** | ✅ Easy | ⚠️ More complex |
| **External Access** | ❌ No | ✅ Yes |
| **Mobile Support** | ❌ No | ✅ Yes |

## 🎯 Best Practices

### 1. ให้ความสำคัญกับ Internal Flow
- ใช้ Internal Flow เป็นหลักสำหรับ features ภายในเว็บ
- สร้าง API Routes เป็น "สำรอง" สำหรับ external access ในอนาคต

### 2. แยก Business Logic ออกจาก HTTP Layer
- Business logic ทั้งหมดอยู่ใน Business Service
- API Routes เป็นแค่ HTTP handlers
- ไม่ควรมี business logic ใน API Routes

### 3. ใช้ Shared Validation Schemas
- ใช้ Zod schemas ร่วมกันระหว่าง Action และ API Route
- แยก validation schemas ไว้ใน `src/schemas/`

### 4. Proper Error Handling
- Business Service: throw Error objects
- API Routes: return proper HTTP status codes
- Actions: handle และแปลง errors เป็น user-friendly messages

### 5. Type Safety ตลอด Flow
- ใช้ TypeScript interfaces ที่ชัดเจน
- Business Service มี type safety เต็มรูปแบบ
- HTTP Service ใช้ generic types สำหรับ API responses

## 🔮 Future Considerations

### Microservices Migration
- Business Services พร้อมสำหรับแยกเป็น microservices
- API Routes สามารถ proxy ไปยัง external services ได้
- HTTP Services รองรับ service discovery

### Mobile Application Support
- API Routes พร้อมสำหรับ mobile apps
- Authentication และ authorization ผ่าน API
- Consistent error responses

### Third-party Integrations
- HTTP Service รองรับ OAuth และ webhook integrations
- Business Service แยกออกจาก external dependencies
- Flexible configuration management

## 📝 Migration Guide

ถ้าต้องการปรับ code เดิมให้ใช้ hybrid architecture:

1. **แยก Business Logic**
   ```typescript
   // ย้าย business logic จาก API route ไปยัง Business Service
   // เก็บเฉพาะ HTTP handling ใน API route
   ```

2. **ปรับ Server Actions**
   ```typescript
   // เปลี่ยนจากเรียก HTTP API เป็นเรียก Business Service โดยตรง
   // เพื่อประสิทธิภาพที่ดีกว่า
   ```

3. **สร้าง HTTP Service**
   ```typescript
   // สร้าง HTTP Service สำหรับ external API calls
   // ใช้เมื่อต้องการ third-party integration
   ```

---

**สรุป:** Hybrid Architecture ให้ความยืดหยุ่นในการเลือกใช้ flow ที่เหมาะสมกับแต่ละ use case โดยไม่ต้องเสียสละประสิทธิภาพหรือ maintainability
