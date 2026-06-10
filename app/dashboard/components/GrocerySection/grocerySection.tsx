// Data
import type { ShoppingListWithStats } from '@/data/shopping-lists/types';
// Components
import { GroceryCard } from './components/GroceryCard';
// App
import {
  getIsPremium,
  getMembership,
  getSuggestionDismissals,
  getSuggestionEntries,
  getUserShoppingLists,
} from '@/app/dashboard/queries';

type SuggestionEntry = {
  recipe: { ingredients: Array<{ name: string }> } | null
};

const buildSuggestions = (
  entries: SuggestionEntry[],
  dismissals: Array<{ ingredientName: string }>,
): string[] => {
  const dismissed = new Set(dismissals.map(d => d.ingredientName.toLowerCase().trim()));
  const seen = new Set<string>();
  const result: string[] = [];
  for (const entry of entries) {
    for (const ing of entry.recipe?.ingredients ?? []) {
      const key = ing.name.toLowerCase().trim();
      if (key && !seen.has(key) && !dismissed.has(key)) {
        seen.add(key);
        result.push(ing.name.trim());
      }
    }
  }
  return result;
};

type Props = { userId: string, todayStr: string, endStr: string };

export const GrocerySection = async ({ userId, todayStr, endStr }: Props) => {
  const [isPremium, membership, rawLists] = await Promise.all([
    getIsPremium(userId),
    getMembership(userId),
    getUserShoppingLists(userId),
  ]);

  const shoppingLists: ShoppingListWithStats[] = rawLists.map(m => ({
    id: m.shoppingList.id,
    title: m.shoppingList.title,
    createdAt: m.shoppingList.createdAt.toISOString(),
    updatedAt: m.shoppingList.updatedAt.toISOString(),
    role: m.role,
    memberCount: m.shoppingList.members.length,
    uncheckedCount: m.shoppingList.items.filter(i => !i.checked).length,
  }));

  let suggestions: string[] | null = null;

  if (isPremium && membership) {
    const [entries, dismissals] = await Promise.all([
      getSuggestionEntries(membership.mealPlanId, todayStr, endStr),
      getSuggestionDismissals(userId),
    ]);
    suggestions = buildSuggestions(entries, dismissals);
  }

  return (
    <GroceryCard
      suggestions={suggestions}
      shoppingLists={shoppingLists}
      isPremium={isPremium}
      hasMealPlan={!!membership}
      userId={userId}
    />
  );
};
