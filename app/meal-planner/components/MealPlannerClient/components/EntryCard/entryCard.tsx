'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
// Data
import type { MealPlanEntry } from '@/data/meal-plans/[mealPlanId]/types';

type Props = {
  entry: MealPlanEntry
  canEdit: boolean
  showBarBefore?: boolean
  showBarAfter?: boolean
  onRemove: (entryId: string) => void
};

export const EntryCard = ({ entry, canEdit, showBarBefore = false, showBarAfter = false, onRemove }: Props) => {
  const t = useTranslations('mealPlanner');
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: entry.id,
    data: { type: 'entry', slotId: entry.slotId, date: entry.date },
    disabled: !canEdit,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div className="relative">
      {showBarBefore && (
        <div className="absolute -top-px left-0 right-0 h-0.5 bg-primary-500 z-20 rounded-full" />
      )}
      <div
        ref={setNodeRef}
        style={style}
        className={`flex items-center gap-2 rounded-lg border border-stone-200 bg-white px-2 py-1.5 group select-none ${canEdit ? 'cursor-grab active:cursor-grabbing' : ''}`}
        {...attributes}
        {...listeners}
      >
        {entry.recipe?.coverImageUrl
          ? (
              <Image
                src={entry.recipe.coverImageUrl}
                alt={entry.recipe.title ?? ''}
                width={32}
                height={32}
                className="rounded object-cover h-8 w-8 flex-shrink-0"
              />
            )
          : (
              <div className="h-8 w-8 flex-shrink-0 rounded bg-stone-100" />
            )}
        <span className="text-xs font-medium text-stone-800 truncate flex-1 min-w-0">
          {entry.recipe?.title ?? '—'}
        </span>
        {canEdit && (
          <button
            className="flex-shrink-0 text-stone-300 hover:text-danger-500 transition-colors opacity-0 group-hover:opacity-100 text-xs"
            aria-label={t('removeEntry')}
            onClick={(e) => {
              e.stopPropagation();
              onRemove(entry.id);
            }}
          >
            ×
          </button>
        )}
      </div>
      {showBarAfter && (
        <div className="absolute -bottom-px left-0 right-0 h-0.5 bg-primary-500 z-20 rounded-full" />
      )}
    </div>
  );
};

export const EntryCardGhost = ({ entry }: { entry: MealPlanEntry }) => (
  <div className="flex items-center gap-2 rounded-lg border border-stone-300 bg-white px-2 py-1.5 shadow-lg opacity-80 cursor-grabbing">
    {entry.recipe?.coverImageUrl
      ? (
          <Image
            src={entry.recipe.coverImageUrl}
            alt={entry.recipe.title ?? ''}
            width={32}
            height={32}
            className="rounded object-cover h-8 w-8 flex-shrink-0"
          />
        )
      : (
          <div className="h-8 w-8 flex-shrink-0 rounded bg-stone-100" />
        )}
    <span className="text-xs font-medium text-stone-800 truncate">{entry.recipe?.title ?? '—'}</span>
  </div>
);
