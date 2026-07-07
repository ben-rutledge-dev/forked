// Data
import { queryKeys } from '@/data/queryKeys';
import { useApiPut, useQueryClient } from '@/data/shared/hooks';
import type { PutRecipeBooksReorderPayload } from './types';

export const usePutRecipeBooksReorder = () => {
  const queryClient = useQueryClient();
  return useApiPut<PutRecipeBooksReorderPayload, void>('/api/recipe-books/reorder', {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.recipeBooks.mine() });
    },
  });
};
