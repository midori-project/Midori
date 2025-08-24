/*
  Warnings:

  - You are about to drop the column `isEmailVerified` on the `AuthCredential` table. All the data in the column will be lost.
  - You are about to drop the column `loginEmail` on the `AuthCredential` table. All the data in the column will be lost.
  - You are about to drop the column `passwordAlgo` on the `AuthCredential` table. All the data in the column will be lost.
  - You are about to drop the column `passwordHash` on the `AuthCredential` table. All the data in the column will be lost.
  - You are about to drop the column `passwordUpdatedAt` on the `AuthCredential` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,type,identifier]` on the table `AuthCredential` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `identifier` to the `AuthCredential` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `AuthCredential` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `AuthCredential` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "AuthCredential_loginEmail_key";

-- DropIndex
DROP INDEX "AuthCredential_userId_key";

-- AlterTable
ALTER TABLE "AuthCredential" DROP COLUMN "isEmailVerified",
DROP COLUMN "loginEmail",
DROP COLUMN "passwordAlgo",
DROP COLUMN "passwordHash",
DROP COLUMN "passwordUpdatedAt",
ADD COLUMN     "expiresAt" TIMESTAMP(3),
ADD COLUMN     "identifier" TEXT NOT NULL,
ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "secret" TEXT,
ADD COLUMN     "type" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE INDEX "AuthCredential_userId_idx" ON "AuthCredential"("userId");

-- CreateIndex
CREATE INDEX "AuthCredential_identifier_idx" ON "AuthCredential"("identifier");

-- CreateIndex
CREATE UNIQUE INDEX "AuthCredential_userId_type_identifier_key" ON "AuthCredential"("userId", "type", "identifier");
