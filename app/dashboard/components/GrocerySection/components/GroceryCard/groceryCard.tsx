'use client';

import { useSyncExternalStore } from 'react';
// Data
import type { Suggestion } from '@/data/dashboard/suggestions/types';
import type { ShoppingListWithStats } from '@/data/shopping-lists/types';
// Components
import { ShoppingListsSection } from './components/ShoppingListsSection';
import { SuggestionsSection } from './components/SuggestionsSection';

const LS_KEY = 'forked:last-list-id';

const subscribeListSelection = (cb: () => void) => {
  globalThis.addEventListener('storage', cb);
  return () => globalThis.removeEventListener('storage', cb);
};
const readStoredListId = () => localStorage.getItem(LS_KEY);
const serverStoredListId = () => null;

type Props = {
  suggestions: Suggestion[] | null
  shoppingLists: ShoppingListWithStats[]
  isPremium: boolean
  hasMealPlan: boolean
  userId: string
};

export const GroceryCard = ({
  suggestions,
  shoppingLists,
  isPremium,
  hasMealPlan,
  userId,
}: Props) => {
  const storedListId = useSyncExternalStore(subscribeListSelection, readStoredListId, serverStoredListId);
  const selectedListId = (storedListId && shoppingLists.some(l => l.id === storedListId))
    ? storedListId
    : (shoppingLists[0]?.id ?? null);

  const handleSelectList = (id: string) => {
    localStorage.setItem(LS_KEY, id);
    globalThis.dispatchEvent(new StorageEvent('storage'));
  };

  const selectedListName = shoppingLists.find(l => l.id === selectedListId)?.title ?? null;
  const showSuggestions = isPremium && suggestions !== null && hasMealPlan;

  const suggestionsContent = (() => {
    if (!isPremium || suggestions === null) return null;
    if (!hasMealPlan) return null;
    return (
      <SuggestionsSection
        suggestions={suggestions}
        userId={userId}
        selectedListId={selectedListId}
        selectedListName={selectedListName}
      />
    );
  })();

  return (
    <div className="mt-4 rounded-xl squircle shadow-sm bg-white p-5">
      <div className="flex flex-col sm:flex-row sm:items-stretch gap-6 sm:gap-0">
        <div className="flex-1 min-w-0 sm:pr-6 flex flex-col">
          {suggestionsContent}
        </div>
        <div className="h-px sm:h-auto sm:w-px bg-stone-200 shrink-0" />
        <div className="sm:w-72 sm:shrink-0 sm:pl-6">
          <ShoppingListsSection
            lists={shoppingLists}
            compact
            selectedListId={showSuggestions ? selectedListId : null}
            onSelectList={showSuggestions ? handleSelectList : undefined}
          />
        </div>
      </div>
    </div>
  );
};
