// Data
import type { MealPlanEntry } from '@/data/meal-plans/[mealPlanId]/types';
// Components
import { MealPlanStrip, MealPlanStripEmpty } from './components/MealPlanStripClient';
// App
// Queries
import { getMealPlanEntries, getMembership } from '@/app/dashboard/queries';

type Props = { userId: string, todayStr: string, endStr: string };

const mapEntry = (e: Awaited<ReturnType<typeof getMealPlanEntries>>[number]): MealPlanEntry => ({
  id: e.id,
  mealPlanId: e.mealPlanId,
  slotId: e.slotId,
  recipeId: e.recipeId,
  date: e.date.toISOString().split('T')[0],
  orderIndex: e.orderIndex,
  createdAt: e.createdAt.toISOString(),
  recipe: e.recipe ? { id: e.recipe.id, title: e.recipe.title, coverImageUrl: e.recipe.coverImageUrl ?? null } : null,
});

export const MealPlanStripSection = async ({ userId, todayStr, endStr }: Props) => {
  const membership = await getMembership(userId);
  if (!membership) return <MealPlanStripEmpty />;

  // getMealPlanEntries is cached — same request as TonightSpotlightSection hits the cache, not the DB.
  const rawEntries = await getMealPlanEntries(membership.mealPlanId, todayStr, endStr);
  return <MealPlanStrip data={{ entries: rawEntries.map(mapEntry) }} />;
};
