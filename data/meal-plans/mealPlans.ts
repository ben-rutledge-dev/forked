// Data
import { queryKeys } from '@/data/queryKeys';
import { useApiQuery, useApiPost, useQueryClient } from '@/data/shared/hooks';
import type { MealPlansResponse, PostMealPlanPayload, PostMealPlanResponse } from './types';

export const useMealPlans = () =>
  useApiQuery<MealPlansResponse>(
    queryKeys.mealPlans.mine(),
    '/api/meal-plans',
  );

export const usePostMealPlan = () => {
  const queryClient = useQueryClient();
  return useApiPost<PostMealPlanPayload, PostMealPlanResponse>(
    '/api/meal-plans',
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.mealPlans.mine() });
      },
    },
  );
};
