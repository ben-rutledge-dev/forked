// Components
import { MealPlanStrip, MealPlanStripEmpty, type DashboardEntry } from './components/MealPlanStripClient';
// App
import { getMealPlanEntries, getMembership } from '@/app/dashboard/queries';

type Props = { userId: string, startDateStr: string, endStr: string };

const mapEntry = (e: Awaited<ReturnType<typeof getMealPlanEntries>>[number]): DashboardEntry => ({
  id: e.id,
  slotId: e.slotId,
  slotLabel: e.slot.label,
  date: e.date.toISOString().split('T')[0],
  orderIndex: e.orderIndex,
  recipe: e.recipe ? { id: e.recipe.id, title: e.recipe.title, coverImageUrl: e.recipe.coverImageUrl ?? null } : null,
});

export const MealPlanStripSection = async ({ userId, startDateStr, endStr }: Props) => {
  const membership = await getMembership(userId);
  if (!membership) return <MealPlanStripEmpty />;

  const rawEntries = await getMealPlanEntries(membership.mealPlanId, startDateStr, endStr);
  return <MealPlanStrip data={{ entries: rawEntries.map(mapEntry) }} startDateStr={startDateStr} />;
};
