'use client';

import { useTranslations } from 'next-intl';
// Data
import { queryKeys } from '@/data/queryKeys';
import { useQueryClient } from '@/data/shared/hooks';
import type { PendingShoppingListInvite } from '@/data/shopping-lists/types';
// Components
import { PendingInvitesList } from '@/components/Invites';

type ShoppingListInvitesSectionProps = {
  pending: PendingShoppingListInvite[]
  onToast: (msg: string) => void
};

export const ShoppingListInvitesSection: React.FC<ShoppingListInvitesSectionProps> = (props) => {
  const { pending, onToast } = props;
  const t = useTranslations('shoppingLists');
  const queryClient = useQueryClient();

  if (pending.length === 0) return null;

  const handleAccept = async (shoppingListId: string) => {
    await fetch(`/api/shopping-lists/${shoppingListId}/invites/accept`, { method: 'POST' });
    await queryClient.invalidateQueries({ queryKey: queryKeys.shoppingLists.mine() });
    onToast(t('inviteAccepted'));
  };

  const handleDecline = async (shoppingListId: string) => {
    await fetch(`/api/shopping-lists/${shoppingListId}/invites/decline`, { method: 'POST' });
    await queryClient.invalidateQueries({ queryKey: queryKeys.shoppingLists.mine() });
    onToast(t('inviteDeclined'));
  };

  const items = pending.map(p => ({
    id: p.shoppingList.id,
    title: p.shoppingList.title,
    roleLabel: p.role === 'OWNER' ? t('invitedAsOwner') : t('invitedAsCollaborator'),
  }));

  return (
    <PendingInvitesList
      pending={items}
      label={t('pendingInvites')}
      acceptLabel={t('accept')}
      declineLabel={t('decline')}
      onAccept={handleAccept}
      onDecline={handleDecline}
    />
  );
};
