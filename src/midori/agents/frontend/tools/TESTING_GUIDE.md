# 🧪 คู่มือการทดสอบระบบ Template Slots

คู่มือนี้แสดงวิธีการทดสอบระบบ Template Slots ที่สร้างขึ้นสำหรับ Frontend Agent

## 📋 วิธีการทดสอบทั้งหมด

### 1. การทดสอบแบบง่าย (Quick Test)
```bash
cd Midori/src/midori/agents/frontend/tools
node test-template-slots.js
```

**ผลลัพธ์ที่คาดหวัง:**
- ✅ การเติม slots ทำงานได้
- ✅ Mock profiles ทำงานได้  
- ✅ ระบบสุ่มทำงานได้
- ✅ ระบบ deterministic ทำงานได้

### 2. การทดสอบฟังก์ชันแต่ละส่วน (Detailed Test)
```bash
node test-individual-functions.js
```

**ทดสอบ:**
- 🎲 SeededRandom class
- 🔑 การสร้าง Seed
- 🎨 การสร้างข้อมูลสุ่ม
- 🎭 การประมวลผล Mock Data
- 🔗 การ Mapping Aliases
- ✅ การ Validation

### 3. การทดสอบแบบ Unit Tests (Comprehensive Test)
```bash
node simple-test-runner.js
```

**ทดสอบ 17 test cases:**
- SeededRandom: 4 tests
- Seed Generation: 3 tests
- Alias Mapping: 2 tests
- Validation: 3 tests
- Mock Data Processing: 3 tests
- Integration Tests: 2 tests

**ผลลัพธ์ที่คาดหวัง:**
```
📊 สรุปผลการทดสอบ:
✅ ผ่าน: 17
❌ ไม่ผ่าน: 0
📋 รวม: 17
```

## 🎯 สิ่งที่ทดสอบ

### 1. ระบบสุ่ม (Random System)
- ✅ **Deterministic**: ผลลัพธ์เหมือนกันเมื่อใช้ seed เดียวกัน
- ✅ **Range Validation**: ตัวเลขสุ่มอยู่ในช่วงที่กำหนด
- ✅ **Array Choice**: เลือกจาก array ได้ถูกต้อง
- ✅ **Seed Generation**: สร้าง seed จาก template key + version

### 2. การเติม Slots
- ✅ **Alias Mapping**: map requirements ผ่าน aliases
- ✅ **Default Values**: เติมค่าเริ่มต้นจาก template schema
- ✅ **Mock Data**: เติมข้อมูลจำลองสำหรับ external keys
- ✅ **Random Fill**: เติมข้อมูลสุ่มสำหรับ slots ที่ขาด

