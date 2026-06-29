'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
// Components
import { Button } from '@/components/Button';
import { FormBanner } from '@/components/FormBanner';
import { FormField } from '@/components/FormField';
import { TextInput } from '@/components/TextInput';

export type RoleOption<TRole extends string> = {
  value: TRole
  label: string
};

type Props<TRole extends string> = {
  roles: RoleOption<TRole>[]
  defaultRole: TRole
  onSubmit: (username: string, role: TRole) => Promise<void>
  onCancel?: () => void
};

export const InviteForm = <TRole extends string>({ roles, defaultRole, onSubmit, onCancel }: Props<TRole>) => {
  const t = useTranslations('inviteForm');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState<TRole>(defaultRole);
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
      {roles.length > 1 && (
        <FormField label={t('roleLabel')}>
          <select
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-500"
            value={role}
            onChange={e => setRole(e.target.value as TRole)}
          >
            {roles.map(r => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
        </FormField>
      )}
      <div className="flex gap-2">
        <Button
          type="submit"
          variant="primary"
          size="sm"

          disabled={isSubmitting || !username.trim()}
        >
          {isSubmitting ? t('submittingLabel') : t('submitLabel')}
        </Button>
        {onCancel && (
          <Button type="button" variant="secondary" size="sm" onClick={onCancel}>
            {t('cancelLabel')}
          </Button>
        )}
      </div>
    </form>
  );
};
