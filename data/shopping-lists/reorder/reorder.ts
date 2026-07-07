// Data
import { queryKeys } from '@/data/queryKeys';
import { useApiPut, useQueryClient } from '@/data/shared/hooks';
import type { PutShoppingListsReorderPayload } from './types';

export const usePutShoppingListsReorder = () => {
  const queryClient = useQueryClient();
  return useApiPut<PutShoppingListsReorderPayload, void>('/api/shopping-lists/reorder', {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.shoppingLists.mine() });
    },
  });
};
