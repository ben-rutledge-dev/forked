// Data
import { queryKeys } from '@/data/queryKeys';
import { useApiQuery, useApiPost, useQueryClient } from '@/data/shared/hooks';
import type { RecipeBooksResponse, PostRecipeBookPayload, PostRecipeBookResponse } from './types';

export const useRecipeBooks = () =>
  useApiQuery<RecipeBooksResponse>(
    queryKeys.recipeBooks.mine(),
    '/api/recipe-books',
  );

export const usePostRecipeBook = () => {
  const queryClient = useQueryClient();
  return useApiPost<PostRecipeBookPayload, PostRecipeBookResponse>(
    '/api/recipe-books',
    {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: queryKeys.recipeBooks.mine(),
        });
      },
    },
  );
};
