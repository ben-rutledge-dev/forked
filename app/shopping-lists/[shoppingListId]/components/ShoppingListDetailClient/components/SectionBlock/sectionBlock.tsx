'use client';

import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useTranslations } from 'next-intl';
import { useContext, useState } from 'react';
// Data
import { queryKeys } from '@/data/queryKeys';
import { useQueryClient } from '@/data/shared/hooks';
import { usePostItems, usePutItemsReorder } from '@/data/shopping-lists/[shoppingListId]/items';
import { usePutSection, useDeleteSection } from '@/data/shopping-lists/[shoppingListId]/sections/[sectionId]';
import type { ShoppingListSection, ShoppingListItem, ShoppingListDetail } from '@/data/shopping-lists/[shoppingListId]/types';
// Hooks
import { useConfirm } from '@/hooks/useConfirm';
// Components
import { GripIcon, XIcon } from '@/components/Icons';
// App
import { DragOverContext } from '@/app/shopping-lists/[shoppingListId]/components/ShoppingListDetailClient/components/DragOverContext';
import { ItemRow } from '@/app/shopping-lists/[shoppingListId]/components/ShoppingListDetailClient/components/ItemRow';

type SectionBlockProps = {
  section: ShoppingListSection
  items: ShoppingListItem[]
  isUnsorted: boolean
  shoppingListId: string
};

export const SectionBlock = ({ section, items, isUnsorted, shoppingListId }: SectionBlockProps) => {
  const { attributes, listeners, setNodeRef, isDragging } = useSortable({
    id: section.id,
    data: { type: 'section' },
    disabled: isUnsorted,
  });

  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(section.title);
  // Id of the item whose editable name should hold the caret. The matching
  // ItemRow focuses itself in an effect once mounted (see ItemRow).
  const [focusItemId, setFocusItemId] = useState<string | null>(null);

  const queryClient = useQueryClient();
  const { mutate: postItems } = usePostItems({ shoppingListId });
  const { mutate: reorderItems } = usePutItemsReorder({ shoppingListId });
  const { mutate: putSection } = usePutSection({ shoppingListId, sectionId: section.id });
  const { mutate: deleteSection } = useDeleteSection({ shoppingListId, sectionId: section.id });
  const { confirm } = useConfirm();
  const t = useTranslations('shoppingList');

  const listQueryKey = queryKeys.shoppingLists.detail(shoppingListId);

  const addItemBelow = (afterItemId: string) => {
    const tempId = `__temp__${crypto.randomUUID()}`;
    const afterIdx = items.findIndex(i => i.id === afterItemId);
    const now = new Date().toISOString();

    queryClient.setQueryData<ShoppingListDetail>(listQueryKey, (old) => {
      if (!old) return old;
      return {
        ...old,
        sections: old.sections.map((s) => {
          if (s.id !== section.id) return s;
          const idx = s.items.findIndex(i => i.id === afterItemId);
          const tempItem: ShoppingListItem = {
            id: tempId,
            name: '',
            checked: false,
            sectionId: section.id,
            shoppingListId,
            orderIndex: idx + 0.5,
            recipeId: null,
            recipeTitle: null,
            createdAt: now,
            updatedAt: now,
          };
          const newItems = [...s.items];
          newItems.splice(idx + 1, 0, tempItem);
          return { ...s, items: newItems };
        }),
      };
    });
    setFocusItemId(tempId);

    postItems(
      { items: [{ name: '', sectionId: section.id }] },
      {
        onSuccess: (newItems) => {
          const realId = newItems[0].id;
          queryClient.setQueryData<ShoppingListDetail>(listQueryKey, (old) => {
            if (!old) return old;
            return {
              ...old,
              sections: old.sections.map(s => ({
                ...s,
                items: s.items.map(i => i.id === tempId ? { ...i, id: realId } : i),
              })),
            };
          });
          setFocusItemId(realId);
          const allIds = [...items.map(i => i.id)];
          allIds.splice(afterIdx + 1, 0, realId);
          reorderItems({ items: allIds.map((id, orderIndex) => ({ id, orderIndex })) });
        },
        onError: () => {
          queryClient.setQueryData<ShoppingListDetail>(listQueryKey, (old) => {
            if (!old) return old;
            return {
              ...old,
              sections: old.sections.map(s => ({
                ...s,
                items: s.items.filter(i => i.id !== tempId),
              })),
            };
          });
        },
      },
    );
  };

  const handleTitleBlur = () => {
    setEditingTitle(false);
    if (titleDraft.trim() && titleDraft.trim() !== section.title) {
      putSection({ title: titleDraft.trim() });
    }
    else {
      setTitleDraft(section.title);
    }
  };

  const handleDeleteSection = async () => {
    if (!await confirm('Delete this section and all its items?', { confirmLabel: 'Delete' })) return;
    deleteSection();
  };

  const { overId, activeType: dragType, dropSide } = useContext(DragOverContext);
  const isSectionDropTarget = !isDragging && dragType === 'section' && overId === section.id;

  const showHeader = !isUnsorted || items.length > 0;

  return (
    <div ref={setNodeRef} className={`relative mb-6${isDragging ? ' opacity-25 pointer-events-none' : ''}`}>
      {isSectionDropTarget && dropSide === 'top' && (
        <div className="absolute top-0 inset-x-1 h-0.5 rounded-full bg-primary-400" />
      )}
      {isSectionDropTarget && dropSide === 'bottom' && (
        <div className="absolute bottom-0 inset-x-1 h-0.5 rounded-full bg-primary-400" />
      )}
      {showHeader && (
        <div className="group relative flex items-center gap-2 mb-2">
          {!isUnsorted && (
            <button
              {...attributes}
              {...listeners}
              className="absolute -left-4 hidden sm:flex cursor-grab touch-none text-stone-300 dark:text-stone-600 hover:text-stone-500 dark:hover:text-stone-400 opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label={t('dragSection')}
            >
              <GripIcon className="w-3 h-3" />
            </button>
          )}
          {isUnsorted && (
            <span className="text-sm font-semibold text-stone-400 dark:text-stone-500">{t('unsorted')}</span>
          )}
          {!isUnsorted && editingTitle && (
            <input
              autoFocus
              className="flex-1 text-sm font-semibold text-stone-600 dark:text-stone-400 outline-none border-b border-primary-400 bg-transparent"
              value={titleDraft}
              onChange={e => setTitleDraft(e.target.value)}
              onBlur={handleTitleBlur}
              onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
            />
          )}
          {!isUnsorted && !editingTitle && (
            <button
              className="flex-1 text-left text-sm font-semibold text-stone-600 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200"
              onClick={() => setEditingTitle(true)}
            >
              {section.title}
            </button>
          )}
          {!isUnsorted && (
            <button
              className="opacity-0 group-hover:opacity-100 text-stone-400 dark:text-stone-500 hover:text-danger-500 transition-opacity"
              onClick={handleDeleteSection}
              aria-label={t('deleteSection')}
            >
              <XIcon className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
        <ul>
          {items.map((item, index) => (
            <ItemRow
              key={item.id}
              item={item}
              shoppingListId={shoppingListId}
              shouldFocus={item.id === focusItemId}
              onEnter={() => addItemBelow(item.id)}
              onAddBelow={() => addItemBelow(item.id)}
              onDeleteEmpty={() => {
                const prev = items[index - 1];
                if (prev) setFocusItemId(prev.id);
              }}
            />
          ))}
        </ul>
      </SortableContext>
    </div>
  );
};
