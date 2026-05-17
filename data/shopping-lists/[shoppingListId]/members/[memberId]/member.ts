// Data
import { queryKeys } from '@/data/queryKeys';
import { useApiDelete, useQueryClient } from '@/data/shared/hooks';
import type { Params, Payload } from './types';

export const useDeleteShoppingListMember = ({ shoppingListId }: Params) => {
  const queryClient = useQueryClient();
  return useApiDelete<Payload, void>(
    ({ userId }) => `/api/shopping-lists/${shoppingListId}/members/${userId}`,
    {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: queryKeys.shoppingLists.detail(shoppingListId),
        });
      },
    },
  );
};
