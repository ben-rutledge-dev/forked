// Data
import { queryKeys } from '@/data/queryKeys';
import { useApiPut, useQueryClient } from '@/data/shared/hooks';
import type { Params, PutReorderPayload } from './types';

export const usePutReorder = (params?: Params) => {
  const queryClient = useQueryClient();
  return useApiPut<PutReorderPayload, void>(
    `/api/recipe-books/${params?.recipeBookId ?? ''}/entries/reorder`,
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
