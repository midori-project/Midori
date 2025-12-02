-- Migration: Add Frontend-V2 support to ProjectContext
-- Date: 2024-01-XX
-- Description: Add frontendV2Data field to support Frontend-V2 integration

-- Add frontendV2Data column to ProjectContext table
ALTER TABLE "ProjectContext" 
ADD COLUMN "frontendV2Data" JSON;

-- Add comment for documentation
COMMENT ON COLUMN "ProjectContext"."frontendV2Data" IS 'Frontend-V2 integration data including files, project structure, and preview information';

-- Create index for better query performance (optional)
-- CREATE INDEX "ProjectContext_frontendV2Data_idx" ON "ProjectContext" USING GIN ("frontendV2Data");

-- Update existing records to have null frontendV2Data (if needed)
-- UPDATE "ProjectContext" SET "frontendV2Data" = NULL WHERE "frontendV2Data" IS NULL;
