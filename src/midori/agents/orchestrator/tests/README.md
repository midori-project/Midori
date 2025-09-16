# การทดสอบ Midori Orchestrator แบบแยกส่วน

## วิธีการทดสอบ

### 1. ทดสอบแบบเร็ว (Quick Test)
```powershell
cd "d:\Midori\src\midori\agents\orchestrator\tests"
npm run test:orchestrator
```

### 2. ทดสอบแบบครบถ้วน (Full Test Suite)
```powershell
cd "d:\Midori\src\midori\agents\orchestrator\tests"
npm run test:orchestrator:full
```

### 3. ทดสอบแยกตามประเภท

#### Unit Tests เท่านั้น
```powershell
npm run test:unit
```

#### Integration Tests เท่านั้น
```powershell
npm run test:integration
```

#### Performance Tests เท่านั้น
```powershell
npm run test:performance
```

### 4. ตรวจสอบ TypeScript Compilation
```powershell
npm run compile
```

## ข้อมูลการทดสอบ

### Quick Test จะทำการทดสอบ:
- ✅ Orchestrator เริ่มต้นได้
- ✅ การแยกแยะประเภท command
- ✅ การสร้าง execution plan
- ✅ การคำนวณ duration

### Full Test Suite จะทำการทดสอบ:
- 🧪 Unit Tests (11 tests)
  - Schema validation
  - Command classification  
  - Dependency resolution
  - Stage planning
  - Quality gates
  - Resource management

- 🔄 Integration Tests
  - End-to-end workflow
  - Error handling
  - Edge cases

- ⚡ Performance Tests
  - Execution speed
  - Memory usage
  - Scalability

## หากมี Error

### 1. TypeScript Compilation Error
```powershell
# ตรวจสอบว่า path imports ถูกต้อง
npm run compile
```

### 2. Module Import Error
```powershell
# ติดตั้ง dependencies
npm install
```

### 3. Test Failure
- ดูรายละเอียด error ในคอนโซล
- ตรวจสอบว่า `run.ts` อยู่ใน path ที่ถูกต้อง
- ตรวจสอบ guardrails.md configuration

## การพัฒนาต่อ

หลังจากทดสอบเสร็จแล้ว:
1. หาก tests ผ่านหมด → พร้อมสำหรับ Phase 2
2. หาก tests fail → แก้ไข issues ก่อน
3. เพิ่ม tests ใหม่ตามความต้องการ

## Tips การใช้งาน

- ใช้ Quick Test สำหรับการทดสอบระหว่างพัฒนา
- ใช้ Full Test Suite ก่อน commit หรือ deploy
- ใช้ specific test types เมื่อต้องการ debug ปัญหาเฉพาะด้าน