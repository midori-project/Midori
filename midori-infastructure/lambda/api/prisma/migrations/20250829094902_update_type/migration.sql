/*
  Warnings:

  - The `prompt` column on the `Generation` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "public"."Generation" DROP COLUMN "prompt",
ADD COLUMN     "prompt" JSONB;
