// Data
import { queryKeys } from '@/data/queryKeys';
import { useApiQuery } from '@/data/shared/hooks';

export type SavedRecipe = {
  id: string
  title: string
  description: string | null
  coverImageUrl: string | null
};

export type SavedRecipesResponse = {
  recipes: SavedRecipe[]
};

export const useSavedRecipes = (q?: string) =>
  useApiQuery<SavedRecipesResponse>(
    queryKeys.mealPlans.savedRecipes(q),
    `/api/meal-plans/saved-recipes${q ? `?q=${encodeURIComponent(q)}` : ''}`,
  );
