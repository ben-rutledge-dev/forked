// Data
import type { Suggestion } from '@/data/dashboard/suggestions/types';
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
  recipe: { title: string, ingredients: Array<{ name: string }> } | null
};

const buildSuggestions = (
  entries: SuggestionEntry[],
  dismissals: Array<{ ingredientName: string }>,
): Suggestion[] => {
  const dismissed = new Set(dismissals.map(d => d.ingredientName.toLowerCase().trim()));
  const seen = new Map<string, Suggestion>();
  for (const entry of entries) {
    const recipeTitle = entry.recipe?.title;
    for (const ing of entry.recipe?.ingredients ?? []) {
      const key = ing.name.toLowerCase().trim();
      if (!key || dismissed.has(key)) continue;
      if (!seen.has(key)) seen.set(key, { name: ing.name.trim(), recipes: [] });
      const suggestion = seen.get(key)!;
      if (recipeTitle && !suggestion.recipes.includes(recipeTitle)) {
        suggestion.recipes.push(recipeTitle);
      }
    }
  }
  return Array.from(seen.values());
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

  let suggestions: Suggestion[] | null = null;

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
