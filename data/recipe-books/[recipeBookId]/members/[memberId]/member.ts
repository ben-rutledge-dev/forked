// Data
import { queryKeys } from '@/data/queryKeys';
import { useApiDelete, useQueryClient } from '@/data/shared/hooks';
import type { Params } from './types';

export const useDeleteMember = (params?: Params) => {
  const queryClient = useQueryClient();
  return useApiDelete<void, void>(
    `/api/recipe-books/${params?.recipeBookId ?? ''}/members/${params?.memberId ?? ''}`,
    {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: queryKeys.recipeBooks.detail(params?.recipeBookId ?? ''),
        });
        queryClient.invalidateQueries({
          queryKey: queryKeys.recipeBooks.members(params?.recipeBookId ?? ''),
        });
      },
    },
  );
};
