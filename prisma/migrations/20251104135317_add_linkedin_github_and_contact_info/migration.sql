-- AlterTable
ALTER TABLE "cvs" ADD COLUMN "github" TEXT;
ALTER TABLE "cvs" ADD COLUMN "linkedin" TEXT;
ALTER TABLE "cvs" ADD COLUMN "sectionOrder" TEXT;

-- CreateTable
CREATE TABLE "contact_info" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "cvId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "label" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "contact_info_cvId_fkey" FOREIGN KEY ("cvId") REFERENCES "cvs" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "contact_info_cvId_idx" ON "contact_info"("cvId");
