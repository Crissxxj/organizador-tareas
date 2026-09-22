-- Needed for gen_random_uuid() used by the data migration below
-- (Neon/Supabase have this available out of the box; safe to run again if it already exists)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- CreateTable
CREATE TABLE "Subject" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#6366f1',
    "icon" TEXT NOT NULL DEFAULT '📘',
    "professor" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Subject_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Subject_userId_name_key" ON "Subject"("userId", "name");

-- CreateIndex
CREATE INDEX "Subject_userId_idx" ON "Subject"("userId");

-- AddForeignKey
ALTER TABLE "Subject" ADD CONSTRAINT "Subject_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable: add the new relation column
ALTER TABLE "Task" ADD COLUMN "subjectId" TEXT;

-- Data migration: turn every distinct free-text category each user had
-- into a real Subject row, then point their tasks at it.
INSERT INTO "Subject" ("id", "name", "color", "icon", "userId", "createdAt")
SELECT gen_random_uuid()::text, t."category", '#6366f1', '📘', t."userId", CURRENT_TIMESTAMP
FROM (SELECT DISTINCT "category", "userId" FROM "Task" WHERE "category" IS NOT NULL) t;

UPDATE "Task" AS task
SET "subjectId" = subject."id"
FROM "Subject" AS subject
WHERE subject."userId" = task."userId"
  AND subject."name" = task."category";

-- AlterTable: the old free-text field is now fully replaced by the relation
ALTER TABLE "Task" DROP COLUMN "category";

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "Task_subjectId_idx" ON "Task"("subjectId");
