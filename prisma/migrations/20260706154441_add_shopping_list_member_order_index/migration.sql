-- AlterTable
ALTER TABLE "ShoppingListMember" ADD COLUMN "orderIndex" INTEGER;

-- Backfill: per-user order by original membership creation time
UPDATE "ShoppingListMember" m
SET "orderIndex" = sub.rn - 1
FROM (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY "userId" ORDER BY "createdAt") AS rn
  FROM "ShoppingListMember"
) sub
WHERE m.id = sub.id;

-- AlterTable
ALTER TABLE "ShoppingListMember" ALTER COLUMN "orderIndex" SET NOT NULL;
