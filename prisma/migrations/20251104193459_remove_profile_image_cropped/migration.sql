-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_cvs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "template" TEXT NOT NULL DEFAULT 'PROFESSIONAL',
    "theme" TEXT NOT NULL DEFAULT 'modern-blue',
    "themeConfig" TEXT,
    "themeData" TEXT,
    "sectionOrder" TEXT,
    "citationStyle" TEXT NOT NULL DEFAULT 'APA',
    "showNumbering" BOOLEAN NOT NULL DEFAULT true,
    "numberingStyle" TEXT NOT NULL DEFAULT 'grouped',
    "publicationsGroupBy" TEXT NOT NULL DEFAULT 'none',
    "publicationsSortBy" TEXT NOT NULL DEFAULT 'date',
    "layout" TEXT NOT NULL DEFAULT 'classic-single',
    "category" TEXT NOT NULL DEFAULT 'ACADEMIC',
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "fullName" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "location" TEXT,
    "website" TEXT,
    "linkedin" TEXT,
    "github" TEXT,
    "summary" TEXT,
    "profileImage" TEXT,
    "hIndex" INTEGER,
    "totalCitations" INTEGER,
    "i10Index" INTEGER,
    "version" INTEGER NOT NULL DEFAULT 1,
    "parentId" TEXT,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "lastViewedAt" DATETIME,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "cvs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "cvs_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "cvs" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_cvs" ("category", "createdAt", "deletedAt", "downloadCount", "email", "fullName", "github", "hIndex", "i10Index", "id", "isDeleted", "isPublic", "lastViewedAt", "layout", "linkedin", "location", "parentId", "phone", "profileImage", "sectionOrder", "summary", "template", "theme", "themeConfig", "themeData", "title", "totalCitations", "updatedAt", "userId", "version", "viewCount", "website") SELECT "category", "createdAt", "deletedAt", "downloadCount", "email", "fullName", "github", "hIndex", "i10Index", "id", "isDeleted", "isPublic", "lastViewedAt", "layout", "linkedin", "location", "parentId", "phone", "profileImage", "sectionOrder", "summary", "template", "theme", "themeConfig", "themeData", "title", "totalCitations", "updatedAt", "userId", "version", "viewCount", "website" FROM "cvs";
DROP TABLE "cvs";
ALTER TABLE "new_cvs" RENAME TO "cvs";
CREATE INDEX "cvs_userId_idx" ON "cvs"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
