// Data
import { queryKeys } from '@/data/queryKeys';
import { useApiQuery, useApiPut, useApiDelete, useQueryClient } from '@/data/shared/hooks';
import type { Params, Recipe, PutRecipePayload, PutRecipeResponse } from './types';

const url = (recipeId: string) => `/api/recipes/${recipeId}`;

export const useRecipe = (params?: Params) =>
  useApiQuery<Recipe>(
    queryKeys.recipes.detail(params?.recipeId ?? ''),
    url(params?.recipeId ?? ''),
    {
      enabled: !!params?.recipeId,
      initialData: params?.initialData,
    },
  );

export const usePutRecipe = (params?: Params) => {
  const queryClient = useQueryClient();
  return useApiPut<PutRecipePayload, PutRecipeResponse>(
    url(params?.recipeId ?? ''),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: queryKeys.recipes.detail(params?.recipeId ?? ''),
        });
        queryClient.invalidateQueries({
          queryKey: queryKeys.recipes.mine(),
        });
      },
    },
  );
};

export const useDeleteRecipe = (params?: Params) => {
  const queryClient = useQueryClient();
  return useApiDelete<void, void>(url(params?.recipeId ?? ''), {
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.recipes.all,
      });
    },
  });
};
