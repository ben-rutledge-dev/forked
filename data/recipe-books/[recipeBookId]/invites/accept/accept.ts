// Data
import { queryKeys } from '@/data/queryKeys';
import { useApiPost, useQueryClient } from '@/data/shared/hooks';
import type { Params, AcceptInviteResponse } from './types';

export const usePostAcceptInvite = (params?: Params) => {
  const queryClient = useQueryClient();
  return useApiPost<void, AcceptInviteResponse>(
    `/api/recipe-books/${params?.recipeBookId ?? ''}/invites/accept`,
    {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: queryKeys.recipeBooks.mine(),
        });
        queryClient.invalidateQueries({
          queryKey: queryKeys.recipeBooks.pending(),
        });
      },
    },
  );
};
