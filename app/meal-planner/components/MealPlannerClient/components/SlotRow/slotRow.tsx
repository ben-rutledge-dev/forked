'use client';

import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useTranslations } from 'next-intl';
// Data
import type { MealPlanEntry, MealPlanSlot } from '@/data/meal-plans/[mealPlanId]/types';
// App
import { EntryCard } from '@/app/meal-planner/components/MealPlannerClient/components/EntryCard';

type SlotRowProps = {
  slot: MealPlanSlot
  date: string
  entries: MealPlanEntry[]
  canEditSlots: boolean
  canEditEntries: boolean
  isHighlighted: boolean
  overEntryId: string | null
  overEntrySide: 'before' | 'after' | null
  onAddRecipe: (slotId: string, slotLabel: string) => void
  onRemoveEntry: (entryId: string) => void
};

export const SlotRow: React.FC<SlotRowProps> = (props) => {
  const {
    slot,
    date,
    entries,
    canEditSlots,
    canEditEntries,
    isHighlighted,
    overEntryId,
    overEntrySide,
    onAddRecipe,
    onRemoveEntry,
  } = props;
  const t = useTranslations('mealPlanner');
  const draggable = canEditSlots && !slot.isDefault;
  const { attributes, listeners, setNodeRef: setSortableRef, transform, transition, isDragging } = useSortable({
    id: `slot-${slot.id}`,
    data: { type: 'slot', slotId: slot.id },
    disabled: { draggable: !draggable, droppable: false },
  });
  const { setNodeRef: setDropRef } = useDroppable({
    id: `cell-${date}-${slot.id}`,
    data: { type: 'slot-cell', slotId: slot.id, date },
    disabled: !canEditEntries,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={(el) => {
        setSortableRef(el);
        setDropRef(el);
      }}
      style={style}
      className={`mb-2 rounded-lg transition-colors ${isHighlighted ? 'bg-primary-50 p-1 -m-1' : ''}`}
    >
      <p
        className={`text-xs font-semibold text-stone-400 uppercase tracking-wide mb-1 ${draggable ? 'cursor-grab active:cursor-grabbing' : ''}`}
        {...(draggable ? { ...attributes, ...listeners } : {})}
      >
        {slot.label}
      </p>
      <SortableContext
        items={[]}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-1">
          {entries.map(entry => (
            <EntryCard
              key={entry.id}
              entry={entry}
              canEdit={canEditEntries}
              showBarBefore={overEntryId === entry.id && overEntrySide === 'before'}
              showBarAfter={overEntryId === entry.id && overEntrySide === 'after'}
              onRemove={onRemoveEntry}
            />
          ))}
        </div>
      </SortableContext>
      {canEditEntries && (
        <button
          className="mt-1 text-xs text-stone-400 hover:text-primary-500 transition-colors"
          onClick={() => onAddRecipe(slot.id, slot.label)}
        >
          {t('addRecipe')}
        </button>
      )}
    </div>
  );
};
