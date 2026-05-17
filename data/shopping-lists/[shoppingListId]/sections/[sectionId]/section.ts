// Data
import { queryKeys } from '@/data/queryKeys';
import { useApiPut, useApiDelete, useQueryClient } from '@/data/shared/hooks';
import type { Params, PutSectionPayload, PutSectionResponse } from './types';

const url = (shoppingListId: string, sectionId: string) =>
  `/api/shopping-lists/${shoppingListId}/sections/${sectionId}`;

export const usePutSection = (params?: Params) => {
  const queryClient = useQueryClient();
  return useApiPut<PutSectionPayload, PutSectionResponse>(
    url(params?.shoppingListId ?? '', params?.sectionId ?? ''),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: queryKeys.shoppingLists.detail(params?.shoppingListId ?? ''),
        });
      },
    },
  );
};

export const useDeleteSection = (params?: Params) => {
  const queryClient = useQueryClient();
  return useApiDelete<void, void>(
    url(params?.shoppingListId ?? '', params?.sectionId ?? ''),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: queryKeys.shoppingLists.detail(params?.shoppingListId ?? ''),
        });
      },
    },
  );
};
