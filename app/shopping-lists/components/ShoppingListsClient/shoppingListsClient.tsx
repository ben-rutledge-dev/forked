'use client';

import { DndContext, DragOverlay, closestCenter } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
// Data
import { queryKeys } from '@/data/queryKeys';
import { useQueryClient } from '@/data/shared/hooks';
import { useShoppingLists, usePostShoppingList } from '@/data/shopping-lists';
import { usePutShoppingListsReorder } from '@/data/shopping-lists/reorder';
import { postShoppingListSchema, type PostShoppingListPayload } from '@/data/shopping-lists/types';
// Hooks
import { useSortableListDnd } from '@/hooks/useSortableListDnd';
// Components
import { ShoppingListCard } from './components/ShoppingListCard';
import { ShoppingListInvitesSection } from './components/ShoppingListInvitesSection';
import { Button } from '@/components/Button';
import { PageHeader } from '@/components/PageHeader';
import { PageLayout } from '@/components/PageLayout';
import { Toast } from '@/components/Toast';

export const ShoppingListsClient = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [creating, setCreating] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const t = useTranslations('shoppingLists');

  const { data } = useShoppingLists();
  const lists = data?.lists ?? [];
  const pending = data?.pending ?? [];

  const { mutateAsync: createList, isPending: isCreating } = usePostShoppingList();
  const { mutate: reorderLists } = usePutShoppingListsReorder();

  const handleReorder = (reordered: typeof lists) => {
    queryClient.setQueryData(queryKeys.shoppingLists.mine(), (old: typeof data) =>
      old ? { ...old, lists: reordered } : old);
    reorderLists({ lists: reordered.map((l, i) => ({ id: l.id, orderIndex: i })) });
  };

  const {
    sensors,
    activeItem,
    overId,
    dropSide,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    resetDrag,
  } = useSortableListDnd({
    items: lists,
    getId: list => list.id,
    onReorder: handleReorder,
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<PostShoppingListPayload>({
    resolver: zodResolver(postShoppingListSchema),
  });

  const onSubmit = async (data: PostShoppingListPayload) => {
    const list = await createList({ title: data.title.trim() });
    reset();
    setCreating(false);
    router.push(`/shopping-lists/${list.id}`);
  };

  return (
    <PageLayout>
      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}

      <PageHeader
        title={t('heading')}
        action={<NewListAction onNew={() => setCreating(c => !c)} />}
      />

      {creating && (
        <form onSubmit={handleSubmit(onSubmit)} className="mb-6 space-y-1">
          <div className="flex gap-2">
            <input
              autoFocus
              className="flex-1 rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 placeholder-stone-400 dark:placeholder-stone-500"
              placeholder={t('listNamePlaceholder')}
              {...register('title')}
            />
            <Button type="submit" variant="primary" size="sm" disabled={isCreating}>
              {isCreating ? t('creating') : t('create')}
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => {
                setCreating(false);
                reset();
              }}
            >
              {t('cancel')}
            </Button>
          </div>
          {errors.title && <p className="text-xs text-danger-500">{errors.title.message}</p>}
        </form>
      )}

      <ShoppingListInvitesSection pending={pending} onToast={setToast} />

      {lists.length === 0
        ? (
            <p className="text-stone-400 dark:text-stone-500 text-sm">{t('noListsYet')}</p>
          )
        : (
            <DndContext
              id="shopping-lists-dnd"
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragEnd={handleDragEnd}
              onDragCancel={resetDrag}
            >
              <SortableContext items={lists.map(l => l.id)} strategy={rectSortingStrategy}>
                <ul className="grid gap-4 sm:grid-cols-2">
                  {lists.map(list => (
                    <li key={list.id}>
                      <ShoppingListCard
                        list={list}
                        dropSide={overId === list.id ? dropSide : null}
                        onOpen={() => router.push(`/shopping-lists/${list.id}`)}
                      />
                    </li>
                  ))}
                </ul>
              </SortableContext>

              <DragOverlay dropAnimation={null}>
                {activeItem && (
                  <div className="rounded-xl squircle shadow-xl bg-white dark:bg-stone-800 px-5 py-4 opacity-60 cursor-grabbing">
                    <p className="font-medium text-stone-800 dark:text-stone-200">{activeItem.title}</p>
                  </div>
                )}
              </DragOverlay>
            </DndContext>
          )}
    </PageLayout>
  );
};

type NewListActionProps = {
  onNew: () => void
};

const NewListAction: React.FC<NewListActionProps> = (props) => {
  const { onNew } = props;
  const t = useTranslations('shoppingLists');
  return (
    <Button variant="primary" size="md" onClick={onNew}>
      {t('newList')}
    </Button>
  );
};
