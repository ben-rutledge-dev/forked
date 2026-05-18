// Data
import { queryKeys } from '@/data/queryKeys';
import { useApiPost, useApiPut, useApiDelete, useQueryClient } from '@/data/shared/hooks';
import type { ShoppingListDetail } from '@/data/shopping-lists/[shoppingListId]/types';
import type { Params, PostItemsPayload, PostItemsResponse, PutItemsReorderPayload, PutItemSectionPayload } from './types';

export const usePostItems = (params?: Params) => {
  const queryClient = useQueryClient();
  return useApiPost<PostItemsPayload, PostItemsResponse>(
    `/api/shopping-lists/${params?.shoppingListId ?? ''}/items`,
    {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: queryKeys.shoppingLists.detail(params?.shoppingListId ?? ''),
        });
      },
    },
  );
};

export const useDeleteCheckedItems = (params?: Params) => {
  const queryClient = useQueryClient();
  return useApiDelete<void, void>(
    `/api/shopping-lists/${params?.shoppingListId ?? ''}/items/checked`,
    {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: queryKeys.shoppingLists.detail(params?.shoppingListId ?? ''),
        });
      },
    },
  );
};

export const usePutItemsReorder = (params?: Params) => {
  const queryClient = useQueryClient();
  const queryKey = queryKeys.shoppingLists.detail(params?.shoppingListId ?? '');
  return useApiPut<PutItemsReorderPayload, void>(
    `/api/shopping-lists/${params?.shoppingListId ?? ''}/items/reorder`,
    {
      onMutate: async (payload) => {
        await queryClient.cancelQueries({ queryKey });
        const previous = queryClient.getQueryData(queryKey);
        const idToOrder = new Map(payload.items.map(i => [i.id, i.orderIndex]));
        type Item = ShoppingListDetail['sections'][number]['items'][number];
        const applyOrder = (item: Item) =>
          idToOrder.has(item.id) ? { ...item, orderIndex: idToOrder.get(item.id)! } : item;
        const byOrder = (a: Item, b: Item) => a.orderIndex - b.orderIndex;
        queryClient.setQueryData<ShoppingListDetail>(queryKey, (old) => {
          if (!old) return old;
          return {
            ...old,
            sections: old.sections.map(section => ({
              ...section,
              items: [...section.items].map(applyOrder).sort(byOrder),
            })),
          };
        });
        return { previous };
      },
      onError: (_err, _payload, context) => {
        const ctx = context as { previous?: unknown } | undefined;
        if (ctx?.previous) queryClient.setQueryData(queryKey, ctx.previous);
      },
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey });
      },
    },
  );
};

export const usePutItemSection = (params?: Params) => {
  const queryClient = useQueryClient();
  return useApiPut<PutItemSectionPayload, void>(
    ({ itemId }) => `/api/shopping-lists/${params?.shoppingListId ?? ''}/items/${itemId}`,
    {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: queryKeys.shoppingLists.detail(params?.shoppingListId ?? ''),
        });
      },
    },
  );
};
