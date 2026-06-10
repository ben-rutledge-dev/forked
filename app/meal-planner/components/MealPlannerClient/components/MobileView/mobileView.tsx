'use client';

import { useTranslations } from 'next-intl';
import { useRef, useState } from 'react';
// Data
import type { MealPlanEntry, MealPlanSlot } from '@/data/meal-plans/[mealPlanId]/types';
// App
import { DayColumn } from '@/app/meal-planner/components/MealPlannerClient/components/DayColumn';
import { addDays } from '@/app/meal-planner/components/MealPlannerClient/mealPlannerClient';

import { formatDateStrLabel } from '@/utils/dates';

const formatDate = formatDateStrLabel;

type Props = {
  startDate: string
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

export const MobileView = ({ startDate, slots, entries, canEditSlots, canEditEntries, overEntryId, overEntrySide, overSlotKey, onAddRecipe, onRemoveEntry, onAddSlot }: Props) => {
  const t = useTranslations('mealPlanner');
  const [dayIndex, setDayIndex] = useState(0);
  const dates = Array.from({ length: 7 }, (_, i) => addDays(startDate, i));
  const currentDate = dates[dayIndex];

  const touchStartX = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) < 40) return;
    if (dx < 0 && dayIndex < 6) setDayIndex(i => i + 1);
    if (dx > 0 && dayIndex > 0) setDayIndex(i => i - 1);
  };

  return (
    <div className="md:hidden">
      <div className="flex items-center justify-between mb-4">
        <button
          className="p-2 text-stone-400 hover:text-stone-600 disabled:opacity-30 transition-colors"
          disabled={dayIndex === 0}
          aria-label={t('prevDayLabel')}
          onClick={() => setDayIndex(i => i - 1)}
        >
          {t('prevDay')}
        </button>
        <p className="text-sm font-semibold text-stone-700">{formatDate(currentDate)}</p>
        <button
          className="p-2 text-stone-400 hover:text-stone-600 disabled:opacity-30 transition-colors"
          disabled={dayIndex === 6}
          aria-label={t('nextDayLabel')}
          onClick={() => setDayIndex(i => i + 1)}
        >
          {t('nextDay')}
        </button>
      </div>
      <div onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
        <DayColumn
          date={currentDate}
          slots={slots}
          entries={entries}
          canEditSlots={canEditSlots}
          canEditEntries={canEditEntries}
          overEntryId={overEntryId}
          overEntrySide={overEntrySide}
          overSlotKey={overSlotKey}
          onAddRecipe={onAddRecipe}
          onRemoveEntry={onRemoveEntry}
          onAddSlot={onAddSlot}
        />
      </div>
    </div>
  );
};
