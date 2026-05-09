// Data
import { queryKeys } from '@/data/queryKeys';
import { useApiPost, useQueryClient } from '@/data/shared/hooks';
import type { Params, PostInvitePayload, PostInviteResponse } from './types';

export const usePostInvite = (params?: Params) => {
  const queryClient = useQueryClient();
  return useApiPost<PostInvitePayload, PostInviteResponse>(
    `/api/recipe-books/${params?.recipeBookId ?? ''}/invites`,
    {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: queryKeys.recipeBooks.invites(params?.recipeBookId ?? ''),
        });
        queryClient.invalidateQueries({
          queryKey: queryKeys.recipeBooks.members(params?.recipeBookId ?? ''),
        });
      },
    },
  );
};
