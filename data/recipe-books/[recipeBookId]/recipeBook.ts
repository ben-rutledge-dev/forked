// Data
import { queryKeys } from '@/data/queryKeys';
import { useApiQuery, useApiPut, useApiDelete, useQueryClient } from '@/data/shared/hooks';
import type { Params, RecipeBookDetail, PutRecipeBookPayload, PutRecipeBookResponse } from './types';

const url = (recipeBookId: string) => `/api/recipe-books/${recipeBookId}`;

export const useRecipeBook = (params?: Params) =>
  useApiQuery<RecipeBookDetail>(
    queryKeys.recipeBooks.detail(params?.recipeBookId ?? ''),
    url(params?.recipeBookId ?? ''),
    {
      enabled: !!params?.recipeBookId,
      initialData: params?.initialData,
    },
  );

export const usePutRecipeBook = (params?: Params) => {
  const queryClient = useQueryClient();
  return useApiPut<PutRecipeBookPayload, PutRecipeBookResponse>(
    url(params?.recipeBookId ?? ''),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: queryKeys.recipeBooks.detail(params?.recipeBookId ?? ''),
        });
        queryClient.invalidateQueries({
          queryKey: queryKeys.recipeBooks.mine(),
        });
      },
    },
  );
};

export const useDeleteRecipeBook = (params?: Params) => {
  const queryClient = useQueryClient();
  return useApiDelete<void, void>(url(params?.recipeBookId ?? ''), {
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.recipeBooks.all,
      });
    },
  });
};
