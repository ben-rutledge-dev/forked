// Data
import { queryKeys } from '@/data/queryKeys';
import { useApiDelete, useQueryClient } from '@/data/shared/hooks';
import type { Params } from './types';

export const useDeleteEntry = (params?: Params) => {
  const queryClient = useQueryClient();
  return useApiDelete<void, void>(
    `/api/recipe-books/${params?.recipeBookId ?? ''}/entries/${params?.entryId ?? ''}`,
    {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: queryKeys.recipeBooks.detail(params?.recipeBookId ?? ''),
        });
        queryClient.invalidateQueries({
          queryKey: queryKeys.recipeBooks.entries(params?.recipeBookId ?? ''),
        });
      },
    },
  );
};
