/*
  Warnings:

  - The `prompt` column on the `Generation` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[previewFileId]` on the table `Project` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."Generation" DROP COLUMN "prompt",
ADD COLUMN     "prompt" JSONB;

-- AlterTable
ALTER TABLE "public"."Project" ADD COLUMN     "previewFileId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Project_previewFileId_key" ON "public"."Project"("previewFileId");

-- AddForeignKey
ALTER TABLE "public"."Project" ADD CONSTRAINT "Project_previewFileId_fkey" FOREIGN KEY ("previewFileId") REFERENCES "public"."File"("id") ON DELETE SET NULL ON UPDATE CASCADE;
