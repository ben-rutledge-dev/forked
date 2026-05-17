// Data
import { queryKeys } from '@/data/queryKeys';
import { useApiPost, useQueryClient } from '@/data/shared/hooks';
import type { Params } from './types';

export const usePostDeclineShoppingListInvite = (params?: Params) => {
  const queryClient = useQueryClient();
  return useApiPost<void, void>(
    `/api/shopping-lists/${params?.shoppingListId ?? ''}/invites/decline`,
    {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: queryKeys.shoppingLists.mine(),
        });
      },
    },
  );
};
