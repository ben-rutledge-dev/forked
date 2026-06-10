-- CreateTable
CREATE TABLE "MealPlanSuggestionDismissal" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "ingredientName" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MealPlanSuggestionDismissal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MealPlanSuggestionDismissal_userId_idx" ON "MealPlanSuggestionDismissal"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "MealPlanSuggestionDismissal_userId_ingredientName_key" ON "MealPlanSuggestionDismissal"("userId", "ingredientName");

-- AddForeignKey
ALTER TABLE "MealPlanSuggestionDismissal" ADD CONSTRAINT "MealPlanSuggestionDismissal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
