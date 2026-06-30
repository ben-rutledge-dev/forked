'use client';

import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  horizontalListSortingStrategy,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useTranslations } from 'next-intl';
// Data
import type { MealPlanEntry, MealPlanSlot } from '@/data/meal-plans/[mealPlanId]/types';
// Components
import { PlusIcon } from '@/components/Icons';
import { PlannerDayLabel } from '@/components/PlannerDayLabel';
// App
import { EntryCard } from '@/app/meal-planner/components/MealPlannerClient/components/EntryCard';
import { addDays, type SlotDropTarget } from '@/app/meal-planner/components/MealPlannerClient/mealPlannerClient';

// ─── Slot header (sortable for custom slots) ────────────────────────────────

type SlotHeaderProps = {
  slot: MealPlanSlot
  canEditSlots: boolean
  isOver: boolean
  dropSide: 'left' | 'right' | null
  onAddBefore: () => void
  onDelete: () => void
};

const SlotHeader = ({ slot, canEditSlots, isOver, dropSide, onAddBefore, onDelete }: SlotHeaderProps) => {
  const t = useTranslations('mealPlanner');
  const draggable = canEditSlots && !slot.isDefault;
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `slot-${slot.id}`,
    data: { type: 'slot' },
    disabled: { draggable: !draggable, droppable: false },
  });

  // The outer div is the grid item and holds the drop-indicator bar.
  // It intentionally has NO CSS transform so the bar stays at the true
  // grid-column position regardless of how dnd-kit reorders the items.
  // The transform is applied only to the inner content div so the visual
  // reorder animation still works.
  return (
    <div ref={setNodeRef} className="relative group/header border-b border-r border-stone-100 dark:border-stone-700 bg-stone-50 dark:bg-stone-900">
      {/* Drop indicator — in non-transformed outer div so it tracks the real column */}
      {isOver && dropSide && (
        <div className={`absolute top-0 bottom-0 w-0.5 bg-primary-500 z-20 ${dropSide === 'left' ? '-left-px' : '-right-px'}`} />
      )}

      {/* Insert-before affordance */}
      {canEditSlots && (
        <button
          className="absolute -left-2.5 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center h-5 w-5 rounded-full bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-600 text-stone-400 dark:text-stone-500 hover:text-primary-500 hover:border-primary-400 opacity-0 group-hover/header:opacity-100 transition-opacity"
          aria-label={t('addSlotBefore')}
          onClick={onAddBefore}
        >
          <PlusIcon className="w-2.5 h-2.5" />
        </button>
      )}

      {/* Inner content: transform lives here so the label animates during drag */}
      <div
        className="flex items-center gap-1 py-2 pr-2 pl-4"
        style={{
          transform: CSS.Transform.toString(transform),
          transition,
          opacity: isDragging ? 0.4 : 1,
        }}
      >
        <span
          className={`text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wide truncate ${draggable ? 'cursor-grab active:cursor-grabbing' : ''}`}
          {...(draggable ? { ...attributes, ...listeners } : {})}
        >
          {slot.label}
        </span>
        {canEditSlots && !slot.isDefault && (
          <button
            className="ml-auto shrink-0 text-stone-300 dark:text-stone-600 hover:text-danger-500 text-sm leading-none opacity-0 group-hover/header:opacity-100 transition-opacity"
            aria-label={t('deleteSlot')}
            onClick={onDelete}
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
};

// ─── Slot cell (one day × one slot) ─────────────────────────────────────────

type SlotCellProps = {
  date: string
  slot: MealPlanSlot
  entries: MealPlanEntry[]
  canEditEntries: boolean
  isHighlighted: boolean
  overEntryId: string | null
  overEntrySide: 'before' | 'after' | null
  onAddRecipe: (slotId: string, slotLabel: string, date: string) => void
  onRemoveEntry: (entryId: string) => void
};

const SlotCell = ({ date, slot, entries, canEditEntries, isHighlighted, overEntryId, overEntrySide, onAddRecipe, onRemoveEntry }: SlotCellProps) => {
  const t = useTranslations('mealPlanner');
  const sorted = [...entries].sort((a, b) => a.orderIndex - b.orderIndex);
  // Register the cell itself as a droppable so entries can be dropped into
  // empty slots or appended to the end of a non-empty slot.
  const { setNodeRef } = useDroppable({
    id: `cell-${date}-${slot.id}`,
    data: { type: 'slot-cell', slotId: slot.id, date },
    disabled: !canEditEntries,
  });

  return (
    <div ref={setNodeRef} className={`min-h-12 p-2 border-b border-r border-stone-100 dark:border-stone-700 transition-colors ${isHighlighted ? 'bg-primary-50 dark:bg-stone-600' : ''}`}>
      {/* items=[] prevents verticalListSortingStrategy from applying CSS transforms
          to other entries during drag. Those transforms shift entries' stored rects
          into adjacent day rows, causing collision detection to pick up the wrong
          day — breaking cross-day drops. Without transforms, rects stay accurate. */}
      <SortableContext items={[]} strategy={verticalListSortingStrategy}>
        <div className="space-y-1">
          {sorted.map(entry => (
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
          className={`mt-1 text-xs hover:text-primary-500 transition-colors ${isHighlighted ? 'text-stone-400 dark:text-stone-300' : 'text-stone-300 dark:text-stone-600'}`}
          onClick={() => onAddRecipe(slot.id, slot.label, date)}
        >
          {t('addRecipe')}
        </button>
      )}
    </div>
  );
};

// ─── Day-label header cell (also the "drop before first slot" zone) ─────────

const StartDropZone = ({ showDropBar }: { showDropBar: boolean }) => {
  const { setNodeRef } = useDroppable({ id: 'slot-start', data: { type: 'slot-start' } });
  return (
    <div ref={setNodeRef} className="relative p-2 border-b border-r border-stone-100 dark:border-stone-700 bg-stone-50 dark:bg-stone-900">
      {showDropBar && <div className="absolute top-0 bottom-0 right-0 w-0.5 bg-primary-500 z-20" />}
    </div>
  );
};

// ─── Trailing add-slot column (also the "drop at end" target) ───────────────

type AddSlotColumnProps = {
  showDropBar: boolean
  onAdd: () => void
};

const AddSlotColumn = ({ showDropBar, onAdd }: AddSlotColumnProps) => {
  const t = useTranslations('mealPlanner');
  const { setNodeRef } = useDroppable({ id: 'slot-end', data: { type: 'slot-end' } });

  return (
    <button
      ref={setNodeRef}
      className="relative grid place-items-center border-b border-r border-stone-100 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-stone-400 dark:text-stone-500 hover:text-primary-500 text-lg leading-none"
      aria-label={t('addSlot')}
      onClick={onAdd}
    >
      {showDropBar && <div className="absolute top-0 bottom-0 -left-px w-0.5 bg-primary-500 z-20" />}
      {t('addSlotIcon')}
    </button>
  );
};

// ─── Week grid ──────────────────────────────────────────────────────────────

type Props = {
  startDate: string
  slots: MealPlanSlot[]
  entries: MealPlanEntry[]
  canEditSlots: boolean
  canEditEntries: boolean
  dropTarget: SlotDropTarget
  overEntryId: string | null
  overEntrySide: 'before' | 'after' | null
  overSlotKey: string | null
  onAddRecipe: (slotId: string, slotLabel: string, date: string) => void
  onRemoveEntry: (entryId: string) => void
  onAddSlotAt: (index: number) => void
  onDeleteSlot: (slotId: string) => void
};

const todayStr = (): string => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const WeekGrid = ({
  startDate,
  slots,
  entries,
  canEditSlots,
  canEditEntries,
  dropTarget,
  overEntryId,
  overEntrySide,
  overSlotKey,
  onAddRecipe,
  onRemoveEntry,
  onAddSlotAt,
  onDeleteSlot,
}: Props) => {
  const today = todayStr();
  const dates = Array.from({ length: 7 }, (_, i) => addDays(startDate, i));

  // Columns: day label + one per slot + (when slots are editable) a trailing add column.
  const trailing = canEditSlots ? ' 3rem' : '';
  const gridTemplateColumns = `10rem repeat(${slots.length}, minmax(9rem, 1fr))${trailing}`;

  return (
    <div
      className="hidden md:grid border-t border-l border-stone-100 dark:border-stone-700 overflow-x-auto mb-6 bg-white dark:bg-stone-800 rounded-xl squircle shadow-sm overflow-hidden"
      style={{ gridTemplateColumns }}
    >
      {/* ── Header row ── */}
      <StartDropZone showDropBar={dropTarget?.type === 'start'} />
      <SortableContext items={slots.map(s => `slot-${s.id}`)} strategy={horizontalListSortingStrategy}>
        {slots.map((slot, i) => {
          const over = dropTarget?.type === 'slot' && dropTarget.slotId === slot.id;
          return (
            <SlotHeader
              key={slot.id}
              slot={slot}
              canEditSlots={canEditSlots}
              isOver={over}
              dropSide={over ? dropTarget.side : null}
              onAddBefore={() => onAddSlotAt(i)}
              onDelete={() => onDeleteSlot(slot.id)}
            />
          );
        })}
      </SortableContext>
      {canEditSlots && (
        <AddSlotColumn
          showDropBar={dropTarget?.type === 'end'}
          onAdd={() => onAddSlotAt(slots.length)}
        />
      )}

      {/* ── Day rows ── */}
      {dates.map(date => (
        <div key={date} className="contents">
          <div className={`p-2 border-b border-r border-stone-100 dark:border-stone-700 flex items-start pt-3 ${date === today ? 'bg-primary-50 dark:bg-stone-700' : 'bg-stone-50 dark:bg-stone-900'}`}>
            <PlannerDayLabel dateStr={date} isToday={date === today} />
          </div>
          {slots.map(slot => (
            <SlotCell
              key={`${date}-${slot.id}`}
              date={date}
              slot={slot}
              entries={entries.filter(e => e.date === date && e.slotId === slot.id)}
              canEditEntries={canEditEntries}
              isHighlighted={overSlotKey === `${date}-${slot.id}`}
              overEntryId={overEntryId}
              overEntrySide={overEntrySide}
              onAddRecipe={onAddRecipe}
              onRemoveEntry={onRemoveEntry}
            />
          ))}
          {canEditSlots && <div className="border-b border-r border-stone-100 dark:border-stone-700" />}
        </div>
      ))}
    </div>
  );
};
