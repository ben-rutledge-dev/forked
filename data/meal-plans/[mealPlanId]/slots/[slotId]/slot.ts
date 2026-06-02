// Data
import { queryKeys } from '@/data/queryKeys';
import { useApiPut, useApiDelete, useQueryClient } from '@/data/shared/hooks';
import type { DeleteSlotPayload, Params, PutSlotPayload, PutSlotResponse } from './types';

export const usePutSlot = (params?: Params) => {
  const queryClient = useQueryClient();
  return useApiPut<PutSlotPayload, PutSlotResponse>(
    `/api/meal-plans/${params?.mealPlanId ?? ''}/slots/${params?.slotId ?? ''}`,
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.mealPlans.detail(params?.mealPlanId ?? '') });
      },
    },
  );
};

export const useDeleteSlot = (params?: Params) => {
  const queryClient = useQueryClient();
  return useApiDelete<DeleteSlotPayload, void>(
    ({ slotId }) => `/api/meal-plans/${params?.mealPlanId ?? ''}/slots/${slotId}`,
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.mealPlans.detail(params?.mealPlanId ?? '') });
      },
    },
  );
};
