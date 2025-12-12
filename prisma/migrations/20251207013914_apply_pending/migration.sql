/*
  Warnings:

  - Made the column `userId` on table `cv_shares` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "cvs" ADD COLUMN "googleScholar" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN "resetToken" TEXT;
ALTER TABLE "users" ADD COLUMN "resetTokenExpiry" DATETIME;

-- CreateTable
CREATE TABLE "cv_share_attachments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shareId" TEXT NOT NULL,
    "cvId" TEXT NOT NULL,
    CONSTRAINT "cv_share_attachments_shareId_fkey" FOREIGN KEY ("shareId") REFERENCES "cv_shares" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "cv_share_attachments_cvId_fkey" FOREIGN KEY ("cvId") REFERENCES "cvs" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ai_settings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "openRouterKey" TEXT,
    "openRouterModel" TEXT DEFAULT 'meta-llama/llama-3.2-3b-instruct:free',
    "openRouterFallbackModels" TEXT,
    "claudeKey" TEXT,
    "claudeModel" TEXT DEFAULT 'claude-3-5-sonnet-20241022',
    "ollamaUrl" TEXT DEFAULT 'http://localhost:11434',
    "ollamaModel" TEXT DEFAULT 'llama3.2',
    "defaultProvider" TEXT NOT NULL DEFAULT 'OPENROUTER',
    "aiSuggestionsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "autoImproveText" BOOLEAN NOT NULL DEFAULT false,
    "citationAssist" BOOLEAN NOT NULL DEFAULT true,
    "grammarCheck" BOOLEAN NOT NULL DEFAULT true,
    "smtpHost" TEXT,
    "smtpPort" INTEGER NOT NULL DEFAULT 587,
    "smtpUser" TEXT,
    "smtpPassword" TEXT,
    "smtpFrom" TEXT,
    "smtpFromName" TEXT DEFAULT 'CV Builder',
    "smtpSecure" BOOLEAN NOT NULL DEFAULT false,
    "smtpSecurity" TEXT NOT NULL DEFAULT 'STARTTLS',
    "emailVerificationEnabled" BOOLEAN NOT NULL DEFAULT true,
    "emailNotificationsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "msClientId" TEXT,
    "msClientSecret" TEXT,
    "msTenantId" TEXT DEFAULT 'common',
    "msRefreshToken" TEXT,
    "msAccessToken" TEXT,
    "msTokenExpiry" DATETIME,
    "emailProvider" TEXT NOT NULL DEFAULT 'SMTP',
    "baseUrl" TEXT,
    "enableSharing" BOOLEAN NOT NULL DEFAULT true,
    "maxSharedCvs" INTEGER NOT NULL DEFAULT 10,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_ai_settings" ("aiSuggestionsEnabled", "autoImproveText", "citationAssist", "claudeKey", "claudeModel", "createdAt", "defaultProvider", "grammarCheck", "id", "ollamaModel", "ollamaUrl", "openRouterKey", "openRouterModel", "updatedAt", "userId") SELECT "aiSuggestionsEnabled", "autoImproveText", "citationAssist", "claudeKey", "claudeModel", "createdAt", "defaultProvider", "grammarCheck", "id", "ollamaModel", "ollamaUrl", "openRouterKey", "openRouterModel", "updatedAt", "userId" FROM "ai_settings";
DROP TABLE "ai_settings";
ALTER TABLE "new_ai_settings" RENAME TO "ai_settings";
CREATE UNIQUE INDEX "ai_settings_userId_key" ON "ai_settings"("userId");
CREATE TABLE "new_cv_shares" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "cvId" TEXT NOT NULL,
    "shareToken" TEXT NOT NULL,
    "permission" TEXT NOT NULL DEFAULT 'VIEW',
    "expiresAt" DATETIME,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "allowDownload" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "cv_shares_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "cv_shares_cvId_fkey" FOREIGN KEY ("cvId") REFERENCES "cvs" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_cv_shares" ("createdAt", "cvId", "expiresAt", "id", "isActive", "permission", "shareToken", "updatedAt", "userId") SELECT "createdAt", "cvId", "expiresAt", "id", "isActive", "permission", "shareToken", "updatedAt", "userId" FROM "cv_shares";
DROP TABLE "cv_shares";
ALTER TABLE "new_cv_shares" RENAME TO "cv_shares";
CREATE UNIQUE INDEX "cv_shares_shareToken_key" ON "cv_shares"("shareToken");
CREATE INDEX "cv_shares_userId_idx" ON "cv_shares"("userId");
CREATE INDEX "cv_shares_cvId_idx" ON "cv_shares"("cvId");
CREATE INDEX "cv_shares_shareToken_idx" ON "cv_shares"("shareToken");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "cv_share_attachments_shareId_idx" ON "cv_share_attachments"("shareId");

-- CreateIndex
CREATE INDEX "cv_share_attachments_cvId_idx" ON "cv_share_attachments"("cvId");

-- CreateIndex
CREATE UNIQUE INDEX "cv_share_attachments_shareId_cvId_key" ON "cv_share_attachments"("shareId", "cvId");
