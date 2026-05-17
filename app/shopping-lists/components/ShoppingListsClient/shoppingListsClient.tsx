'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
// Data
import { queryKeys } from '@/data/queryKeys';
import { useQueryClient } from '@/data/shared/hooks';
import { useShoppingLists, usePostShoppingList } from '@/data/shopping-lists';
import type { ShoppingListWithStats, PendingShoppingListInvite } from '@/data/shopping-lists/types';
// Components
import { Button } from '@/components/Button';
import { Toast } from '@/components/Toast';
import { PageHeading, SectionLabel } from '@/components/Typography';
import { UserBadge } from '@/components/UserBadge';

type Props = {
  initialLists: ShoppingListWithStats[]
  initialPending: PendingShoppingListInvite[]

};

export const ShoppingListsClient = ({ initialLists, initialPending }: Props) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [newTitle, setNewTitle] = useState('');
  const [creating, setCreating] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const t = useTranslations('shoppingLists');

  const { data } = useShoppingLists({ initialData: { lists: initialLists, pending: initialPending } });
  const lists = data?.lists ?? initialLists;
  const pending = data?.pending ?? initialPending;

  const { mutateAsync: createList, isPending: isCreating } = usePostShoppingList();

  const handleCreate = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const list = await createList({ title: newTitle.trim() });
    setNewTitle('');
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
    <main className="mx-auto max-w-4xl px-4 py-8">
      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}

      <div className="flex items-center justify-between mb-6">
        <PageHeading>{t('heading')}</PageHeading>
        <Button variant="primary" size="md" shape="pill" onClick={() => setCreating(c => !c)}>
          {t('newList')}
        </Button>
      </div>

      {creating && (
        <form onSubmit={handleCreate} className="mb-6 flex gap-2">
          <input
            autoFocus
            className="flex-1 rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
            placeholder={t('listNamePlaceholder')}
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
          />
          <Button type="submit" variant="primary" size="sm" shape="pill" disabled={isCreating || !newTitle.trim()}>
            {isCreating ? t('creating') : t('create')}
          </Button>
          <Button type="button" variant="secondary" size="sm" shape="pill" onClick={() => setCreating(false)}>
            {t('cancel')}
          </Button>
        </form>
      )}

      {pending.length > 0 && (
        <section className="mb-8">
          <SectionLabel className="mb-3">{t('pendingInvites')}</SectionLabel>
          <ul className="space-y-2">
            {pending.map(invite => (
              <li key={invite.id} className="flex items-center justify-between rounded-xl border border-stone-200 px-4 py-3">
                <div>
                  <p className="text-sm font-medium">{invite.shoppingList.title}</p>
                  <p className="text-xs text-stone-400">
                    {invite.role === 'OWNER' ? t('invitedAsOwner') : t('invitedAsCollaborator')}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    shape="pill"
                    onClick={() => handleAccept(invite.shoppingList.id)}
                  >
                    {t('accept')}
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    shape="pill"
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
            <p className="text-stone-400 text-sm">{t('noListsYet')}</p>
          )
        : (
            <ul className="grid gap-4 sm:grid-cols-2">
              {lists.map(list => (
                <li key={list.id}>
                  <button
                    className="w-full text-left rounded-xl border border-stone-200 px-5 py-4 hover:border-stone-300 transition-colors cursor-pointer"
                    onClick={() => router.push(`/shopping-lists/${list.id}`)}
                  >
                    <p className="font-medium text-stone-800">{list.title}</p>
                    <p className="mt-1 text-xs text-stone-400">
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
    </main>
  );
};
