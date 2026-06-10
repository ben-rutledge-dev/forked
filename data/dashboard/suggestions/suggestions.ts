// Data
import { queryKeys } from '@/data/queryKeys';
import { useApiQuery, useApiPost, useApiDelete, useQueryClient } from '@/data/shared/hooks';
import type { SuggestionsParams, SuggestionsResponse, DismissPayload, DeleteDismissPayload } from './types';

export const useSuggestions = (params?: SuggestionsParams) =>
  useApiQuery<SuggestionsResponse>(
    queryKeys.dashboard.suggestions(params?.userId ?? ''),
    '/api/dashboard/suggestions',
    {
      initialData: params?.initialData,
      staleTime: 5 * 60 * 1000,
      enabled: !!params?.userId && !!params?.isPremium,
    },
  );

export const usePostDismissSuggestion = () => {
  const queryClient = useQueryClient();
  return useApiPost<DismissPayload, { success: boolean }>(
    '/api/dashboard/suggestions/dismiss',
    {
      onSuccess: (_, variables) => {
        queryClient.setQueryData<SuggestionsResponse>(
          queryKeys.dashboard.suggestions(variables.userId ?? ''),
          old =>
            old
              ? { suggestions: old.suggestions.filter(s => s !== variables.ingredientName) }
              : old,
        );
      },
    },
  );
};

export const useDeleteDismissSuggestion = () => {
  const queryClient = useQueryClient();
  return useApiDelete<DeleteDismissPayload, { success: boolean }>(
    '/api/dashboard/suggestions/dismiss',
    {
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({
          queryKey: queryKeys.dashboard.suggestions(variables.userId ?? ''),
        });
      },
    },
  );
};
