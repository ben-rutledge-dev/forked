'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
// Data
import type { PendingMealPlanInvite } from '@/data/meal-plans/types';
import { queryKeys } from '@/data/queryKeys';
import { useQueryClient } from '@/data/shared/hooks';
// Components
import { PendingInvitesList } from '@/components/Invites';

type PlanInvitesSectionProps = {
  pending: PendingMealPlanInvite[]
  onToast: (msg: string) => void
  className?: string
};

export const PlanInvitesSection: React.FC<PlanInvitesSectionProps> = (props) => {
  const { pending, onToast, className } = props;
  const t = useTranslations('mealPlanner');
  const router = useRouter();
  const queryClient = useQueryClient();

  if (pending.length === 0) return null;

  const handleAccept = async (mealPlanId: string) => {
    await fetch(`/api/meal-plans/${mealPlanId}/invites/accept`, { method: 'POST' });
    await queryClient.invalidateQueries({ queryKey: queryKeys.mealPlans.pending() });
    onToast(t('inviteAccepted'));
    router.refresh();
  };

  const handleDecline = async (mealPlanId: string) => {
    await fetch(`/api/meal-plans/${mealPlanId}/invites/decline`, { method: 'POST' });
    await queryClient.invalidateQueries({ queryKey: queryKeys.mealPlans.pending() });
    onToast(t('inviteDeclined'));
  };

  const items = pending.map(p => ({
    id: p.mealPlanId,
    title: p.mealPlan.title,
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
      className={className}
    />
  );
};
