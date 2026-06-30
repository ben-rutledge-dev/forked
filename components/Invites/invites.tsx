'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
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

const inviteSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  role: z.string(),
});
type InviteFormValues = z.infer<typeof inviteSchema>;

export const InviteForm = <TRole extends string>({ roles, defaultRole, onSubmit, onCancel }: Props<TRole>) => {
  const t = useTranslations('inviteForm');
  const { register, handleSubmit, reset, setError, formState: { errors, isSubmitting } } = useForm<InviteFormValues>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { username: '', role: defaultRole },
  });

  const onValid = async (data: InviteFormValues) => {
    try {
      await onSubmit(data.username.trim(), data.role as TRole);
      reset();
    }
    catch (err) {
      setError('root', { message: err instanceof Error ? err.message : 'Something went wrong' });
    }
  };

  const registerUsername = register('username');
  const registerRole = register('role');

  return (
    <form onSubmit={handleSubmit(onValid)} className="space-y-3">
      <FormField label={t('usernameLabel')} error={errors.username?.message}>
        <TextInput
          placeholder={t('usernamePlaceholder')}
          {...registerUsername}
        />
      </FormField>
      {roles.length > 1 && (
        <FormField label={t('roleLabel')}>
          <select
            className="w-full rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 px-3 py-2 text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-stone-500 dark:focus:ring-stone-400"
            {...registerRole}
          >
            {roles.map(r => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
        </FormField>
      )}
      {errors.root && <FormBanner type="error" message={errors.root.message ?? ''} />}
      <div className="flex gap-2">
        <Button type="submit" variant="primary" size="sm" disabled={isSubmitting}>
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
