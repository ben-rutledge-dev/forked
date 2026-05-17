import { useEffect } from 'react';
// Data
import { queryKeys } from '@/data/queryKeys';
import { useQueryClient } from '@/data/shared/hooks';
// Lib
import { createClient } from '@/lib/supabase/client';

export const useShoppingListRealtime = (shoppingListId: string) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    let supabase: ReturnType<typeof createClient>;
    try {
      supabase = createClient();
    }
    catch {
      // Supabase not configured — skip realtime
      return;
    }
    const channel = supabase
      .channel(`shopping-list-${shoppingListId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ShoppingListItem',
          filter: `shoppingListId=eq.${shoppingListId}`,
        },
        () => {
          queryClient.invalidateQueries({
            queryKey: queryKeys.shoppingLists.detail(shoppingListId),
          });
        },
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ShoppingListSection',
          filter: `shoppingListId=eq.${shoppingListId}`,
        },
        () => {
          queryClient.invalidateQueries({
            queryKey: queryKeys.shoppingLists.detail(shoppingListId),
          });
        },
      )
      .subscribe();

    return () => {
      supabase!.removeChannel(channel);
    };
  }, [shoppingListId, queryClient]);
};
