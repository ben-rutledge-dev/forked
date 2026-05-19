// Data
import { queryKeys } from '@/data/queryKeys';
import { useApiQuery, useApiPost, useQueryClient } from '@/data/shared/hooks';
// Types
import type { Recipe } from '@/types';
import type { MyRecipesParams, PostRecipePayload, PostRecipeResponse, PoolParams, PoolRecipesResponse } from './types';

export const useMyRecipes = (params?: MyRecipesParams) => {
  const searchParams = new URLSearchParams();
  if (params?.tags?.length) searchParams.set('tags', params.tags.join(','));
  if (params?.categories?.length) searchParams.set('categories', params.categories.join(','));

  return useApiQuery<Recipe[]>(
    queryKeys.recipes.mine(params?.tags, params?.categories),
    `/api/recipes?${searchParams.toString()}`,
  );
};

export const useFavouriteRecipes = () =>
  useApiQuery<Recipe[]>(
    queryKeys.recipes.favourites(),
    '/api/recipes/favourites',
  );

export const usePoolRecipes = (params?: PoolParams) => {
  const searchParams = new URLSearchParams();
  if (params?.q) searchParams.set('q', params.q);
  if (params?.page) searchParams.set('page', String(params.page));
  if (params?.categories?.length) {
    searchParams.set('categories', params.categories.join(','));
  }

  return useApiQuery<PoolRecipesResponse>(
    queryKeys.recipes.pool(params?.categories, params?.q, params?.page),
    `/api/pool?${searchParams.toString()}`,
    {
      staleTime: 0,
      placeholderData: (prev: PoolRecipesResponse | undefined) => prev,
    },
  );
};

export const usePostRecipe = () => {
  const queryClient = useQueryClient();
  return useApiPost<PostRecipePayload, PostRecipeResponse>('/api/recipes', {
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...queryKeys.recipes.all, 'mine'],
      });
    },
  });
};
