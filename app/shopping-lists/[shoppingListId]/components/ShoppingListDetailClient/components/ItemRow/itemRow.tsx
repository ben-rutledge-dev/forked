'use client';

import { useSortable } from '@dnd-kit/sortable';
import { useTranslations } from 'next-intl';
import { useContext, useEffect, useRef, useState } from 'react';
// Data
import { usePutItem, useDeleteItem } from '@/data/shopping-lists/[shoppingListId]/items/[itemId]';
import type { ShoppingListItem } from '@/data/shopping-lists/[shoppingListId]/types';
// Components
import { Checkbox } from '@/components/Checkbox';
import { GripIcon, PlusIcon, XIcon } from '@/components/Icons';
// App
import { DragOverContext } from '@/app/shopping-lists/[shoppingListId]/components/ShoppingListDetailClient/components/DragOverContext';

type ItemRowProps = {
  item: ShoppingListItem
  shoppingListId: string
  shouldFocus: boolean
  onEnter: () => void
  onAddBelow: () => void
  onDeleteEmpty: () => void
};

const focusAtEnd = (el: HTMLElement) => {
  el.focus();
  const range = document.createRange();
  range.selectNodeContents(el);
  range.collapse(false);
  const sel = window.getSelection();
  sel?.removeAllRanges();
  sel?.addRange(range);
};

