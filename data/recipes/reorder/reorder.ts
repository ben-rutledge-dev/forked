// Data
import { queryKeys } from '@/data/queryKeys';
import { useApiPut, useQueryClient } from '@/data/shared/hooks';
import type { PutRecipesReorderPayload } from './types';

export const usePutRecipesReorder = () => {
  const queryClient = useQueryClient();
  return useApiPut<PutRecipesReorderPayload, void>('/api/recipes/reorder', {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.recipes.all });
    },
  });
};
