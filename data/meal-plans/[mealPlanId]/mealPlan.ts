// Data
import { queryKeys } from '@/data/queryKeys';
import { useApiQuery, useApiPut, useApiDelete, useQueryClient } from '@/data/shared/hooks';
import type { Params, MealPlanDetail, PutMealPlanPayload, PutMealPlanResponse } from './types';

const url = (mealPlanId: string) => `/api/meal-plans/${mealPlanId}`;

export const useMealPlan = (params?: Params) => {
  const { mealPlanId, startDate, endDate } = params ?? {};
  const queryKey = startDate
    ? queryKeys.mealPlans.week(mealPlanId ?? '', startDate)
    : queryKeys.mealPlans.detail(mealPlanId ?? '');
  const queryUrl = mealPlanId
    ? `${url(mealPlanId)}${startDate && endDate ? `?startDate=${startDate}&endDate=${endDate}` : ''}`
    : '';
  return useApiQuery<MealPlanDetail>(
    queryKey,
    queryUrl,
    { enabled: !!mealPlanId },
  );
};

export const usePutMealPlan = (params?: Params) => {
  const queryClient = useQueryClient();
  return useApiPut<PutMealPlanPayload, PutMealPlanResponse>(
    url(params?.mealPlanId ?? ''),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.mealPlans.detail(params?.mealPlanId ?? '') });
        queryClient.invalidateQueries({ queryKey: queryKeys.mealPlans.mine() });
      },
    },
  );
};

export const useDeleteMealPlan = (params?: Params) => {
  const queryClient = useQueryClient();
  return useApiDelete<void, void>(
    url(params?.mealPlanId ?? ''),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.mealPlans.all });
      },
    },
  );
};
