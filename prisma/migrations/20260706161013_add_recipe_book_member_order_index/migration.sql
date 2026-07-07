-- AlterTable
ALTER TABLE "RecipeBookMember" ADD COLUMN "orderIndex" INTEGER;

-- Backfill: per-user order by original membership creation time
UPDATE "RecipeBookMember" m
SET "orderIndex" = sub.rn - 1
FROM (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY "userId" ORDER BY "createdAt") AS rn
  FROM "RecipeBookMember"
) sub
WHERE m.id = sub.id;

-- AlterTable
ALTER TABLE "RecipeBookMember" ALTER COLUMN "orderIndex" SET NOT NULL;
