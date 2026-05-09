// Data
import { queryKeys } from '@/data/queryKeys';
import { useApiPatch, useQueryClient } from '@/data/shared/hooks';
import type { PatchProfilePayload, PatchProfileResponse } from './types';

export const usePatchProfile = () => {
  const queryClient = useQueryClient();
  return useApiPatch<PatchProfilePayload, PatchProfileResponse>(
    '/api/profile',
    {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: queryKeys.profile.mine(),
        });
      },
    },
  );
};
