// Data
import { queryKeys } from '@/data/queryKeys';
import { useApiPost, useQueryClient } from '@/data/shared/hooks';
import type { Params } from './types';

export const usePostAcceptMealPlanInvite = (params?: Params) => {
  const queryClient = useQueryClient();
  return useApiPost<void, void>(
    `/api/meal-plans/${params?.mealPlanId ?? ''}/invites/accept`,
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.mealPlans.mine() });
      },
    },
  );
};
