// Data
import { queryKeys } from '@/data/queryKeys';
import { useApiPut, useApiDelete, useQueryClient } from '@/data/shared/hooks';
import type { ShoppingListDetail } from '@/data/shopping-lists/[shoppingListId]/types';
import type { Params, PutSectionPayload, PutSectionResponse } from './types';

const url = (shoppingListId: string, sectionId: string) =>
  `/api/shopping-lists/${shoppingListId}/sections/${sectionId}`;

export const usePutSection = (params?: Params) => {
  const queryClient = useQueryClient();
  const queryKey = queryKeys.shoppingLists.detail(params?.shoppingListId ?? '');
  return useApiPut<PutSectionPayload, PutSectionResponse>(
    url(params?.shoppingListId ?? '', params?.sectionId ?? ''),
    {
      onMutate: async (payload) => {
        await queryClient.cancelQueries({ queryKey });
        const previous = queryClient.getQueryData(queryKey);
        queryClient.setQueryData<ShoppingListDetail>(queryKey, (old) => {
          if (!old) return old;
          return {
            ...old,
            sections: old.sections.map(s =>
              s.id === params?.sectionId ? { ...s, ...payload } : s,
            ),
          };
        });
        return { previous };
      },
      onError: (_err, _vars, context) => {
        const ctx = context as { previous?: unknown } | undefined;
        if (ctx?.previous) queryClient.setQueryData(queryKey, ctx.previous);
      },
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey });
      },
    },
  );
};

export const useDeleteSection = (params?: Params) => {
  const queryClient = useQueryClient();
  const queryKey = queryKeys.shoppingLists.detail(params?.shoppingListId ?? '');
  return useApiDelete<void, void>(
    url(params?.shoppingListId ?? '', params?.sectionId ?? ''),
    {
      onMutate: async () => {
        await queryClient.cancelQueries({ queryKey });
        const previous = queryClient.getQueryData(queryKey);
        queryClient.setQueryData<ShoppingListDetail>(queryKey, (old) => {
          if (!old) return old;
          return {
            ...old,
            sections: old.sections.filter(s => s.id !== params?.sectionId),
          };
        });
        return { previous };
      },
      onError: (_err, _vars, context) => {
        const ctx = context as { previous?: unknown } | undefined;
        if (ctx?.previous) queryClient.setQueryData(queryKey, ctx.previous);
      },
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey });
      },
    },
  );
};
