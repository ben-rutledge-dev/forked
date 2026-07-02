'use client';

import { useTranslations } from 'next-intl';
// Data
import { usePostMealPlanInvite } from '@/data/meal-plans/[mealPlanId]/invites';
import { useDeleteMealPlanMember } from '@/data/meal-plans/[mealPlanId]/members/[memberId]';
import type { MealPlanMember } from '@/data/meal-plans/[mealPlanId]/types';
// Hooks
import { useConfirm } from '@/hooks/useConfirm';
import { useModal } from '@/hooks/useModal';
// Components
import { InviteModal, type InviteModalProps } from '@/components/Invites';
import { MembersSection } from '@/components/MembersSection';

type PlanMembersPanelProps = {
  planId: string
  members: MealPlanMember[]
  isOwner: boolean
  isPremium: boolean
  currentUserId: string
  onToast: (msg: string) => void
};

export const PlanMembersPanel: React.FC<PlanMembersPanelProps> = (props) => {
  const { planId, members, isOwner, isPremium, currentUserId, onToast } = props;
  const t = useTranslations('mealPlanner');
  const { confirm } = useConfirm();
  const { modal } = useModal();

  const { mutateAsync: invite } = usePostMealPlanInvite({ mealPlanId: planId });
  const { mutateAsync: deleteMember } = useDeleteMealPlanMember({ mealPlanId: planId });

  const handleInvite = async () => {
    const result = await modal<true | null, InviteModalProps<'COLLABORATOR' | 'VIEWER'>>({
      Component: InviteModal,
      props: {
        heading: t('inviteCollaborator'),
        roles: [
          { value: 'COLLABORATOR' as const, label: 'Collaborator' },
          { value: 'VIEWER' as const, label: 'Viewer' },
        ],
        defaultRole: 'COLLABORATOR' as const,
        onSubmit: async (username: string, role: 'COLLABORATOR' | 'VIEWER') => {
          await invite({ username, role });
        },
      },
      maxWidth: 'max-w-sm',
      cancelValue: null,
    });
    if (!result) return;
    onToast('Invited!');
  };

  const handleRemoveMember = async (userId: string) => {
    if (!await confirm('Remove this member?', { confirmLabel: 'Remove' })) return;
    await deleteMember({ userId });
  };

  return (
    <MembersSection
      members={members}
      isOwner={isOwner}
      currentUserId={currentUserId}
      onInvite={isOwner && isPremium ? handleInvite : undefined}
      onRemoveMember={handleRemoveMember}
    />
  );
};
