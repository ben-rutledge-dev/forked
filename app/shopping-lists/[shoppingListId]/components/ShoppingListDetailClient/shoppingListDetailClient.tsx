'use client';

import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
// Data
import { queryKeys } from '@/data/queryKeys';
import { useQueryClient } from '@/data/shared/hooks';
import { useShoppingList, usePutShoppingList, useDeleteShoppingList } from '@/data/shopping-lists/[shoppingListId]';
import { usePostShoppingListInvite } from '@/data/shopping-lists/[shoppingListId]/invites';
import { useDeleteCheckedItems, usePutItemSection, usePutItemsReorder } from '@/data/shopping-lists/[shoppingListId]/items';
import { useDeleteShoppingListMember } from '@/data/shopping-lists/[shoppingListId]/members/[memberId]';
import { usePostSection, usePutSectionReorder } from '@/data/shopping-lists/[shoppingListId]/sections';
import type { ShoppingListItem } from '@/data/shopping-lists/[shoppingListId]/types';
// Hooks
import { useConfirm } from '@/hooks/useConfirm';
import { useModal } from '@/hooks/useModal';
import { useShoppingListRealtime } from '@/hooks/useShoppingListRealtime';
// Components
import { DoneSection } from './components/DoneSection';
import { DragOverContext } from './components/DragOverContext';
import { ItemRowGhost } from './components/ItemRow';
import { SectionBlock } from './components/SectionBlock';
import { Button } from '@/components/Button';
import { InviteModal, type InviteModalProps } from '@/components/Invites';
import { MembersSection } from '@/components/MembersSection';
import { PageHeader } from '@/components/PageHeader';
import { PageLayout } from '@/components/PageLayout';
import { Toast } from '@/components/Toast';
import { PageHeading } from '@/components/Typography';
import { UserBadge } from '@/components/UserBadge';

type Props = {
  shoppingListId: string
  currentUserId: string
  isPremium: boolean
};

// ─── Main client ──────────────────────────────────────────────────────────────

