-- AlterTable
ALTER TABLE "Recipe" ADD COLUMN "orderIndex" INTEGER;

-- Backfill: preserve current display order (most-recently-updated first) as the initial manual order
UPDATE "Recipe" r
SET "orderIndex" = sub.rn - 1
FROM (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY "authorId" ORDER BY "updatedAt" DESC) AS rn
  FROM "Recipe"
  WHERE "authorId" IS NOT NULL
) sub
WHERE r.id = sub.id;
