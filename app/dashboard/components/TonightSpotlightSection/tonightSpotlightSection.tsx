// Components
import { TonightSpotlight, type SpotlightEntry } from './components/TonightSpotlight';
// App
import { getMealPlanEntries, getMembership } from '@/app/dashboard/queries';

type Props = { userId: string, todayStr: string, endStr: string };

const mapEntry = (e: Awaited<ReturnType<typeof getMealPlanEntries>>[number]): SpotlightEntry => ({
  id: e.id,
  slotId: e.slotId,
  slotLabel: e.slot.label,
  date: e.date.toISOString().split('T')[0],
  orderIndex: e.orderIndex,
  recipe: e.recipe ? { id: e.recipe.id, title: e.recipe.title, coverImageUrl: e.recipe.coverImageUrl ?? null, tags: e.recipe.tags, categories: e.recipe.categories.map(rc => rc.category.label) } : null,
});

export const TonightSpotlightSection = async ({ userId, todayStr, endStr }: Props) => {
  const membership = await getMembership(userId);
  if (!membership) return <TonightSpotlight data={null} />;

  const rawEntries = await getMealPlanEntries(membership.mealPlanId, todayStr, endStr);
  return <TonightSpotlight data={{ entries: rawEntries.map(mapEntry) }} />;
};
