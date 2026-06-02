// Data
import { queryKeys } from '@/data/queryKeys';
import { useApiPost, useApiPut, useQueryClient } from '@/data/shared/hooks';
import type { Params, PostSlotPayload, PostSlotResponse, PutSlotsReorderPayload } from './types';

export const usePostSlot = (params?: Params) => {
  const queryClient = useQueryClient();
  return useApiPost<PostSlotPayload, PostSlotResponse>(
    `/api/meal-plans/${params?.mealPlanId ?? ''}/slots`,
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.mealPlans.detail(params?.mealPlanId ?? '') });
      },
    },
  );
};

export const usePutSlotsReorder = (params?: Params) => {
  const queryClient = useQueryClient();
  return useApiPut<PutSlotsReorderPayload, { ok: boolean }>(
    `/api/meal-plans/${params?.mealPlanId ?? ''}/slots`,
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.mealPlans.detail(params?.mealPlanId ?? '') });
      },
    },
  );
};
