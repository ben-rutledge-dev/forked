'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
// Data
import type { BookMember } from '@/data/recipe-books/[recipeBookId]/types';
// Components
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
// Utils
import { OWNER } from '@/utils/roles';

type Props = {
  members: BookMember[]
  isOwner: boolean
  currentUserId: string
  onInvite: () => void
  onRemoveMember: (userId: string) => void
};

export const BookMembersSection = ({ members, isOwner, currentUserId, onInvite, onRemoveMember }: Props) => {
  const acceptedMembers = members.filter(m => m.acceptedAt !== null);
  const pendingMembers = members.filter(m => m.acceptedAt === null);
  const t = useTranslations('recipeBooks');

  return (
    <div className="mt-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-stone-900">{t('membersSection')}</h2>
        {isOwner && (
          <Button variant="secondary" size="sm" shape="pill" onClick={onInvite}>
            {t('inviteCollaborator')}
          </Button>
        )}
      </div>

      <div className="space-y-2">
        {acceptedMembers.map(m => (
          <div key={m.id} className="flex items-center justify-between rounded-xl border border-stone-200 bg-white px-4 py-3">
            <div className="flex items-center gap-3">
              {m.user.avatarUrl
                ? (
                    <Image src={m.user.avatarUrl} alt="" width={32} height={32} className="w-8 h-8 rounded-full object-cover" />
                  )
                : (
                    <div className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center text-stone-500 text-xs font-medium">
                      {(m.user.name ?? m.user.username ?? t('unknownUser'))[0].toUpperCase()}
                    </div>
                  )}
              <div>
                <p className="text-sm font-medium text-stone-900">{m.user.name ?? m.user.username ?? t('unknownUser')}</p>
                {m.user.username && (
                  <p className="text-xs text-stone-400">
                    @
                    {m.user.username}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={m.role === OWNER ? 'primary' : 'neutral'} className="text-xs font-medium">
                {m.role}
              </Badge>
              {isOwner && m.role !== OWNER && m.userId !== currentUserId && (
                <button
                  onClick={() => onRemoveMember(m.userId)}
                  className="text-xs text-danger-400 hover:text-danger-600"
                >
                  {t('remove')}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {isOwner && pendingMembers.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-medium text-stone-400 uppercase tracking-wide mb-2">{t('pendingInvites')}</p>
          <div className="space-y-2">
            {pendingMembers.map(m => (
              <div key={m.id} className="flex items-center justify-between rounded-lg border border-stone-100 bg-stone-50 px-4 py-2.5 text-sm">
                <span className="text-stone-600">
                  @
                  {m.user.username ?? m.user.id}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-stone-400">{m.role}</span>
                  <button
                    onClick={() => onRemoveMember(m.userId)}
                    className="text-xs text-danger-400 hover:text-danger-600"
                  >
                    {t('revoke')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
