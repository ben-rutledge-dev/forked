// Data
import { queryKeys } from '@/data/queryKeys';
import { useApiPost, useQueryClient } from '@/data/shared/hooks';
import type { Params } from './types';

export const usePostDeclineInvite = (params?: Params) => {
  const queryClient = useQueryClient();
  return useApiPost<void, void>(
    `/api/recipe-books/${params?.recipeBookId ?? ''}/invites/decline`,
    {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: queryKeys.recipeBooks.pending(),
        });
        queryClient.invalidateQueries({
          queryKey: queryKeys.recipeBooks.mine(),
        });
      },
    },
  );
};
