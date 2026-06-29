'use client';

import { useRef, useState } from 'react';
// Data
import type { MealPlanEntry, MealPlanSlot } from '@/data/meal-plans/[mealPlanId]/types';
// App
import { DayColumn } from '@/app/meal-planner/components/MealPlannerClient/components/DayColumn';
import { addDays } from '@/app/meal-planner/components/MealPlannerClient/mealPlannerClient';

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
    <div className="md:hidden bg-white rounded-xl squircle shadow-sm p-4">
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
