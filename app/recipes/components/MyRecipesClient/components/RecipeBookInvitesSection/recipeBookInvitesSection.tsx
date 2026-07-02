'use client';

import { useTranslations } from 'next-intl';
// Data
import { queryKeys } from '@/data/queryKeys';
import type { PendingInvite } from '@/data/recipe-books/types';
import { useQueryClient } from '@/data/shared/hooks';
// Components
import { PendingInvitesList } from '@/components/Invites';

type RecipeBookInvitesSectionProps = {
  pending: PendingInvite[]
};

export const RecipeBookInvitesSection: React.FC<RecipeBookInvitesSectionProps> = (props) => {
  const { pending } = props;

  const t = useTranslations('recipes');
  const queryClient = useQueryClient();

  if (pending.length === 0) return null;

  const handleAccept = async (recipeBookId: string) => {
    await fetch(`/api/recipe-books/${recipeBookId}/invites/accept`, { method: 'POST' });
    queryClient.invalidateQueries({ queryKey: queryKeys.recipeBooks.mine() });
    queryClient.invalidateQueries({ queryKey: queryKeys.recipeBooks.pending() });
  };

  const handleDecline = async (recipeBookId: string) => {
    await fetch(`/api/recipe-books/${recipeBookId}/invites/decline`, { method: 'POST' });
    queryClient.invalidateQueries({ queryKey: queryKeys.recipeBooks.mine() });
    queryClient.invalidateQueries({ queryKey: queryKeys.recipeBooks.pending() });
  };

  const items = pending.map(p => ({
    id: p.recipeBook.id,
    title: p.recipeBook.title,
    roleLabel: `${t('invitedAs')} ${p.role}`,
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
