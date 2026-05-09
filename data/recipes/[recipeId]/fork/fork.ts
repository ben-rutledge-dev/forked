// Data
import { queryKeys } from '@/data/queryKeys';
import { useApiPost, useQueryClient } from '@/data/shared/hooks';
import type { Params, ForkRecipeResponse } from './types';

export const usePostFork = (params?: Params) => {
  const queryClient = useQueryClient();
  return useApiPost<void, ForkRecipeResponse>(
    `/api/recipes/${params?.recipeId ?? ''}/fork`,
    {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: queryKeys.recipes.mine(),
        });
        queryClient.invalidateQueries({
          queryKey: queryKeys.pool.all,
        });
      },
    },
  );
};
