// Data
import { queryKeys } from '@/data/queryKeys';
import { useApiPut, useApiDelete, useQueryClient } from '@/data/shared/hooks';
import type { Params, PutItemPayload, PutItemResponse } from './types';

const url = (shoppingListId: string, itemId: string) =>
  `/api/shopping-lists/${shoppingListId}/items/${itemId}`;

export const usePutItem = (params?: Params) => {
  const queryClient = useQueryClient();
  return useApiPut<PutItemPayload, PutItemResponse>(
    url(params?.shoppingListId ?? '', params?.itemId ?? ''),
    {
      onMutate: async (payload) => {
        const queryKey = queryKeys.shoppingLists.detail(params?.shoppingListId ?? '');
        await queryClient.cancelQueries({ queryKey });
        const previous = queryClient.getQueryData(queryKey);
        // Optimistic update
        queryClient.setQueryData<import('@/data/shopping-lists/[shoppingListId]/types').ShoppingListDetail>(
          queryKey,
          (old) => {
            if (!old) return old;
            return {
              ...old,
              sections: old.sections.map(section => ({
                ...section,
                items: section.items.map(item =>
                  item.id === params?.itemId ? { ...item, ...payload } : item,
                ),
              })),
            };
          },
        );
        return { previous };
      },
      onError: (_err, _payload, context) => {
        const ctx = context as { previous?: unknown } | undefined;
        if (ctx?.previous) {
          queryClient.setQueryData(
            queryKeys.shoppingLists.detail(params?.shoppingListId ?? ''),
            ctx.previous,
          );
        }
      },
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: queryKeys.shoppingLists.detail(params?.shoppingListId ?? ''),
        });
      },
    },
  );
};

export const useDeleteItem = (params?: Params) => {
  const queryClient = useQueryClient();
  return useApiDelete<void, void>(
    url(params?.shoppingListId ?? '', params?.itemId ?? ''),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: queryKeys.shoppingLists.detail(params?.shoppingListId ?? ''),
        });
      },
    },
  );
};
