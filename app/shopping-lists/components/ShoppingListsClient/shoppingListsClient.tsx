'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
// Data
import { queryKeys } from '@/data/queryKeys';
import { useQueryClient } from '@/data/shared/hooks';
import { useShoppingLists, usePostShoppingList } from '@/data/shopping-lists';
// Components
import { Button } from '@/components/Button';
import { PageHeader } from '@/components/PageHeader';
import { PageLayout } from '@/components/PageLayout';
import { Toast } from '@/components/Toast';
import { SectionLabel } from '@/components/Typography';
import { UserBadge } from '@/components/UserBadge';

const createListSchema = z.object({
  title: z.string().min(1, 'List name is required').max(100),
});
type CreateListForm = z.infer<typeof createListSchema>;

const NewListAction = ({ onNew }: { onNew: () => void }) => {
  const t = useTranslations('shoppingLists');
  return (
    <Button variant="primary" size="md" onClick={onNew}>
      {t('newList')}
    </Button>
  );
};

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

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateListForm>({
    resolver: zodResolver(createListSchema),
  });

  const onSubmit = async (data: CreateListForm) => {
    const list = await createList({ title: data.title.trim() });
    reset();
    setCreating(false);
    router.push(`/shopping-lists/${list.id}`);
  };

  const handleAccept = async (shoppingListId: string) => {
    await fetch(`/api/shopping-lists/${shoppingListId}/invites/accept`, { method: 'POST' });
    await queryClient.invalidateQueries({ queryKey: queryKeys.shoppingLists.mine() });
    setToast(t('inviteAccepted'));
  };

  const handleDecline = async (shoppingListId: string) => {
    await fetch(`/api/shopping-lists/${shoppingListId}/invites/decline`, { method: 'POST' });
    await queryClient.invalidateQueries({ queryKey: queryKeys.shoppingLists.mine() });
    setToast(t('inviteDeclined'));
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

      {pending.length > 0 && (
        <section className="mb-8">
          <SectionLabel className="mb-3">{t('pendingInvites')}</SectionLabel>
          <ul className="space-y-2">
            {pending.map(invite => (
              <li key={invite.id} className="flex items-center justify-between rounded-xl squircle shadow-sm bg-white dark:bg-stone-800 px-4 py-3">
                <div>
                  <p className="text-sm font-medium">{invite.shoppingList.title}</p>
                  <p className="text-xs text-stone-400 dark:text-stone-500">
                    {invite.role === 'OWNER' ? t('invitedAsOwner') : t('invitedAsCollaborator')}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="primary"
                    size="sm"

                    onClick={() => handleAccept(invite.shoppingList.id)}
                  >
                    {t('accept')}
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"

                    onClick={() => handleDecline(invite.shoppingList.id)}
                  >
                    {t('decline')}
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {lists.length === 0
        ? (
            <p className="text-stone-400 dark:text-stone-500 text-sm">{t('noListsYet')}</p>
          )
        : (
            <ul className="grid gap-4 sm:grid-cols-2">
              {lists.map(list => (
                <li key={list.id}>
                  <button
                    className="w-full text-left rounded-xl squircle shadow-sm bg-white dark:bg-stone-800 px-5 py-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => router.push(`/shopping-lists/${list.id}`)}
                  >
                    <p className="font-medium text-stone-800 dark:text-stone-200">{list.title}</p>
                    <p className="mt-1 text-xs text-stone-400 dark:text-stone-500">
                      {t('stats', { items: list.uncheckedCount, members: list.memberCount })}
                    </p>
                    {list.role === 'OWNER' && (
                      <UserBadge role={list.role} className="mt-2" />
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
    </PageLayout>
  );
};
