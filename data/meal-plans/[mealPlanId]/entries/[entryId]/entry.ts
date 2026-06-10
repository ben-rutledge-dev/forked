// Data
import type { MealPlanEntry } from '@/data/meal-plans/[mealPlanId]/types';
import { queryKeys } from '@/data/queryKeys';
import { useApiDelete, useApiPatch, useQueryClient } from '@/data/shared/hooks';
import type { Params, PatchEntryPayload, Payload } from './types';

export const usePatchEntry = (params?: Params) => {
  const queryClient = useQueryClient();
  return useApiPatch<PatchEntryPayload, MealPlanEntry>(
    ({ entryId }) => `/api/meal-plans/${params?.mealPlanId ?? ''}/entries/${entryId}`,
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

export const useDeleteEntry = (params?: Params) => {
  const queryClient = useQueryClient();
  return useApiDelete<Payload, void>(
    ({ entryId }) => `/api/meal-plans/${params?.mealPlanId ?? ''}/entries/${entryId}`,
    {
      onSuccess: () => {
        if (params?.startDate) {
          queryClient.invalidateQueries({
            queryKey: queryKeys.mealPlans.week(params.mealPlanId ?? '', params.startDate),
          });
        }
        queryClient.invalidateQueries({ queryKey: queryKeys.mealPlans.detail(params?.mealPlanId ?? '') });
        queryClient.invalidateQueries({ queryKey: ['dashboard', 'suggestions'] });
      },
    },
  );
};
