// Data
import { queryKeys } from '@/data/queryKeys';
import { useApiPost, useQueryClient } from '@/data/shared/hooks';
import type { Params, AcceptShoppingListInviteResponse } from './types';

export const usePostAcceptShoppingListInvite = (params?: Params) => {
  const queryClient = useQueryClient();
  return useApiPost<void, AcceptShoppingListInviteResponse>(
    `/api/shopping-lists/${params?.shoppingListId ?? ''}/invites/accept`,
    {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: queryKeys.shoppingLists.mine(),
        });
      },
    },
  );
};
