import type { DragEndEvent, DragOverEvent, DragStartEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { useState } from 'react';
// Hooks
import { useDndSensors } from '@/hooks/useDndSensors';

type Params<T> = {
  items: T[]
  getId: (item: T) => string
  onReorder: (reordered: T[]) => void
};

export const useSortableListDnd = <T>({ items, getId, onReorder }: Params<T>) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  // 'before'/'after' the over item — arrayMove's actual landing spot, so the
  // drop indicator matches where the item will really end up.
  const [dropSide, setDropSide] = useState<'before' | 'after' | null>(null);
  // Cards here are the whole draggable surface (no separate grip handle), so a
  // pointer-move threshold is required to tell a drag from a click/link inside the card.
  const sensors = useDndSensors({ activationConstraint: { distance: 8 } });

  const activeItem = activeId ? items.find(item => getId(item) === activeId) ?? null : null;

  const resetDrag = () => {
    setActiveId(null);
    setOverId(null);
    setDropSide(null);
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
    setOverId(null);
    setDropSide(null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over || over.id === active.id) {
      setOverId(null);
      setDropSide(null);
      return;
    }
    setOverId(String(over.id));
    const srcIdx = items.findIndex(item => getId(item) === String(active.id));
    const ovIdx = items.findIndex(item => getId(item) === String(over.id));
    setDropSide(srcIdx < ovIdx ? 'after' : 'before');
  };

  const handleDragEnd = (event: DragEndEvent) => {
    resetDrag();
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIdx = items.findIndex(item => getId(item) === String(active.id));
    const newIdx = items.findIndex(item => getId(item) === String(over.id));
    if (oldIdx === -1 || newIdx === -1) return;

    onReorder(arrayMove(items, oldIdx, newIdx));
  };

  return {
    sensors,
    activeId,
    activeItem,
    overId,
    dropSide,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    resetDrag,
  };
};
