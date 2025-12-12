-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_experience" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "cvId" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "location" TEXT,
    "startDate" DATETIME,
    "endDate" DATETIME,
    "current" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "achievements" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "experience_cvId_fkey" FOREIGN KEY ("cvId") REFERENCES "cvs" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_experience" ("achievements", "company", "createdAt", "current", "cvId", "description", "endDate", "id", "location", "order", "position", "startDate", "updatedAt") SELECT "achievements", "company", "createdAt", "current", "cvId", "description", "endDate", "id", "location", "order", "position", "startDate", "updatedAt" FROM "experience";
DROP TABLE "experience";
ALTER TABLE "new_experience" RENAME TO "experience";
CREATE INDEX "experience_cvId_idx" ON "experience"("cvId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
