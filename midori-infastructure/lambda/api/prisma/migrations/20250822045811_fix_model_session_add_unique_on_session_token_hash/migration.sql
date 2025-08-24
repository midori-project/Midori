/*
  Warnings:

  - A unique constraint covering the columns `[sessionTokenHash]` on the table `Session` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionTokenHash_key" ON "public"."Session"("sessionTokenHash");
