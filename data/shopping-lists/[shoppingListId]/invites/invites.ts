// Data
import { queryKeys } from '@/data/queryKeys';
import { useApiPost, useQueryClient } from '@/data/shared/hooks';
import type { Params, PostShoppingListInvitePayload, PostShoppingListInviteResponse } from './types';

export const usePostShoppingListInvite = (params?: Params) => {
  const queryClient = useQueryClient();
  return useApiPost<PostShoppingListInvitePayload, PostShoppingListInviteResponse>(
    `/api/shopping-lists/${params?.shoppingListId ?? ''}/invites`,
    {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: queryKeys.shoppingLists.detail(params?.shoppingListId ?? ''),
        });
      },
    },
  );
};
