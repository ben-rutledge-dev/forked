// Data
import { queryKeys } from '@/data/queryKeys';
import { useApiPut, useQueryClient } from '@/data/shared/hooks';
import type { PutFavouriteRecipesReorderPayload } from './types';

export const usePutFavouriteRecipesReorder = () => {
  const queryClient = useQueryClient();
  return useApiPut<PutFavouriteRecipesReorderPayload, void>('/api/recipes/favourites/reorder', {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.recipes.favourites() });
    },
  });
};
