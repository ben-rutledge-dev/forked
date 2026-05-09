// Data
import { queryKeys } from '@/data/queryKeys';
import { useApiPatch, useQueryClient } from '@/data/shared/hooks';
import type { Params, PatchVisibilityPayload, PatchVisibilityResponse } from './types';

export const usePatchVisibility = (params?: Params) => {
  const queryClient = useQueryClient();
  return useApiPatch<PatchVisibilityPayload, PatchVisibilityResponse>(
    `/api/recipes/${params?.recipeId ?? ''}/visibility`,
    {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: queryKeys.recipes.detail(params?.recipeId ?? ''),
        });
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
