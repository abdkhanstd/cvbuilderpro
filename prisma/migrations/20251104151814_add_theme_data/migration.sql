-- AlterTable
ALTER TABLE "cvs" ADD COLUMN "themeConfig" TEXT;
ALTER TABLE "cvs" ADD COLUMN "themeData" TEXT;

-- CreateTable
CREATE TABLE "custom_themes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "themeData" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "custom_themes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "custom_themes_userId_idx" ON "custom_themes"("userId");
