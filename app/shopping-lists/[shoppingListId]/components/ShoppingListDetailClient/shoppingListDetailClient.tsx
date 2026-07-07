'use client';

import { DndContext, DragOverlay, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
// Data
import { queryKeys } from '@/data/queryKeys';
import { useQueryClient } from '@/data/shared/hooks';
import { useShoppingList, usePutShoppingList, useDeleteShoppingList } from '@/data/shopping-lists/[shoppingListId]';
import { usePostShoppingListInvite } from '@/data/shopping-lists/[shoppingListId]/invites';
import { postShoppingListInviteSchema } from '@/data/shopping-lists/[shoppingListId]/invites/types';
import { useDeleteCheckedItems, usePutItemSection, usePutItemsReorder } from '@/data/shopping-lists/[shoppingListId]/items';
import { useDeleteShoppingListMember } from '@/data/shopping-lists/[shoppingListId]/members/[memberId]';
import { usePostSection, usePutSectionReorder, postSectionSchema, type PostSectionPayload } from '@/data/shopping-lists/[shoppingListId]/sections';
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
import { useShoppingListDnd } from './hooks/useShoppingListDnd';

type ShoppingListDetailClientProps = {
  shoppingListId: string
  currentUserId: string
  isPremium: boolean
};

// ─── Main client ──────────────────────────────────────────────────────────────

export const ShoppingListDetailClient: React.FC<ShoppingListDetailClientProps> = (props) => {
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

  const { register: registerSection, handleSubmit: handleSectionSubmit, reset: resetSection } = useForm<PostSectionPayload>({
    resolver: zodResolver(postSectionSchema),
  });

  useShoppingListRealtime(shoppingListId);

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

  const filteredSections = list?.sections.map(s => ({ ...s, items: s.items.filter(i => !i.checked) })) ?? [];

  const {
    sensors,
    localSections,
    activeType,
    activeItem,
    activeSection,
    overId,
    dropSide,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    resetDragState,
  } = useShoppingListDnd({
    sections: filteredSections,
    reorderSections,
    reorderItems,
    moveItemSection,
    onMoveItemSectionError: invalidateDetail,
  });

  if (!list) return null;

  const isOwner = list.currentUserRole === 'OWNER';

  const handleInvite = async () => {
    const result = await modal<true | null, InviteModalProps<'OWNER' | 'COLLABORATOR'>>({
      Component: InviteModal,
      props: {
        heading: t('invite'),
        schema: postShoppingListInviteSchema,
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

  // ── Section / list handlers ────────────────────────────────────────────────

  const onAddSection = (data: PostSectionPayload) => {
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
                  className="text-2xl font-bold text-stone-800 dark:text-stone-200 outline-none border-b-2 border-primary-400 w-full"
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
          id="shopping-list-dnd"
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
                <div className="mb-6 rounded-xl border border-primary-300 bg-white dark:bg-stone-800 shadow-xl dark:shadow-stone-950/30 opacity-60 px-4 py-3 cursor-grabbing">
                  <p className="text-sm font-semibold text-stone-600 dark:text-stone-400">{activeSection.title}</p>
                  <p className="text-xs text-stone-400 dark:text-stone-500 mt-1">
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
                className="flex-1 rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 placeholder-stone-400 dark:placeholder-stone-500"
                placeholder={t('sectionNamePlaceholder')}
                {...registerSection('title')}
              />
              <Button type="submit" variant="primary" size="sm">{t('add')}</Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  setAddingSection(false);
                  resetSection();
                }}
              >
                {t('cancel')}
              </Button>
            </form>
          )
        : (
            <button
              className="mt-2 text-sm text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300"
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
      <div className="mt-10 border-t border-stone-100 dark:border-stone-700 pt-6">
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
