// Data
import { queryKeys } from '@/data/queryKeys';
import { useApiPost, useApiPut, useQueryClient } from '@/data/shared/hooks';
import type { Params, PostEntryPayload, PostEntryResponse, PutEntriesReorderPayload } from './types';

export const usePostEntry = (params?: Params) => {
  const queryClient = useQueryClient();
  return useApiPost<PostEntryPayload, PostEntryResponse>(
    `/api/meal-plans/${params?.mealPlanId ?? ''}/entries`,
    {
      onSuccess: () => {
        if (params?.startDate) {
          queryClient.invalidateQueries({
            queryKey: queryKeys.mealPlans.week(params.mealPlanId ?? '', params.startDate),
          });
        }
        queryClient.invalidateQueries({ queryKey: queryKeys.mealPlans.detail(params?.mealPlanId ?? '') });
      },
    },
  );
};

export const usePutEntriesReorder = (params?: Params) => {
  const queryClient = useQueryClient();
  return useApiPut<PutEntriesReorderPayload, { ok: boolean }>(
    `/api/meal-plans/${params?.mealPlanId ?? ''}/entries`,
    {
      onSuccess: () => {
        if (params?.startDate) {
          queryClient.invalidateQueries({
            queryKey: queryKeys.mealPlans.week(params.mealPlanId ?? '', params.startDate),
          });
        }
      },
    },
  );
};
