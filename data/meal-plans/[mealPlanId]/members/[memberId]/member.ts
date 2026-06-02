// Data
import { queryKeys } from '@/data/queryKeys';
import { useApiDelete, useQueryClient } from '@/data/shared/hooks';
import type { Params, Payload } from './types';

export const useDeleteMealPlanMember = ({ mealPlanId }: Params) => {
  const queryClient = useQueryClient();
  return useApiDelete<Payload, void>(
    ({ userId }) => `/api/meal-plans/${mealPlanId}/members/${userId}`,
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.mealPlans.detail(mealPlanId ?? '') });
      },
    },
  );
};
