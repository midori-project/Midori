# Create User Lambda Function

Lambda function สำหรับเพิ่มข้อมูล users ลงในฐานข้อมูล PostgreSQL ผ่าน Prisma

## การใช้งาน

### 1. Environment Variables ที่ต้องตั้งค่า

```bash
DB_SECRET_NAME=your-secret-name
DB_HOST=your-db-host
DB_PORT=5432
DB_NAME=your-db-name
```

### 2. การเรียกใช้ผ่าน API Gateway

**Endpoint:** `POST /users`

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com", 
  "password": "mypassword123"
}
```

**Response Success (201):**
```json
{
  "message": "User created successfully",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "status": "success"
}
```

### 3. Error Responses

**400 - Bad Request:**
```json
{
  "error": "Missing required fields: username, email, password",
  "status": "error"
}
```

**409 - Conflict (Duplicate):**
```json
{
  "error": "username already exists",
  "status": "error"
}
```

**500 - Internal Server Error:**
```json
{
  "error": "Internal server error", 
  "status": "error"
}
```

## การทดสอบ

### ทดสอบด้วย AWS CLI

```bash
aws lambda invoke \
  --function-name your-create-user-function \
  --payload file://test-create-user.json \
  response.json
```

### ทดสอบด้วย cURL

```bash
curl -X POST https://your-api-gateway-url/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123"
  }'
```

## ฟีเจอร์

- ✅ เข้ารหัส password ด้วย bcrypt
- ✅ ตรวจสอบข้อมูลที่จำเป็น
- ✅ ตรวจสอบความยาวของข้อมูล
- ✅ จัดการ duplicate username/email
- ✅ CORS support
- ✅ Error handling ที่ครอบคลุม
- ✅ Logging สำหรับ debugging

## การ Deploy

1. Install dependencies:
```bash
npm install
```

2. Generate Prisma client:
```bash
npx prisma generate
```

3. Deploy ผ่าน AWS CDK หรือ SAM
