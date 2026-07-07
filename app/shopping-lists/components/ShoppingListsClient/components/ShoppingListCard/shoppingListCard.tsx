'use client';

import { useSortable } from '@dnd-kit/sortable';
import { useTranslations } from 'next-intl';
// Data
import type { ShoppingListWithStats } from '@/data/shopping-lists/types';
// Components
import { UserBadge } from '@/components/UserBadge';

type ShoppingListCardProps = {
  list: ShoppingListWithStats
  dropSide?: 'before' | 'after' | null
  onOpen: () => void
};

export const ShoppingListCard: React.FC<ShoppingListCardProps> = (props) => {
  const { list, dropSide = null, onOpen } = props;
  const t = useTranslations('shoppingLists');
  // No transform/transition here — siblings stay put during drag; the drop-indicator
  // bar below is the only "where will this land" preview.
  const { attributes, listeners, setNodeRef, isDragging } = useSortable({ id: list.id });

  return (
    <div
      ref={setNodeRef}
      className={`relative touch-none cursor-grab active:cursor-grabbing ${isDragging ? 'opacity-25' : ''}`}
      {...attributes}
      {...listeners}
      aria-label={t('dragToReorder')}
    >
      {dropSide === 'before' && (
        <div className="absolute -left-2 inset-y-2 w-0.5 rounded-full bg-primary-400 z-10" />
      )}
      {dropSide === 'after' && (
        <div className="absolute -right-2 inset-y-2 w-0.5 rounded-full bg-primary-400 z-10" />
      )}
      <button
        className="w-full text-left rounded-xl squircle shadow-sm bg-white dark:bg-stone-800 px-5 py-4 hover:shadow-md transition-shadow cursor-pointer"
        onClick={onOpen}
      >
        <p className="font-medium text-stone-800 dark:text-stone-200">{list.title}</p>
        <p className="mt-1 text-xs text-stone-400 dark:text-stone-500">
          {t('stats', { items: list.uncheckedCount, members: list.memberCount })}
        </p>
        {list.role === 'OWNER' && (
          <UserBadge role={list.role} className="mt-2" />
        )}
      </button>
    </div>
  );
};
