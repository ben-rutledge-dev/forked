'use client';

import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useTranslations } from 'next-intl';
import { useContext, useRef, useState } from 'react';
// Data
import { usePostItems } from '@/data/shopping-lists/[shoppingListId]/items';
import { usePutSection, useDeleteSection } from '@/data/shopping-lists/[shoppingListId]/sections/[sectionId]';
import type { ShoppingListSection, ShoppingListItem } from '@/data/shopping-lists/[shoppingListId]/types';
// Hooks
import { useConfirm } from '@/hooks/useConfirm';
// App
// Context
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

  const [newItemName, setNewItemName] = useState('');
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(section.title);
  const newItemInputRef = useRef<HTMLInputElement>(null);

  const { mutate: postItems } = usePostItems({ shoppingListId });
  const { mutate: putSection } = usePutSection({ shoppingListId, sectionId: section.id });
  const { mutate: deleteSection } = useDeleteSection({ shoppingListId, sectionId: section.id });
  const { confirm } = useConfirm();
  const t = useTranslations('shoppingList');

  const focusAddInput = () => newItemInputRef.current?.focus();

  const handleAddItem = (e: React.SyntheticEvent) => {
    e.preventDefault();
    const name = newItemName.trim();
    if (!name) return;
    postItems({ items: [{ name, sectionId: section.id }] });
    setNewItemName('');
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

  // Unsorted section: only show header if it has items
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
        <div className="flex items-center gap-2 mb-2">
          {!isUnsorted && (
            <button
              {...attributes}
              {...listeners}
              className="cursor-grab touch-none text-stone-300 hover:text-stone-500 text-sm"
              aria-label={t('dragSection')}
            >
              ⠿
            </button>
          )}
          {isUnsorted
            ? <span className="text-sm font-semibold text-stone-400">{t('unsorted')}</span>
            : editingTitle
              ? (
                  <input
                    autoFocus
                    className="flex-1 text-sm font-semibold text-stone-600 outline-none border-b border-primary-400"
                    value={titleDraft}
                    onChange={e => setTitleDraft(e.target.value)}
                    onBlur={handleTitleBlur}
                    onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
                  />
                )
              : (
                  <button
                    className="flex-1 text-left text-sm font-semibold text-stone-600 hover:text-stone-800"
                    onClick={() => setEditingTitle(true)}
                  >
                    {section.title}
                  </button>
                )}
          {!isUnsorted && (
            <button
              className="text-xs text-stone-400 hover:text-danger-500 transition-colors"
              onClick={handleDeleteSection}
              aria-label={t('deleteSection')}
            >
              ✕
            </button>
          )}
        </div>
      )}

      <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
        <ul>
          {items.map(item => (
            <ItemRow
              key={item.id}
              item={item}
              shoppingListId={shoppingListId}
              onEnter={focusAddInput}
            />
          ))}
        </ul>
      </SortableContext>

      <form onSubmit={handleAddItem} className="mt-1">
        <input
          ref={newItemInputRef}
          className="w-full text-sm text-stone-500 placeholder-stone-300 outline-none py-1 border-b border-transparent focus:border-stone-200"
          placeholder={t('addItemPlaceholder')}
          value={newItemName}
          onChange={e => setNewItemName(e.target.value)}
        />
      </form>
    </div>
  );
};
