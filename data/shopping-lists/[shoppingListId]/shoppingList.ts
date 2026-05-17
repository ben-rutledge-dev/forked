// Data
import { queryKeys } from '@/data/queryKeys';
import { useApiQuery, useApiPut, useApiDelete, useQueryClient } from '@/data/shared/hooks';
import type { Params, ShoppingListDetail, PutShoppingListPayload, PutShoppingListResponse } from './types';

const url = (shoppingListId: string) => `/api/shopping-lists/${shoppingListId}`;

export const useShoppingList = (params?: Params) =>
  useApiQuery<ShoppingListDetail>(
    queryKeys.shoppingLists.detail(params?.shoppingListId ?? ''),
    url(params?.shoppingListId ?? ''),
    {
      enabled: !!params?.shoppingListId,
      initialData: params?.initialData,
    },
  );

export const usePutShoppingList = (params?: Params) => {
  const queryClient = useQueryClient();
  return useApiPut<PutShoppingListPayload, PutShoppingListResponse>(
    url(params?.shoppingListId ?? ''),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: queryKeys.shoppingLists.detail(params?.shoppingListId ?? ''),
        });
        queryClient.invalidateQueries({
          queryKey: queryKeys.shoppingLists.mine(),
        });
      },
    },
  );
};

export const useDeleteShoppingList = (params?: Params) => {
  const queryClient = useQueryClient();
  return useApiDelete<void, void>(url(params?.shoppingListId ?? ''), {
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.shoppingLists.all,
      });
    },
  });
};
