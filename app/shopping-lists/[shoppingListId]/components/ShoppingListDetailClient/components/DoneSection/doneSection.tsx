'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
// Data
import { usePutItem } from '@/data/shopping-lists/[shoppingListId]/items/[itemId]';
import type { ShoppingListItem } from '@/data/shopping-lists/[shoppingListId]/types';
// Components
import { Checkbox } from '@/components/Checkbox';

type DoneSectionProps = {
  items: ShoppingListItem[]
  shoppingListId: string
  onClearDone: () => void
};

const DoneItem = ({ item, shoppingListId }: { item: ShoppingListItem, shoppingListId: string }) => {
  const { mutate: putItem } = usePutItem({ shoppingListId, itemId: item.id });
  return (
    <li className="py-1">
      <Checkbox
        id={`done-${item.id}`}
        checked
        onChange={() => putItem({ checked: false })}
        label={<span className="text-sm line-through text-stone-400 dark:text-stone-500">{item.name}</span>}
      />
    </li>
  );
};

export const DoneSection = ({ items, shoppingListId, onClearDone }: DoneSectionProps) => {
  const [expanded, setExpanded] = useState(false);
  const t = useTranslations('shoppingList');
  if (items.length === 0) return null;

  return (
    <div className="mt-8 border-t border-stone-200 dark:border-stone-700 pt-6">
      <div className="flex items-center justify-between mb-2">
        <button
          className="flex items-center gap-2 text-sm font-semibold text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
          onClick={() => setExpanded(e => !e)}
        >
          <span>{expanded ? '▾' : '▸'}</span>
          {t('done', { count: items.length })}
        </button>
        <button
          className="text-xs text-danger-500 hover:text-danger-700 transition-colors"
          onClick={onClearDone}
        >
          {t('clearDone')}
        </button>
      </div>
      {expanded && (
        <ul className="space-y-1">
          {items.map(item => (
            <DoneItem key={item.id} item={item} shoppingListId={shoppingListId} />
          ))}
        </ul>
      )}
    </div>
  );
};
