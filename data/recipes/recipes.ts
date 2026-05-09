// Data
import { queryKeys } from '@/data/queryKeys';
import { useApiQuery, useApiPost, useQueryClient } from '@/data/shared/hooks';
// Types
import type { Recipe } from '@/types';
import type { PostRecipePayload, PostRecipeResponse } from './types';

export const useMyRecipes = (params?: { initialData?: Recipe[] }) =>
  useApiQuery<Recipe[]>(
    queryKeys.recipes.mine(),
    '/api/recipes',
    { initialData: params?.initialData },
  );

export const usePostRecipe = () => {
  const queryClient = useQueryClient();
  return useApiPost<PostRecipePayload, PostRecipeResponse>('/api/recipes', {
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.recipes.mine(),
      });
    },
  });
};
