import {
  closestCenter,
  pointerWithin,
  type CollisionDetection,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { useCallback, useState } from 'react';
// Data
import type { MealPlanDetail, MealPlanEntry, MealPlanSlot } from '@/data/meal-plans/[mealPlanId]/types';
// Hooks
import { useDndSensors } from '@/hooks/useDndSensors';

export type SlotDropTarget
  = | { type: 'slot', slotId: string, side: 'left' | 'right' }
    | { type: 'start' }
    | { type: 'end' }
    | null;

type Params = {
  weekEntries: MealPlanEntry[]
  sortedSlots: MealPlanSlot[]
  optimisticPatch: (patch: (d: MealPlanDetail) => MealPlanDetail) => void
  reorderEntries: (args: { entries: { id: string, orderIndex: number }[] }) => void
  reorderSlots: (args: { slots: { id: string, orderIndex: number }[] }) => void
  patchEntry: (args: { entryId: string, slotId: string, date: string, orderIndex: number }) => void
};

export const usePlannerDnd = ({
  weekEntries,
  sortedSlots,
  optimisticPatch,
  reorderEntries,
  reorderSlots,
  patchEntry,
}: Params) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<'entry' | 'slot' | null>(null);
  const [overEntryId, setOverEntryId] = useState<string | null>(null);
  const [overEntrySide, setOverEntrySide] = useState<'before' | 'after' | null>(null);
  const [overSlotKey, setOverSlotKey] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<SlotDropTarget>(null);

  const sensors = useDndSensors({ activationConstraint: { distance: 5 } });

  // pointerWithin checks which droppable physically contains the cursor.
  // closestCenter uses overlay-center distances — but verticalListSortingStrategy
  // shifts entries' DOM rects downward during an active drag, so the strategy can
  // move a Tuesday entry's rect into Wednesday's row and closestCenter picks the
  // wrong day. pointerWithin is immune because it uses the raw pointer position.
  const collisionDetection: CollisionDetection = useCallback(
    (args) => {
      const within = pointerWithin(args);
      return within.length > 0 ? within : closestCenter(args);
    },
    [],
  );

  const activeEntry = activeType === 'entry'
    ? weekEntries.find(e => e.id === activeId) ?? null
    : null;
  const activeSlot = activeType === 'slot'
    ? sortedSlots.find(s => `slot-${s.id}` === activeId) ?? null
    : null;

  const resetDrag = () => {
    setActiveId(null);
    setActiveType(null);
    setDropTarget(null);
    setOverEntryId(null);
    setOverEntrySide(null);
    setOverSlotKey(null);
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
    setActiveType((event.active.data.current?.type as 'entry' | 'slot' | undefined) ?? null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    const activeType = active.data.current?.type;

    // ── Slot drag: update column drop-indicator bar ──
    if (activeType === 'slot') {
      const overType = over?.data.current?.type;
      if (overType === 'slot-start') {
        setDropTarget({ type: 'start' });
        return;
      }
      if (overType === 'slot-end') {
        setDropTarget({ type: 'end' });
        return;
      }
      if (!over || overType !== 'slot') {
        setDropTarget(null);
        return;
      }
      const srcIdx = sortedSlots.findIndex(s => `slot-${s.id}` === String(active.id));
      const ovIdx = sortedSlots.findIndex(s => `slot-${s.id}` === String(over.id));
      setDropTarget({
        type: 'slot',
        slotId: String(over.id).replace('slot-', ''),
        side: srcIdx < ovIdx ? 'right' : 'left',
      });
      return;
    }

    // ── Entry drag: update position bar + slot highlight ──
    if (activeType === 'entry') {
      if (!over) {
        setOverEntryId(null);
        setOverEntrySide(null);
        setOverSlotKey(null);
        return;
      }
      const overType = over.data.current?.type as string;
      const activeSlotId = active.data.current?.slotId as string;
      const activeDate = active.data.current?.date as string;
      const overSlotId = over.data.current?.slotId as string;
      const overDate = over.data.current?.date as string;

      const isSameSlotAndDay = overSlotId === activeSlotId && overDate === activeDate;

      if (overType === 'entry' && String(over.id) !== String(active.id)) {
        // Always show a position bar on the hovered entry.
        // For same-slot reorder: side depends on drag direction.
        // For cross-slot/day: always insert BEFORE the hovered entry (matches handleEntryDrop).
        const sorted = weekEntries
          .filter(e => e.slotId === overSlotId && e.date === overDate)
          .sort((a, b) => a.orderIndex - b.orderIndex);
        const srcI = sorted.findIndex(e => e.id === String(active.id));
        const ovI = sorted.findIndex(e => e.id === String(over.id));
        // srcI === -1 when dragging from a different slot; treat as "before"
        setOverEntryId(String(over.id));
        setOverEntrySide(srcI !== -1 && srcI < ovI ? 'after' : 'before');
        setOverSlotKey(!isSameSlotAndDay && overSlotId && overDate ? `${overDate}-${overSlotId}` : null);
      }
      else if (overType === 'slot-cell') {
        setOverSlotKey(!isSameSlotAndDay && overSlotId && overDate ? `${overDate}-${overSlotId}` : null);
        // Show bar after the last entry in the target slot (insert at end)
        const lastEntry = weekEntries
          .filter(e => e.slotId === overSlotId && e.date === overDate && e.id !== String(active.id))
          .sort((a, b) => a.orderIndex - b.orderIndex)
          .at(-1) ?? null;
        setOverEntryId(lastEntry?.id ?? null);
        setOverEntrySide(lastEntry ? 'after' : null);
      }
      else {
        setOverEntryId(null);
        setOverEntrySide(null);
        setOverSlotKey(null);
      }
    }
  };

  const handleSlotDrop = (activeId: string, overType: string, overId: string) => {
    const oldIdx = sortedSlots.findIndex(s => `slot-${s.id}` === activeId);
    if (oldIdx === -1) return;
    let newIdx: number;
    if (overType === 'slot-start') newIdx = 0;
    else if (overType === 'slot-end') newIdx = sortedSlots.length - 1;
    else newIdx = sortedSlots.findIndex(s => `slot-${s.id}` === overId);
    if (newIdx === -1) return;
    const reordered = arrayMove(sortedSlots, oldIdx, newIdx)
      .map((s, i) => ({ ...s, orderIndex: i }));
    optimisticPatch(d => ({ ...d, slots: reordered }));
    reorderSlots({ slots: reordered.map(s => ({ id: s.id, orderIndex: s.orderIndex })) });
  };

  const handleEntryDrop = (
    activeId: string,
    overId: string,
    activeData: Record<string, unknown>,
    overData: Record<string, unknown>,
  ) => {
    const activeSlotId = activeData.slotId as string;
    const activeDate = activeData.date as string;
    const overType = overData.type as string;
    const targetSlotId = overData.slotId as string;
    const targetDate = overData.date as string;

    const isSameSlotAndDay = activeSlotId === targetSlotId && activeDate === targetDate;

    if (isSameSlotAndDay && overType === 'entry') {
      // Same slot, same day: reorder within the slot
      const slotEntries = weekEntries
        .filter(e => e.slotId === activeSlotId && e.date === activeDate)
        .sort((a, b) => a.orderIndex - b.orderIndex);
      const oldIdx = slotEntries.findIndex(e => e.id === activeId);
      const newIdx = slotEntries.findIndex(e => e.id === overId);
      if (oldIdx === -1 || newIdx === -1) return;
      const reordered = arrayMove(slotEntries, oldIdx, newIdx)
        .map((e, i) => ({ ...e, orderIndex: i }));
      const byId = new Map(reordered.map(e => [e.id, e]));
      optimisticPatch(d => ({ ...d, entries: d.entries.map(e => byId.get(e.id) ?? e) }));
      reorderEntries({ entries: reordered.map(e => ({ id: e.id, orderIndex: e.orderIndex })) });
      return;
    }

    // Different slot or different day: move the entry
    const movedEntry = weekEntries.find(e => e.id === activeId);
    if (!movedEntry) return;

    const targetEntries = weekEntries
      .filter(e => e.slotId === targetSlotId && e.date === targetDate && e.id !== activeId)
      .sort((a, b) => a.orderIndex - b.orderIndex);

    const insertAt = overType === 'entry'
      ? Math.max(0, targetEntries.findIndex(e => e.id === overId))
      : targetEntries.length;

    const newTargetEntries = [
      ...targetEntries.slice(0, insertAt),
      { ...movedEntry, slotId: targetSlotId, date: targetDate },
      ...targetEntries.slice(insertAt),
    ].map((e, i) => ({ ...e, orderIndex: i }));

    const byId = new Map(newTargetEntries.map(e => [e.id, e]));
    optimisticPatch(d => ({
      ...d,
      entries: [
        ...d.entries.filter(e => !(e.slotId === targetSlotId && e.date === targetDate) && e.id !== activeId),
        ...newTargetEntries,
      ],
    }));

    const newOrderIndex = byId.get(activeId)?.orderIndex ?? insertAt;
    patchEntry({ entryId: activeId, slotId: targetSlotId, date: targetDate, orderIndex: newOrderIndex });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    resetDrag();
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const activeType = active.data.current?.type;
    const overType = over.data.current?.type;
    if (activeType === 'slot') {
      if (overType === 'slot' || overType === 'slot-start' || overType === 'slot-end') {
        handleSlotDrop(String(active.id), overType, String(over.id));
      }
    }
    else if (activeType === 'entry' && (overType === 'entry' || overType === 'slot-cell')) {
      handleEntryDrop(String(active.id), String(over.id), active.data.current ?? {}, over.data.current ?? {});
    }
  };

  return {
    sensors,
    collisionDetection,
    activeEntry,
    activeSlot,
    dropTarget,
    overEntryId,
    overEntrySide,
    overSlotKey,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    resetDrag,
  };
};
