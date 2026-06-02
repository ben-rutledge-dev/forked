// Data
import { queryKeys } from '@/data/queryKeys';
import { useApiPost, useQueryClient } from '@/data/shared/hooks';
import type { Params, PostMealPlanInvitePayload, PostMealPlanInviteResponse } from './types';

export const usePostMealPlanInvite = (params?: Params) => {
  const queryClient = useQueryClient();
  return useApiPost<PostMealPlanInvitePayload, PostMealPlanInviteResponse>(
    `/api/meal-plans/${params?.mealPlanId ?? ''}/invites`,
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.mealPlans.detail(params?.mealPlanId ?? '') });
      },
    },
  );
};