export const ItemRow: React.FC<ItemRowProps> = (props) => {
  const { item,
    shoppingListId,
    shouldFocus,
    onEnter,
    onAddBelow,
    onDeleteEmpty,
  } = props;
  const { attributes, listeners, setNodeRef, isDragging } = useSortable({
    id: item.id,
    data: { type: 'item', sectionId: item.sectionId },
  });
  const nameRef = useRef<HTMLSpanElement>(null);
  const checkTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const animTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { mutate: putItem } = usePutItem({ shoppingListId, itemId: item.id });
  const { mutate: deleteItem } = useDeleteItem({ shoppingListId, itemId: item.id });
  const t = useTranslations('shoppingList');

  const [pendingCheck, setPendingCheck] = useState(false);
  const [animatingOut, setAnimatingOut] = useState(false);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    return () => {
      if (checkTimerRef.current) clearTimeout(checkTimerRef.current);
      if (animTimerRef.current) clearTimeout(animTimerRef.current);
    };
  }, []);

  // Move the caret to this row when it becomes the focus target (e.g. a newly
  // created item). Runs after mount/commit, so the editable node always exists.
  useEffect(() => {
    if (shouldFocus && nameRef.current) focusAtEnd(nameRef.current);
  }, [shouldFocus]);

  const isChecked = item.checked || pendingCheck;

  const handleCheckChange = (checked: boolean) => {
    if (!checked) {
      if (checkTimerRef.current) clearTimeout(checkTimerRef.current);
      if (animTimerRef.current) clearTimeout(animTimerRef.current);
      setPendingCheck(false);
      setAnimatingOut(false);
      if (item.checked) putItem({ checked: false });
      return;
    }
    setPendingCheck(true);
    // A checked item is no longer editable — drop the caret out of it.
    nameRef.current?.blur();
    checkTimerRef.current = setTimeout(() => {
      setAnimatingOut(true);
      animTimerRef.current = setTimeout(() => {
        putItem({ checked: true });
      }, 350);
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onEnter();
      return;
    }
    if ((e.key === 'Backspace' || e.key === 'Delete') && !nameRef.current?.textContent?.trim()) {
      e.preventDefault();
      onDeleteEmpty();
      deleteItem();
    }
  };

  const handleBlur = () => {
    const name = nameRef.current?.textContent?.trim() ?? '';
    if (!name && !item.name) {
      deleteItem();
      return;
    }
    if (name && name !== item.name) putItem({ name });
    else if (!name && nameRef.current) nameRef.current.textContent = item.name;
  };

  const { overId, activeType: dragType, dropSide } = useContext(DragOverContext);
  const isDropTarget = !isDragging && dragType === 'item' && overId === item.id;

  return (
    <li
      ref={setNodeRef}
      data-item-id={item.id}
      className={`relative group${isDragging ? ' opacity-25 pointer-events-none' : ''}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {isDropTarget && dropSide === 'top' && (
        <div className="absolute top-0 inset-x-1 h-0.5 rounded-full bg-primary-400" />
      )}
      {isDropTarget && dropSide === 'bottom' && (
        <div className="absolute bottom-0 inset-x-1 h-0.5 rounded-full bg-primary-400" />
      )}
      {/* Gutter icons — outside overflow:hidden so they aren't clipped */}
      <div className={`absolute -left-8 inset-y-0 hidden sm:flex items-center gap-1 transition-opacity ${hovered ? 'opacity-100' : 'opacity-0'}`}>
        <button
          type="button"
          onClick={onAddBelow}
          className="text-stone-300 dark:text-stone-600 hover:text-stone-500 dark:hover:text-stone-400"
          aria-label={t('addItemBelow')}
        >
          <PlusIcon className="w-3 h-3" />
        </button>
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab touch-none text-stone-300 dark:text-stone-600 hover:text-stone-500 dark:hover:text-stone-400"
          aria-label={t('dragToReorder')}
        >
          <GripIcon className="w-3 h-3" />
        </button>
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateRows: animatingOut ? '0fr' : '1fr',
          opacity: animatingOut ? 0 : 1,
          transition: 'grid-template-rows 350ms ease, opacity 350ms ease',
        }}
      >
        <div style={{ overflow: 'hidden' }}>
          <div
            className={`flex items-center gap-2 py-1.5 ${isChecked ? '' : 'cursor-text'}`}
            onClick={(e) => {
              // Ignore clicks on the checkbox — only the text area focuses the row.
              if (isChecked || !nameRef.current) return;
              if ((e.target as HTMLElement).closest('label')) return;
              focusAtEnd(nameRef.current);
            }}
          >
            <Checkbox
              id={`item-${item.id}`}
              checked={isChecked}
              onChange={e => handleCheckChange(e.target.checked)}
            />
            <div className="flex-none">
              <span
                ref={nameRef}
                contentEditable={!isChecked}
                suppressContentEditableWarning
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                className={`inline-block min-w-[1ch] text-sm outline-none ${isChecked ? 'line-through text-stone-400 dark:text-stone-500' : 'text-stone-700 dark:text-stone-300'}`}
              >
                {item.name}
              </span>
              {item.recipeTitle && (
                <p className="text-xs text-stone-400 dark:text-stone-500 mt-0.5">{`from ${item.recipeTitle}`}</p>
              )}
            </div>
            <button
              type="button"
              className={`transition-opacity shrink-0 text-stone-400 dark:text-stone-500 hover:text-danger-500 ${hovered ? 'opacity-100' : 'opacity-0'}`}
              onClick={() => deleteItem()}
              aria-label={t('deleteItem')}
            >
              <XIcon className="w-3.5 h-3.5" />
            </button>
            <span className="flex-1" />
          </div>
        </div>
      </div>
    </li>
  );
};

type ItemRowGhostProps = {
  item: ShoppingListItem
};

export const ItemRowGhost: React.FC<ItemRowGhostProps> = (props) => {
  const { item } = props;
  return (
    <div className="flex items-center gap-2 py-1.5 px-2 bg-white dark:bg-stone-800 rounded-lg border border-stone-200 dark:border-stone-700 shadow-lg dark:shadow-stone-950/30 opacity-60 cursor-grabbing">
      <GripIcon className="w-3.5 h-3.5 text-stone-300 dark:text-stone-600 shrink-0" />
      <input type="checkbox" checked={item.checked} readOnly className="h-4 w-4 rounded border-stone-300 dark:border-stone-600 shrink-0" />
      <span className={`text-sm ${item.checked ? 'line-through text-stone-400 dark:text-stone-500' : 'text-stone-700 dark:text-stone-300'}`}>{item.name}</span>
    </div>
  );
};
