'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
// Data
import type { MealPlanEntry } from '@/data/meal-plans/[mealPlanId]/types';
// Components
import { GripIcon } from '@/components/Icons';

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
        className="flex items-center gap-1.5 rounded-lg squircle shadow-sm bg-white px-1.5 py-1.5 group select-none hover:shadow-md transition-shadow"
      >
        {canEdit && (
          <button
            {...attributes}
            {...listeners}
            className="shrink-0 touch-none cursor-grab active:cursor-grabbing text-stone-300 hover:text-stone-400 transition-colors p-0.5"
            tabIndex={-1}
          >
            <GripIcon className="w-2.5 h-3.5" />
          </button>
        )}

        {entry.recipe?.id
          ? (
              <Link
                href={`/recipes/${entry.recipe.id}`}
                className="flex items-center gap-2 flex-1 min-w-0 cursor-pointer"
              >
                <RecipeImage entry={entry} />
                <span className="text-xs font-medium text-stone-800 truncate min-w-0">
                  {entry.recipe.title}
                </span>
              </Link>
            )
          : (
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <RecipeImage entry={entry} />
                <span className="text-xs font-medium text-stone-800 truncate min-w-0">—</span>
              </div>
            )}

        {canEdit && (
          <button
            className="shrink-0 cursor-pointer text-stone-300 hover:text-danger-500 transition-colors opacity-0 group-hover:opacity-100 text-base leading-none p-0.5"
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

const RecipeImage = ({ entry }: { entry: MealPlanEntry }) => (
  entry.recipe?.coverImageUrl
    ? (
        <Image
          src={entry.recipe.coverImageUrl}
          alt={entry.recipe.title ?? ''}
          width={32}
          height={32}
          className="rounded object-cover h-8 w-8 shrink-0"
        />
      )
    : <div className="h-8 w-8 shrink-0 rounded bg-stone-100" />
);

export const EntryCardGhost = ({ entry }: { entry: MealPlanEntry }) => (
  <div className="flex items-center gap-1.5 rounded-lg squircle shadow-lg bg-white px-1.5 py-1.5 opacity-80 cursor-grabbing">
    <div className="shrink-0 p-0.5">
      <GripIcon className="w-2.5 h-3.5 text-stone-300" />
    </div>
    {entry.recipe?.coverImageUrl
      ? (
          <Image
            src={entry.recipe.coverImageUrl}
            alt={entry.recipe.title ?? ''}
            width={32}
            height={32}
            className="rounded object-cover h-8 w-8 shrink-0"
          />
        )
      : (
          <div className="h-8 w-8 shrink-0 rounded bg-stone-100" />
        )}
    <span className="text-xs font-medium text-stone-800 truncate">{entry.recipe?.title ?? '—'}</span>
  </div>
);
