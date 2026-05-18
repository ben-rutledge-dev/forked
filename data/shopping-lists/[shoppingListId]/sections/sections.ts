// Data
import { queryKeys } from '@/data/queryKeys';
import { useApiPost, useApiPut, useQueryClient } from '@/data/shared/hooks';
import type { ShoppingListDetail } from '@/data/shopping-lists/[shoppingListId]/types';
import type { Params, PostSectionPayload, PostSectionResponse, PutSectionsReorderPayload } from './types';

export const usePostSection = (params?: Params) => {
  const queryClient = useQueryClient();
  return useApiPost<PostSectionPayload, PostSectionResponse>(
    `/api/shopping-lists/${params?.shoppingListId ?? ''}/sections`,
    {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: queryKeys.shoppingLists.detail(params?.shoppingListId ?? ''),
        });
      },
    },
  );
};

export const usePutSectionReorder = (params?: Params) => {
  const queryClient = useQueryClient();
  const queryKey = queryKeys.shoppingLists.detail(params?.shoppingListId ?? '');
  return useApiPut<PutSectionsReorderPayload, void>(
    `/api/shopping-lists/${params?.shoppingListId ?? ''}/sections/reorder`,
    {
      onMutate: async (payload) => {
        await queryClient.cancelQueries({ queryKey });
        const previous = queryClient.getQueryData(queryKey);
        const idToOrder = new Map(payload.sections.map(s => [s.id, s.orderIndex]));
        queryClient.setQueryData<ShoppingListDetail>(queryKey, (old) => {
          if (!old) return old;
          return {
            ...old,
            sections: [...old.sections]
              .map(s => idToOrder.has(s.id) ? { ...s, orderIndex: idToOrder.get(s.id)! } : s)
              .sort((a, b) => a.orderIndex - b.orderIndex),
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
