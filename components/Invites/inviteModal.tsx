'use client';

import { InviteForm } from './invites';

type Role = 'OWNER' | 'COLLABORATOR';

type Props = {
  heading: string
  isPremium: boolean
  onSubmit: (username: string, role: Role) => Promise<void>
  onConfirm: (value: true | null) => void
};

export const InviteModal = ({ heading, isPremium, onSubmit, onConfirm }: Props) => (
  <div className="p-6 space-y-4">
    <h2 className="text-lg font-semibold text-stone-900">{heading}</h2>
    <InviteForm
      isPremium={isPremium}
      onSubmit={async (username, role) => {
        await onSubmit(username, role);
        onConfirm(true);
      }}
      onCancel={() => onConfirm(null)}
    />
  </div>
);
