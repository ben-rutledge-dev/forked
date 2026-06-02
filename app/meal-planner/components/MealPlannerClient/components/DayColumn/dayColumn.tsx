'use client';

import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useTranslations } from 'next-intl';
// Data
import type { MealPlanEntry, MealPlanSlot } from '@/data/meal-plans/[mealPlanId]/types';
// App
import { SlotRow } from '@/app/meal-planner/components/MealPlannerClient/components/SlotRow';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const formatDate = (dateStr: string) => {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return `${DAY_NAMES[date.getUTCDay()]} ${d} ${MONTH_NAMES[date.getUTCMonth()]}`;
};

type Props = {
  date: string
  slots: MealPlanSlot[]
  entries: MealPlanEntry[]
  canEditSlots: boolean
  canEditEntries: boolean
  overEntryId: string | null
  overEntrySide: 'before' | 'after' | null
  overSlotKey: string | null
  onAddRecipe: (slotId: string, slotLabel: string, date: string) => void
  onRemoveEntry: (entryId: string) => void
  onAddSlot: () => void
};

export const DayColumn = ({ date, slots, entries, canEditSlots, canEditEntries, overEntryId, overEntrySide, overSlotKey, onAddRecipe, onRemoveEntry, onAddSlot }: Props) => {
  const t = useTranslations('mealPlanner');

  const entriesForDate = entries.filter(e => e.date === date);

  return (
    <div className="min-w-0 flex flex-col">
      <div className="mb-3">
        <p className="text-xs font-semibold text-stone-500">{formatDate(date)}</p>
      </div>

      <SortableContext
        items={slots.map(s => `slot-${s.id}`)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex-1 space-y-3">
          {slots.map(slot => (
            <SlotRow
              key={slot.id}
              slot={slot}
              date={date}
              entries={entriesForDate.filter(e => e.slotId === slot.id).sort((a, b) => a.orderIndex - b.orderIndex)}
              canEditSlots={canEditSlots}
              canEditEntries={canEditEntries}
              isHighlighted={overSlotKey === `${date}-${slot.id}`}
              overEntryId={overEntryId}
              overEntrySide={overEntrySide}
              onAddRecipe={(slotId, slotLabel) => onAddRecipe(slotId, slotLabel, date)}
              onRemoveEntry={onRemoveEntry}
            />
          ))}
        </div>
      </SortableContext>

      {canEditSlots && (
        <button
          className="mt-2 text-xs text-stone-300 hover:text-stone-500 transition-colors text-left"
          onClick={onAddSlot}
        >
          {t('addSlot')}
        </button>
      )}
    </div>
  );
};
