'use client';

import { useState } from 'react';
// Data
import type { PendingInviteItem } from '@/data/shared/types';
// Components
import { Button } from '@/components/Button';
import { SectionLabel } from '@/components/Typography';

type PendingInvitesListProps = {
  pending: PendingInviteItem[]
  label: string
  acceptLabel: string
  declineLabel: string
  onAccept: (id: string) => Promise<void>
  onDecline: (id: string) => Promise<void>
  className?: string
};

export const PendingInvitesList: React.FC<PendingInvitesListProps> = (props) => {
  const { pending, label, acceptLabel, declineLabel, onAccept, onDecline, className = 'mb-8' } = props;
  const [actingId, setActingId] = useState<string | null>(null);

  if (pending.length === 0) return null;

  const handle = async (id: string, action: (id: string) => Promise<void>) => {
    setActingId(id);
    try {
      await action(id);
    }
    finally {
      setActingId(null);
    }
  };

  return (
    <section className={className}>
      <SectionLabel className="mb-3">{label}</SectionLabel>
      <ul className="space-y-2">
        {pending.map(invite => (
          <li
            key={invite.id}
            className="flex items-center justify-between rounded-xl squircle shadow-sm bg-white dark:bg-stone-800 px-4 py-3"
          >
            <div>
              <p className="text-sm font-medium text-stone-900 dark:text-stone-100">{invite.title}</p>
              <p className="text-xs text-stone-400 dark:text-stone-500">{invite.roleLabel}</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="primary"
                size="sm"
                disabled={actingId === invite.id}
                onClick={() => handle(invite.id, onAccept)}
              >
                {acceptLabel}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={actingId === invite.id}
                onClick={() => handle(invite.id, onDecline)}
              >
                {declineLabel}
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
};
