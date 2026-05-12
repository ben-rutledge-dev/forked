/*
  Warnings:

  - You are about to drop the `RecipeTag` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "RecipeTag" DROP CONSTRAINT "RecipeTag_recipeId_fkey";

-- AlterTable
ALTER TABLE "Recipe" ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- DropTable
DROP TABLE "RecipeTag";
