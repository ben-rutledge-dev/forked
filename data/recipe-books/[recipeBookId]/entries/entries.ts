// Data
import { queryKeys } from '@/data/queryKeys';
import { useApiPost, useQueryClient } from '@/data/shared/hooks';
import type { Params, PostEntryPayload, PostEntryResponse } from './types';

export const usePostEntry = (params?: Params) => {
  const queryClient = useQueryClient();
  return useApiPost<PostEntryPayload, PostEntryResponse>(
    `/api/recipe-books/${params?.recipeBookId ?? ''}/entries`,
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
