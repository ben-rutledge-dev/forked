'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
// Components
// Data
import type { Member } from '@/data/shared/types';
// Components
import { Button } from '@/components/Button';
import { UserBadge } from '@/components/UserBadge';

type MembersSectionProps = {
  members: Member[]
  isOwner: boolean
  currentUserId: string
  onInvite?: () => void
  onRemoveMember: (userId: string) => void
};

export const MembersSection: React.FC<MembersSectionProps> = (props) => {
  const { members, isOwner, currentUserId, onInvite, onRemoveMember } = props;
  const t = useTranslations('membersSection');
  const acceptedMembers = members.filter(m => m.acceptedAt !== null);
  const pendingMembers = members.filter(m => m.acceptedAt === null);

  return (
    <div className="mt-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">{t('heading')}</h2>
        {isOwner && onInvite && (
          <Button variant="secondary" size="sm" onClick={onInvite}>
            {t('invite')}
          </Button>
        )}
      </div>

      <div className="space-y-2">
        {acceptedMembers.map(m => (
          <MemberCard
            key={m.id}
            member={m}
            actionLabel={isOwner && m.role.toLowerCase() !== 'owner' && m.userId !== currentUserId ? t('remove') : undefined}
            onAction={isOwner && m.role.toLowerCase() !== 'owner' && m.userId !== currentUserId ? () => onRemoveMember(m.userId) : undefined}
          />
        ))}
      </div>

      {isOwner && pendingMembers.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-medium text-stone-400 dark:text-stone-500 uppercase tracking-wide mb-2">{t('pendingHeading')}</p>
          <div className="space-y-2">
            {pendingMembers.map(m => (
              <MemberCard
                key={m.id}
                member={m}
                pending
                actionLabel={t('revoke')}
                onAction={() => onRemoveMember(m.userId)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

type MemberCardProps = {
  member: Member
  pending?: boolean
  actionLabel?: string
  onAction?: () => void
};

const MemberCard: React.FC<MemberCardProps> = (props) => {
  const { member: m, pending = false, actionLabel, onAction } = props;
  const t = useTranslations('membersSection');
  return (
    <div className={`flex items-center justify-between rounded-xl squircle shadow-sm px-4 py-3 ${pending ? 'bg-stone-50 dark:bg-stone-900' : 'bg-white dark:bg-stone-800'}`}>
      <div className="flex items-center gap-3">
        {m.user.avatarUrl
          ? (
              <Image src={m.user.avatarUrl} alt="" width={32} height={32} className="w-8 h-8 rounded-full object-cover" />
            )
          : (
              <div className="w-8 h-8 rounded-full bg-stone-200 dark:bg-stone-700 flex items-center justify-center text-stone-500 dark:text-stone-400 text-xs font-medium">
                {(m.user.name ?? m.user.username ?? t('unknownUser'))[0].toUpperCase()}
              </div>
            )}
        <div>
          <p className={`text-sm font-medium ${pending ? 'text-stone-400 dark:text-stone-500' : 'text-stone-900 dark:text-stone-100'}`}>
            {m.user.name ?? m.user.username ?? t('unknownUser')}
          </p>
          {m.user.username && (
            <p className={`text-xs ${pending ? 'text-stone-300 dark:text-stone-600' : 'text-stone-400 dark:text-stone-500'}`}>
              @
              {m.user.username}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <UserBadge role={m.role} />
        {actionLabel && onAction && (
          <button onClick={onAction} className="text-xs text-danger-400 hover:text-danger-600">
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
};
