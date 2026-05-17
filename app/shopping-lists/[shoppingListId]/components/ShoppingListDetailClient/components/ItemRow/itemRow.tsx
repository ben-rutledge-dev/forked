'use client';

import { useSortable } from '@dnd-kit/sortable';
import { useTranslations } from 'next-intl';
import { useContext, useRef } from 'react';
// Data
import { usePutItem } from '@/data/shopping-lists/[shoppingListId]/items/[itemId]';
import { useDeleteItem } from '@/data/shopping-lists/[shoppingListId]/items/[itemId]';
import type { ShoppingListItem } from '@/data/shopping-lists/[shoppingListId]/types';
// Components
import { Checkbox } from '@/components/Checkbox';
// App
import { DragOverContext } from '@/app/shopping-lists/[shoppingListId]/components/ShoppingListDetailClient/components/DragOverContext';

type ItemRowProps = {
  item: ShoppingListItem
  shoppingListId: string
  onEnter: () => void
};

export const ItemRow = ({ item, shoppingListId, onEnter }: ItemRowProps) => {
  const { attributes, listeners, setNodeRef, isDragging } = useSortable({
    id: item.id,
    data: { type: 'item', sectionId: item.sectionId },
  });
  const nameRef = useRef<HTMLSpanElement>(null);

  const { mutate: putItem } = usePutItem({ shoppingListId, itemId: item.id });
  const { mutate: deleteItem } = useDeleteItem({ shoppingListId, itemId: item.id });
  const t = useTranslations('shoppingList');

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onEnter();
    }
  };

  const handleBlur = () => {
    const name = nameRef.current?.textContent?.trim() ?? '';
    if (name && name !== item.name) putItem({ name });
    else if (!name && nameRef.current) nameRef.current.textContent = item.name;
  };

  const { overId, activeType: dragType, dropSide } = useContext(DragOverContext);
  const isDropTarget = !isDragging && dragType === 'item' && overId === item.id;

  return (
    <li ref={setNodeRef} className={`relative group flex flex-col${isDragging ? ' opacity-25 pointer-events-none' : ''}`}>
      {isDropTarget && dropSide === 'top' && (
        <div className="absolute top-0 inset-x-1 h-0.5 rounded-full bg-primary-400" />
      )}
      {isDropTarget && dropSide === 'bottom' && (
        <div className="absolute bottom-0 inset-x-1 h-0.5 rounded-full bg-primary-400" />
      )}
      <div className="flex items-start gap-2 py-1.5">
        <button
          {...attributes}
          {...listeners}
          className="mt-0.5 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 cursor-grab touch-none text-stone-300 hover:text-stone-500 transition-opacity text-sm px-0.5 shrink-0"
          aria-label={t('dragToReorder')}
        >
          ⠿
        </button>
        <Checkbox
          id={`item-${item.id}`}
          checked={item.checked}
          onChange={e => putItem({ checked: e.target.checked })}
          className="mt-0.5"
        />
        <div className="flex-1 min-w-0">
          <span
            ref={nameRef}
            contentEditable
            suppressContentEditableWarning
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className={`block text-sm outline-none ${item.checked ? 'line-through text-stone-400' : 'text-stone-700'}`}
          >
            {item.name}
          </span>
          {item.recipeTitle && (
            <p className="text-xs text-stone-400 mt-0.5">{`from ${item.recipeTitle}`}</p>
          )}
        </div>
        <button
          className="opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 text-stone-400 hover:text-danger-500 transition-opacity text-xs px-1"
          onClick={() => deleteItem()}
          aria-label={t('deleteItem')}
        >
          ✕
        </button>
      </div>
    </li>
  );
};

export const ItemRowGhost = ({ item }: { item: ShoppingListItem }) => (
  <div className="flex items-center gap-2 py-1.5 px-2 bg-white rounded-lg border border-stone-200 shadow-lg opacity-60 cursor-grabbing">
    <span className="text-stone-300 text-sm shrink-0">⠿</span>
    <input type="checkbox" checked={item.checked} readOnly className="h-4 w-4 rounded border-stone-300 shrink-0" />
    <span className={`text-sm ${item.checked ? 'line-through text-stone-400' : 'text-stone-700'}`}>{item.name}</span>
  </div>
);
