-- ตรวจสอบข้อมูล Visual Edit ที่บันทึกใน Database
-- Project ID: 8169f09f-6c65-4515-a8b7-b7483edadad0

-- 1. ดู Snapshot ล่าสุดของ Project
SELECT 
  s.id as snapshot_id,
  s."projectId",
  s.label,
  s."createdAt",
  s."templateData"->>'businessCategory' as business_category,
  s."templateData"->'customOverrides' as custom_overrides,
  jsonb_array_length(COALESCE(s."templateData"->'customOverrides', '[]'::jsonb)) as overrides_count
FROM "Snapshot" s
WHERE s."projectId" = '8169f09f-6c65-4515-a8b7-b7483edadad0'
ORDER BY s."createdAt" DESC
LIMIT 1;

-- 2. ดู customOverrides แบบละเอียด
SELECT 
  s.id,
  jsonb_pretty(s."templateData"->'customOverrides') as custom_overrides_detail
FROM "Snapshot" s
WHERE s."projectId" = '8169f09f-6c65-4515-a8b7-b7483edadad0'
ORDER BY s."createdAt" DESC
LIMIT 1;

-- 3. ดู templateData ทั้งหมด
SELECT 
  s.id,
  jsonb_pretty(s."templateData") as template_data_full
FROM "Snapshot" s
WHERE s."projectId" = '8169f09f-6c65-4515-a8b7-b7483edadad0'
ORDER BY s."createdAt" DESC
LIMIT 1;

-- 4. ตรวจสอบว่า override ของ navbar-basic.brand ถูกบันทึกหรือไม่
SELECT 
  s.id,
  s."templateData"->'customOverrides'->0->'blockId' as block_id,
  s."templateData"->'customOverrides'->0->'placeholderOverrides'->>'brand' as brand_value
FROM "Snapshot" s
WHERE s."projectId" = '8169f09f-6c65-4515-a8b7-b7483edadad0'
ORDER BY s."createdAt" DESC
LIMIT 1;

