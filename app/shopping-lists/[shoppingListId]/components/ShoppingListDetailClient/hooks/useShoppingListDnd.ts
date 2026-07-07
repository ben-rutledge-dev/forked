import type {
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { useState } from 'react';
// Data
import type { ShoppingListItem, ShoppingListSection } from '@/data/shopping-lists/[shoppingListId]/types';
// Hooks
import { useDndSensors } from '@/hooks/useDndSensors';

type Params = {
  sections: ShoppingListSection[]
  reorderSections: (args: { sections: { id: string, orderIndex: number }[] }) => void
  reorderItems: (args: { items: { id: string, orderIndex: number }[] }) => void
  moveItemSection: (args: { itemId: string, sectionId: string }) => Promise<unknown>
  onMoveItemSectionError: () => void
};

export const useShoppingListDnd = ({
  sections,
  reorderSections,
  reorderItems,
  moveItemSection,
  onMoveItemSectionError,
}: Params) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<'section' | 'item' | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [dropSide, setDropSide] = useState<'top' | 'bottom' | null>(null);

  // dragSections carries optimistic item order during an active drag
  const [dragSections, setDragSections] = useState<ShoppingListSection[]>(sections);

  const sensors = useDndSensors();

  const localSections = activeId ? dragSections : sections;

  const activeItem = activeType === 'item'
    ? localSections.flatMap(s => s.items).find(i => i.id === activeId) ?? null
    : null;
  const activeSection = activeType === 'section'
    ? localSections.find(s => s.id === activeId) ?? null
    : null;

  const resetDragState = () => {
    setActiveId(null);
    setActiveType(null);
    setOverId(null);
    setDropSide(null);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const id = String(event.active.id);
    // Snapshot current server-derived state as the drag baseline
    setDragSections(sections);
    setActiveId(id);
    setActiveType((event.active.data.current?.type as 'section' | 'item') ?? null);
    setOverId(null);
    setDropSide(null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) {
      setOverId(null);
      setDropSide(null);
      return;
    }
    setOverId(String(over.id));

    const activeData = active.data.current;
    const overData = over.data.current;

    if (activeData?.type === 'item' && overData?.type === 'item') {
      const activeSectionId = activeData.sectionId as string;
      const overSectionId = overData.sectionId as string;
      if (activeSectionId === overSectionId) {
        // Same section: arrayMove places item AT the over index, so dragging down → bar at bottom
        const section = localSections.find(s => s.id === activeSectionId);
        if (section) {
          const srcIdx = section.items.findIndex(i => i.id === String(active.id));
          const ovIdx = section.items.findIndex(i => i.id === String(over.id));
          setDropSide(srcIdx < ovIdx ? 'bottom' : 'top');
        }
      }
      else {
        // Cross-section: splice inserts before the over item → always top
        setDropSide('top');
      }
    }
    else if (activeData?.type === 'section' && overData?.type === 'section') {
      const srcIdx = localSections.findIndex(s => s.id === String(active.id));
      const ovIdx = localSections.findIndex(s => s.id === String(over.id));
      setDropSide(srcIdx < ovIdx ? 'bottom' : 'top');
    }
    else {
      setDropSide(null);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    resetDragState();
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    if (activeData?.type === 'section') {
      // Section reorder — only between named (non-unsorted) sections
      if (overData?.type !== 'section') return;
      const namedSections = localSections.slice(1);
      const unsortedSection = localSections[0];
      const oldIdx = namedSections.findIndex(s => s.id === String(active.id));
      const newIdx = namedSections.findIndex(s => s.id === String(over.id));
      if (oldIdx === -1 || newIdx === -1) return;
      const reordered = arrayMove(namedSections, oldIdx, newIdx);
      setDragSections([unsortedSection, ...reordered]);
      reorderSections({
        sections: [unsortedSection, ...reordered].map((s, i) => ({ id: s.id, orderIndex: i })),
      });
      return;
    }

    if (activeData?.type === 'item') {
      const sourceSectionId = activeData.sectionId as string;

      // Determine target section and insertion point
      let targetSectionId: string;
      let overItemId: string | null = null;

      if (overData?.type === 'section') {
        targetSectionId = String(over.id);
      }
      else if (overData?.type === 'item') {
        targetSectionId = overData.sectionId as string;
        overItemId = String(over.id);
      }
      else {
        return;
      }

      const sourceSectionIdx = localSections.findIndex(s => s.id === sourceSectionId);
      const targetSectionIdx = localSections.findIndex(s => s.id === targetSectionId);
      if (sourceSectionIdx === -1 || targetSectionIdx === -1) return;

      const sourceSection = localSections[sourceSectionIdx];
      const targetSection = localSections[targetSectionIdx];
      const draggedItem = sourceSection.items.find(i => i.id === active.id);
      if (!draggedItem) return;

      if (sourceSectionIdx === targetSectionIdx) {
        // Same section — reorder
        if (!overItemId) return;
        const oldItemIdx = sourceSection.items.findIndex(i => i.id === active.id);
        const newItemIdx = targetSection.items.findIndex(i => i.id === overItemId);
        if (oldItemIdx === -1 || newItemIdx === -1) return;
        const reorderedItems = arrayMove(sourceSection.items, oldItemIdx, newItemIdx);
        setDragSections(prev => prev.map((s, idx) =>
          idx === sourceSectionIdx ? { ...s, items: reorderedItems } : s,
        ));
        reorderItems({ items: reorderedItems.map((item, i) => ({ id: item.id, orderIndex: i })) });
      }
      else {
        // Cross-section move
        const updatedItem = { ...draggedItem, sectionId: targetSectionId };
        const newSourceItems = sourceSection.items.filter(i => i.id !== active.id);
        let newTargetItems: ShoppingListItem[];
        if (overItemId) {
          const overIdx = targetSection.items.findIndex(i => i.id === overItemId);
          newTargetItems = [...targetSection.items];
          newTargetItems.splice(overIdx >= 0 ? overIdx : newTargetItems.length, 0, updatedItem);
        }
        else {
          newTargetItems = [...targetSection.items, updatedItem];
        }
        setDragSections(prev => prev.map((s, idx) => {
          if (idx === sourceSectionIdx) return { ...s, items: newSourceItems };
          if (idx === targetSectionIdx) return { ...s, items: newTargetItems };
          return s;
        }));
        moveItemSection({ itemId: String(active.id), sectionId: targetSectionId }).catch(onMoveItemSectionError);
        reorderItems({ items: newTargetItems.map((item, i) => ({ id: item.id, orderIndex: i })) });
      }
    }
  };

  return {
    sensors,
    localSections,
    activeId,
    activeType,
    activeItem,
    activeSection,
    overId,
    dropSide,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    resetDragState,
  };
};
