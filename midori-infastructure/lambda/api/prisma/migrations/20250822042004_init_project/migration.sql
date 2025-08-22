-- CreateEnum
CREATE TYPE "public"."Visibility" AS ENUM ('private', 'unlisted', 'public');

-- CreateEnum
CREATE TYPE "public"."FileType" AS ENUM ('code', 'text', 'config', 'asset');

-- CreateEnum
CREATE TYPE "public"."PasswordAlgo" AS ENUM ('argon2id', 'bcrypt', 'scrypt');

-- CreateEnum
CREATE TYPE "public"."OAuthProvider" AS ENUM ('github', 'google', 'line', 'custom_oauth');

-- CreateEnum
CREATE TYPE "public"."LoginProvider" AS ENUM ('credentials', 'github', 'google', 'line', 'custom_oauth');

-- CreateEnum
CREATE TYPE "public"."DeployProvider" AS ENUM ('vercel', 'github_pages', 'netlify');

-- CreateEnum
CREATE TYPE "public"."DeployState" AS ENUM ('queued', 'building', 'ready', 'failed');

-- CreateEnum
CREATE TYPE "public"."GenerationChangeType" AS ENUM ('create', 'update', 'delete');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "displayName" TEXT,
    "avatarUrl" TEXT,
    "locale" TEXT DEFAULT 'th',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AuthCredential" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "loginEmail" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "passwordAlgo" "public"."PasswordAlgo" NOT NULL DEFAULT 'argon2id',
    "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
    "passwordUpdatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuthCredential_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AuthEmailVerification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "credentialId" TEXT,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuthEmailVerification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AuthPasswordReset" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "credentialId" TEXT,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuthPasswordReset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."OAuthConnection" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" "public"."OAuthProvider" NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "accessTokenEncrypted" TEXT,
    "refreshTokenEncrypted" TEXT,
    "scope" TEXT,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OAuthConnection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sessionTokenHash" TEXT NOT NULL,
    "ip" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."LoginAttempt" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "loginEmail" TEXT,
    "provider" "public"."LoginProvider" NOT NULL,
    "ip" TEXT,
    "success" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LoginAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Project" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "options" JSONB NOT NULL DEFAULT '{}',
    "visibility" "public"."Visibility" NOT NULL DEFAULT 'private',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."File" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "type" "public"."FileType" NOT NULL DEFAULT 'code',
    "isBinary" BOOLEAN NOT NULL DEFAULT false,
    "content" TEXT,
    "blob" BYTEA,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "File_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Generation" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "options" JSONB NOT NULL DEFAULT '{}',
    "model" TEXT NOT NULL,
    "tokensInput" INTEGER NOT NULL DEFAULT 0,
    "tokensOutput" INTEGER NOT NULL DEFAULT 0,
    "costUsd" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Generation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."GenerationFile" (
    "id" TEXT NOT NULL,
    "generationId" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "fileContent" TEXT,
    "changeType" "public"."GenerationChangeType" NOT NULL DEFAULT 'create',

    CONSTRAINT "GenerationFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Snapshot" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "label" TEXT,
    "files" JSONB NOT NULL,
    "fromGenerationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Snapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Deployment" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "provider" "public"."DeployProvider" NOT NULL,
    "state" "public"."DeployState" NOT NULL DEFAULT 'queued',
    "url" TEXT,
    "meta" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Deployment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "AuthCredential_userId_key" ON "public"."AuthCredential"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "AuthCredential_loginEmail_key" ON "public"."AuthCredential"("loginEmail");

-- CreateIndex
CREATE INDEX "AuthEmailVerification_userId_idx" ON "public"."AuthEmailVerification"("userId");

-- CreateIndex
CREATE INDEX "AuthEmailVerification_expiresAt_idx" ON "public"."AuthEmailVerification"("expiresAt");

-- CreateIndex
CREATE INDEX "AuthPasswordReset_userId_idx" ON "public"."AuthPasswordReset"("userId");

-- CreateIndex
CREATE INDEX "AuthPasswordReset_expiresAt_idx" ON "public"."AuthPasswordReset"("expiresAt");

-- CreateIndex
CREATE INDEX "OAuthConnection_userId_idx" ON "public"."OAuthConnection"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "OAuthConnection_provider_providerAccountId_key" ON "public"."OAuthConnection"("provider", "providerAccountId");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "public"."Session"("userId");

-- CreateIndex
CREATE INDEX "Session_expiresAt_idx" ON "public"."Session"("expiresAt");

-- CreateIndex
CREATE INDEX "LoginAttempt_userId_idx" ON "public"."LoginAttempt"("userId");

-- CreateIndex
CREATE INDEX "LoginAttempt_createdAt_idx" ON "public"."LoginAttempt"("createdAt");

-- CreateIndex
CREATE INDEX "Project_userId_idx" ON "public"."Project"("userId");

-- CreateIndex
CREATE INDEX "File_projectId_idx" ON "public"."File"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "File_projectId_path_key" ON "public"."File"("projectId", "path");

-- CreateIndex
CREATE INDEX "Generation_projectId_idx" ON "public"."Generation"("projectId");

-- CreateIndex
CREATE INDEX "Generation_userId_idx" ON "public"."Generation"("userId");

-- CreateIndex
CREATE INDEX "GenerationFile_generationId_idx" ON "public"."GenerationFile"("generationId");

-- CreateIndex
CREATE INDEX "Snapshot_projectId_idx" ON "public"."Snapshot"("projectId");

-- CreateIndex
CREATE INDEX "Deployment_projectId_idx" ON "public"."Deployment"("projectId");

-- AddForeignKey
ALTER TABLE "public"."AuthCredential" ADD CONSTRAINT "AuthCredential_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AuthEmailVerification" ADD CONSTRAINT "AuthEmailVerification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AuthEmailVerification" ADD CONSTRAINT "AuthEmailVerification_credentialId_fkey" FOREIGN KEY ("credentialId") REFERENCES "public"."AuthCredential"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AuthPasswordReset" ADD CONSTRAINT "AuthPasswordReset_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AuthPasswordReset" ADD CONSTRAINT "AuthPasswordReset_credentialId_fkey" FOREIGN KEY ("credentialId") REFERENCES "public"."AuthCredential"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OAuthConnection" ADD CONSTRAINT "OAuthConnection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LoginAttempt" ADD CONSTRAINT "LoginAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Project" ADD CONSTRAINT "Project_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."File" ADD CONSTRAINT "File_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Generation" ADD CONSTRAINT "Generation_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Generation" ADD CONSTRAINT "Generation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GenerationFile" ADD CONSTRAINT "GenerationFile_generationId_fkey" FOREIGN KEY ("generationId") REFERENCES "public"."Generation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Snapshot" ADD CONSTRAINT "Snapshot_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Snapshot" ADD CONSTRAINT "Snapshot_fromGenerationId_fkey" FOREIGN KEY ("fromGenerationId") REFERENCES "public"."Generation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Deployment" ADD CONSTRAINT "Deployment_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
