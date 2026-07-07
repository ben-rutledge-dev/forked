-- AlterTable
ALTER TABLE "RecipeFavourite" ADD COLUMN "orderIndex" INTEGER;

-- Backfill: per-user order by original favouriting time
UPDATE "RecipeFavourite" f
SET "orderIndex" = sub.rn - 1
FROM (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY "userId" ORDER BY "createdAt") AS rn
  FROM "RecipeFavourite"
) sub
WHERE f.id = sub.id;

-- AlterTable
ALTER TABLE "RecipeFavourite" ALTER COLUMN "orderIndex" SET NOT NULL;
