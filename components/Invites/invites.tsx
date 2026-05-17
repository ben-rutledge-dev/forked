'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
// Components
import { Button } from '@/components/Button';
import { FormBanner } from '@/components/FormBanner';
import { FormField } from '@/components/FormField';
import { TextInput } from '@/components/TextInput';

type Role = 'OWNER' | 'COLLABORATOR';

type Props = {
  isPremium: boolean
  onSubmit: (username: string, role: Role) => Promise<void>
  onCancel?: () => void
};

export const InviteForm = ({ isPremium, onSubmit, onCancel }: Props) => {
  const t = useTranslations('inviteForm');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState<Role>('COLLABORATOR');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    setError('');
    setIsSubmitting(true);
    try {
      await onSubmit(username.trim(), role);
      setUsername('');
    }
    catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    }
    finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && <FormBanner type="error" message={error} />}
      <FormField label={t('usernameLabel')}>
        <TextInput
          value={username}
          onChange={e => setUsername(e.target.value)}
          placeholder={t('usernamePlaceholder')}
        />
      </FormField>
      {isPremium && (
        <FormField label={t('roleLabel')}>
          <select
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-500"
            value={role}
            onChange={e => setRole(e.target.value as Role)}
          >
            <option value="COLLABORATOR">{t('collaboratorLabel')}</option>
            <option value="OWNER">{t('ownerLabel')}</option>
          </select>
        </FormField>
      )}
      <div className="flex gap-2">
        <Button
          type="submit"
          variant="primary"
          size="sm"
          shape="pill"
          disabled={isSubmitting || !username.trim()}
        >
          {isSubmitting ? t('submittingLabel') : t('submitLabel')}
        </Button>
        {onCancel && (
          <Button type="button" variant="secondary" size="sm" shape="pill" onClick={onCancel}>
            {t('cancelLabel')}
          </Button>
        )}
      </div>
    </form>
  );
};
