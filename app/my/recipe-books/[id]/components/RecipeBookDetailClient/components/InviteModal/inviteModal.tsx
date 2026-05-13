'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
// Components
import { Button } from '@/components/Button';
import { Checkbox } from '@/components/Checkbox';
import { FormBanner } from '@/components/FormBanner';
import { FormField } from '@/components/FormField';
import { TextInput } from '@/components/TextInput';
// Utils
import { COLLABORATOR, OWNER } from '@/utils/roles';
import type { Role } from '@/utils/roles';

type Fields = {
  username: string
  role: Role
};

type Status = 'idle' | 'sending' | 'error';

type Props = {
  bookId: string
  isPremium: boolean
  onConfirm: (value: true | null) => void
};

export const InviteModal = ({ bookId, isPremium, onConfirm }: Props) => {
  const [fields, setFields] = useState<Fields>({ username: '', role: COLLABORATOR });
  const [status, setStatus] = useState<Status>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const t = useTranslations('recipeBooks');

  const setField = <K extends keyof Fields>(key: K, value: Fields[K]) =>
    setFields(prev => ({ ...prev, [key]: value }));

  const handleInvite = async () => {
    if (!fields.username.trim()) return;
    setStatus('sending');
    setErrorMessage('');
    try {
      const res = await fetch(`/api/recipe-books/${bookId}/invites`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: fields.username.trim(), role: fields.role }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error ?? 'Failed');
        setStatus('error');
        return;
      }
      onConfirm(true);
    }
    catch {
      setErrorMessage('Something went wrong');
      setStatus('error');
    }
  };

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-lg font-semibold text-stone-900">{t('inviteHeading')}</h2>
      {status === 'error' && <FormBanner type="error" message={errorMessage} />}
      <FormField label={t('usernameLabel')}>
        <TextInput
          type="text"
          value={fields.username}
          onChange={e => setField('username', e.target.value)}
          placeholder={t('usernamePlaceholder')}
        />
      </FormField>
      {isPremium && (
        <Checkbox
          checked={fields.role === OWNER}
          onChange={e => setField('role', e.target.checked ? OWNER : COLLABORATOR)}
          label={`Invite as ${fields.role === OWNER ? 'owner' : 'collaborator'}`}
        />
      )}
      <div className="flex gap-2 pt-1">
        <Button
          variant="primary"
          size="md"
          shape="pill"
          disabled={status === 'sending' || !fields.username.trim()}
          onClick={handleInvite}
        >
          {status === 'sending' ? t('inviting') : t('sendInvite')}
        </Button>
        <Button variant="secondary" size="md" shape="pill" onClick={() => onConfirm(null)}>
          {t('cancel')}
        </Button>
      </div>
    </div>
  );
};