### 3. การ Validation
- ✅ **Color Format**: ตรวจสอบ hex color (#rrggbb)
- ✅ **Phone Format**: ตรวจสอบรูปแบบเบอร์โทรศัพท์
- ✅ **String Length**: ตรวจสอบความยาวขั้นต่ำ/สูงสุด
- ✅ **Required Fields**: ตรวจสอบฟิลด์ที่จำเป็น

### 4. Mock Profiles
- ✅ **Static Data**: ข้อมูลคงที่ (address, openHours)
- ✅ **Dynamic Data**: ข้อมูลที่สร้างจาก functions (domain, phone)
- ✅ **Consistency**: ผลลัพธ์เหมือนกันเมื่อใช้ seed เดียวกัน
- ✅ **Profile Switching**: เปลี่ยน profile ได้

### 5. Integration Flow
- ✅ **Complete Flow**: กระบวนการครบวงจร
- ✅ **Missing Requirements**: จัดการกับข้อมูลที่ไม่ครบ
- ✅ **Error Handling**: จัดการข้อผิดพลาด
- ✅ **Performance**: ประสิทธิภาพการทำงาน

## 🔍 การทดสอบแบบ Manual

### ทดสอบการใช้งานจริง
```javascript
// 1. สร้าง requirements
const requirements = {
  businessName: 'ร้านอาหารสยาม',
  primaryColor: '#ff6b6b'
};

// 2. เรียกใช้ template_slots_tool
const result = await template_slots_tool({
  action: 'fill_slots',
  params: {
    templateKey: 'restaurant-basic',
    version: 1,
    requirements,
    includeMock: true,
    mockProfile: 'th-local-basic'
  }
});

// 3. ตรวจสอบผลลัพธ์
console.log('Filled Slots:', result.data.filledSlots);
console.log('Mocked Keys:', result.data.mockedKeys);
```

### ทดสอบ Mock Profiles ต่างๆ
```javascript
const profiles = ['th-local-basic', 'global-basic', 'random'];

for (const profile of profiles) {
  const result = await template_slots_tool({
    action: 'fill_slots',
    params: {
      templateKey: 'restaurant-basic',
      version: 1,
      requirements: { businessName: 'ร้านทดสอบ' },
      mockProfile: profile
    }
  });
  
  console.log(`${profile}:`, result.data.mockedKeys);
}
```

## 📊 ผลลัพธ์การทดสอบ

### ✅ การทดสอบที่ผ่านทั้งหมด
- **Basic Functionality**: ระบบพื้นฐานทำงานได้
- **Random Generation**: ระบบสุ่มทำงานได้ถูกต้อง
- **Mock Data**: ข้อมูลจำลองสร้างได้ถูกต้อง
- **Validation**: การตรวจสอบทำงานได้
- **Integration**: การทำงานร่วมกันสมบูรณ์

### 🎯 Key Features ที่ทดสอบแล้ว
1. **ระบบสุ่มที่เติมทุกช่องที่มี slot** ✅
2. **Mock profiles สำหรับข้อมูลจำลอง** ✅
3. **Deterministic seed สำหรับความสม่ำเสมอ** ✅
4. **Validation ตาม constraints** ✅
5. **Alias mapping สำหรับ requirements** ✅

## 🚀 การทดสอบ Performance

### ทดสอบความเร็ว
```javascript
const startTime = Date.now();

// ประมวลผล 1000 slots
for (let i = 0; i < 1000; i++) {
  const seed = generateSeed(`template-${i}`, 1);
  const random = new SeededRandom(seed);
  random.next();
}

const duration = Date.now() - startTime;
console.log(`Duration: ${duration}ms`); // ควร < 1000ms
```

## 🔧 การ Debug

### ตรวจสอบ Seed
```javascript
const seed = generateSeed('restaurant-basic', 1);
console.log('Seed:', seed); // 737224642
```

### ตรวจสอบ Mock Data
```javascript
const mockData = processMockData(mockProfile, 'ร้านทดสอบ', 123456);
console.log('Mock Data:', mockData);
```

### ตรวจสอบ Validation
```javascript
const result = validateSlotValue('slots.theme.primary', '#ff6b6b', { type: 'color' });
console.log('Valid:', result.valid, 'Errors:', result.errors);
```

## 📝 การทดสอบเพิ่มเติม

### ทดสอบ Edge Cases
- ✅ Empty requirements
- ✅ Invalid color formats
- ✅ Invalid phone formats
- ✅ String length violations
- ✅ Required field validation

### ทดสอบ Error Handling
- ✅ Null/undefined inputs
- ✅ Invalid template keys
- ✅ Missing mock profiles
- ✅ Validation failures

## 🎉 สรุป

ระบบ Template Slots ผ่านการทดสอบทั้งหมดแล้ว:
- ✅ **17/17 test cases ผ่าน**
- ✅ **ระบบสุ่มทำงานได้ถูกต้อง**
- ✅ **Mock profiles ทำงานได้**
- ✅ **Validation ทำงานได้**
- ✅ **Integration flow ทำงานได้**

ระบบพร้อมใช้งานกับ Frontend Agent แล้วครับ! 🚀
