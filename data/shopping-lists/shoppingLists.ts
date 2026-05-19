// Data
import { queryKeys } from '@/data/queryKeys';
import { useApiQuery, useApiPost, useQueryClient } from '@/data/shared/hooks';
import type { ShoppingListsResponse, PostShoppingListPayload, PostShoppingListResponse } from './types';

export const useShoppingLists = () =>
  useApiQuery<ShoppingListsResponse>(
    queryKeys.shoppingLists.mine(),
    '/api/shopping-lists',
  );

export const usePostShoppingList = () => {
  const queryClient = useQueryClient();
  return useApiPost<PostShoppingListPayload, PostShoppingListResponse>(
    '/api/shopping-lists',
    {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: queryKeys.shoppingLists.mine(),
        });
      },
    },
  );
};