export const ShoppingListDetailClient: React.FC<Props> = (props) => {
  const { shoppingListId, currentUserId, isPremium } = props;
  const router = useRouter();
  const queryClient = useQueryClient();
  const { confirm } = useConfirm();
  const t = useTranslations('shoppingList');

  const { data: list } = useShoppingList({ shoppingListId });

  const [toast, setToast] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(() => list?.title ?? '');
  const [addingSection, setAddingSection] = useState(false);

  const addSectionSchema = z.object({ title: z.string().min(1, 'Section name is required') });
  type AddSectionForm = z.infer<typeof addSectionSchema>;
  const { register: registerSection, handleSubmit: handleSectionSubmit, reset: resetSection } = useForm<AddSectionForm>({
    resolver: zodResolver(addSectionSchema),
  });

  useShoppingListRealtime(shoppingListId);

  // ── Unified drag state ─────────────────────────────────────────────────────
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<'section' | 'item' | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [dropSide, setDropSide] = useState<'top' | 'bottom' | null>(null);

  // dragSections carries optimistic item order during an active drag
  const [dragSections, setDragSections] = useState(() =>
    list?.sections.map(s => ({ ...s, items: s.items.filter(i => !i.checked) })) ?? [],
  );

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const { mutate: putList } = usePutShoppingList({ shoppingListId });
  const { mutateAsync: deleteList } = useDeleteShoppingList({ shoppingListId });
  const { mutate: postSection } = usePostSection({ shoppingListId });
  const { mutate: reorderSections } = usePutSectionReorder({ shoppingListId });
  const { mutate: clearChecked } = useDeleteCheckedItems({ shoppingListId });
  const { mutate: reorderItems } = usePutItemsReorder({ shoppingListId });
  const { mutateAsync: moveItemSection } = usePutItemSection({ shoppingListId });
  const { mutateAsync: invite } = usePostShoppingListInvite({ shoppingListId });
  const { mutateAsync: deleteMember } = useDeleteShoppingListMember({ shoppingListId });

  const { modal } = useModal();

  const detailKey = queryKeys.shoppingLists.detail(shoppingListId);
  const invalidateDetail = useCallback(() =>
    queryClient.invalidateQueries({ queryKey: detailKey }), [queryClient, detailKey]);

  if (!list) return null;

  const isOwner = list.currentUserRole === 'OWNER';

  // When not dragging, always derive from server data; during drag use optimistic state
  const localSections = activeId
    ? dragSections
    : list.sections.map(s => ({ ...s, items: s.items.filter(i => !i.checked) }));

  const handleInvite = async () => {
    const result = await modal<true | null, InviteModalProps<'OWNER' | 'COLLABORATOR'>>({
      Component: InviteModal,
      props: {
        heading: t('invite'),
        roles: isPremium
          ? [{ value: 'COLLABORATOR' as const, label: 'Collaborator' }, { value: 'OWNER' as const, label: 'Owner' }]
          : [{ value: 'COLLABORATOR' as const, label: 'Collaborator' }],
        defaultRole: 'COLLABORATOR' as const,
        onSubmit: async (username: string, role: 'OWNER' | 'COLLABORATOR') => {
          await invite({ username, role });
        },
      },
      maxWidth: 'max-w-sm',
      cancelValue: null,
    });
    if (!result) return;
    setToast('Invited!');
  };

  const handleRemoveMember = async (userId: string) => {
    if (!await confirm('Remove this member?', { confirmLabel: 'Remove' })) return;
    await deleteMember({ userId });
  };

  // ── Drag handlers ──────────────────────────────────────────────────────────

  const resetDragState = () => {
    setActiveId(null);
    setActiveType(null);
    setOverId(null);
    setDropSide(null);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const id = String(event.active.id);
    // Snapshot current server-derived state as the drag baseline
    setDragSections(list.sections.map(s => ({ ...s, items: s.items.filter(i => !i.checked) })));
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
        moveItemSection({ itemId: String(active.id), sectionId: targetSectionId })
          .then(() => reorderItems({ items: newTargetItems.map((item, i) => ({ id: item.id, orderIndex: i })) }))
          .catch(invalidateDetail);
      }
    }
  };

  // ── Section / list handlers ────────────────────────────────────────────────

  const onAddSection = (data: AddSectionForm) => {
    postSection({ title: data.title.trim() }, {
      onSuccess: () => {
        resetSection();
        setAddingSection(false);
      },
    });
  };

  const handleClearDone = async () => {
    if (!await confirm('Permanently delete all checked items?', { confirmLabel: 'Clear' })) return;
    clearChecked();
  };

  const handleTitleBlur = () => {
    setEditingTitle(false);
    if (titleDraft.trim() && titleDraft.trim() !== list.title) {
      putList({ title: titleDraft.trim() });
    }
    else {
      setTitleDraft(list.title);
    }
  };

  const handleLeaveOrDelete = async () => {
    const confirmed = await confirm(
      isOwner ? 'Remove yourself as owner? If you are the last owner the list will be permanently deleted.' : 'Leave this shopping list?',
      { confirmLabel: isOwner ? 'Remove' : 'Leave' },
    );
    if (!confirmed) return;
    await deleteList();
    await queryClient.invalidateQueries({ queryKey: queryKeys.shoppingLists.mine() });
    router.push('/shopping-lists');
  };

  const allItems = list.sections.flatMap(s => s.items);
  const checkedItems = allItems.filter(i => i.checked);

  // Overlay content
  const activeItem = activeType === 'item'
    ? localSections.flatMap(s => s.items).find(i => i.id === activeId) ?? null
    : null;
  const activeSection = activeType === 'section'
    ? localSections.find(s => s.id === activeId) ?? null
    : null;

  // First section is always Unsorted; the rest are named and sortable
  const [unsortedSection, ...namedSections] = localSections;

  return (
    <PageLayout width="narrow">
      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}

      {/* Header */}
      <PageHeader
        backHref="/shopping-lists"
        titleContent={
          editingTitle && isOwner
            ? (
                <input
                  autoFocus
                  className="text-2xl font-bold text-stone-800 outline-none border-b-2 border-primary-400 w-full"
                  value={titleDraft}
                  onChange={e => setTitleDraft(e.target.value)}
                  onBlur={handleTitleBlur}
                  onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
                />
              )
            : (
                <div
                  className={isOwner ? 'cursor-pointer hover:opacity-75' : ''}
                  onClick={() => isOwner && setEditingTitle(true)}
                  role={isOwner ? 'button' : undefined}
                  tabIndex={isOwner ? 0 : undefined}
                  onKeyDown={isOwner ? (e) => { if (e.key === 'Enter') setEditingTitle(true); } : undefined}
                >
                  <PageHeading>{list.title}</PageHeading>
                </div>
              )
        }
        action={list.currentUserRole ? <UserBadge role={list.currentUserRole} /> : undefined}
      />

      <DragOverContext.Provider value={{ overId, activeType, dropSide }}>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          onDragCancel={resetDragState}
        >
          {/* Unsorted section — always first, not in sections SortableContext */}
          {unsortedSection && (
            <SectionBlock
              key={unsortedSection.id}
              section={unsortedSection}
              items={unsortedSection.items}
              isUnsorted
              shoppingListId={list.id}
            />
          )}

          {/* Named sections — sortable */}
          <SortableContext items={namedSections.map(s => s.id)} strategy={verticalListSortingStrategy}>
            {namedSections.map(section => (
              <SectionBlock
                key={section.id}
                section={section}
                items={section.items}
                isUnsorted={false}
                shoppingListId={list.id}
              />
            ))}
          </SortableContext>

          <DragOverlay dropAnimation={null}>
            {(() => {
              if (activeItem) return <ItemRowGhost item={activeItem} />;
              if (activeSection) return (
                <div className="mb-6 rounded-xl border border-primary-300 bg-white shadow-xl opacity-60 px-4 py-3 cursor-grabbing">
                  <p className="text-sm font-semibold text-stone-600">{activeSection.title}</p>
                  <p className="text-xs text-stone-400 mt-1">
                    {t('itemCount', { count: activeSection.items.length })}
                  </p>
                </div>
              );
              return null;
            })()}
          </DragOverlay>
        </DndContext>
      </DragOverContext.Provider>

      {addingSection
        ? (
            <form onSubmit={handleSectionSubmit(onAddSection)} className="flex gap-2 mt-2">
              <input
                autoFocus
                className="flex-1 rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
                placeholder={t('sectionNamePlaceholder')}
                {...registerSection('title')}
              />
              <Button type="submit" variant="primary" size="sm">{t('add')}</Button>
              <Button type="button" variant="secondary" size="sm" onClick={() => { setAddingSection(false); resetSection(); }}>{t('cancel')}</Button>
            </form>
          )
        : (
            <button
              className="mt-2 text-sm text-stone-400 hover:text-stone-600"
              onClick={() => setAddingSection(true)}
            >
              {t('addSection')}
            </button>
          )}

      <DoneSection
        items={checkedItems}
        shoppingListId={list.id}
        onClearDone={handleClearDone}
      />

      <MembersSection
        members={list.members}
        isOwner={isOwner}
        currentUserId={currentUserId}
        onInvite={isPremium ? handleInvite : undefined}
        onRemoveMember={handleRemoveMember}
      />

      {/* Footer actions */}
      <div className="mt-10 border-t border-stone-100 pt-6">
        <button
          className="text-sm text-danger-500 hover:text-danger-700"
          onClick={handleLeaveOrDelete}
        >
          {isOwner ? t('deleteList') : t('leaveList')}
        </button>
      </div>
    </PageLayout>
  );
};
