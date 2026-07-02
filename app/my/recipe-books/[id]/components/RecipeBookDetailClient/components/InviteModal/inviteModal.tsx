'use client';

import { useTranslations } from 'next-intl';
// Components
import { InviteForm } from '@/components/Invites';

type InviteModalProps = {
  bookId: string
  isPremium: boolean
  onConfirm: (value: true | null) => void
};

export const InviteModal: React.FC<InviteModalProps> = (props) => {
  const {
    bookId,
    isPremium,
    onConfirm,
  } = props;

  const t = useTranslations('recipeBooks');

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">{t('inviteHeading')}</h2>
      <InviteForm
        roles={
          isPremium
            ? [{ value: 'Collaborator' as const, label: 'Collaborator' }, { value: 'Owner' as const, label: 'Owner' }]
            : [{ value: 'Collaborator' as const, label: 'Collaborator' }]
        }
        defaultRole={'Collaborator' as const}
        onSubmit={async (username, role) => {
          const res = await fetch(`/api/recipe-books/${bookId}/invites`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, role }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error ?? 'Failed');
          onConfirm(true);
        }}
        onCancel={() => onConfirm(null)}
      />
    </div>
  );
};
