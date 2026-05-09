// Data
import { queryKeys } from '@/data/queryKeys';
import { useApiPost, useQueryClient } from '@/data/shared/hooks';
import type { PostRecipePayload, PostRecipeResponse } from './types';

export const usePostRecipe = () => {
  const queryClient = useQueryClient();
  return useApiPost<PostRecipePayload, PostRecipeResponse>('/api/recipes', {
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.recipes.mine(),
      });
    },
  });
};
