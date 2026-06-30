'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
// Components
import { Button } from '@/components/Button';
import { Checkbox } from '@/components/Checkbox';
import { FormBanner } from '@/components/FormBanner';
import { Toast } from '@/components/Toast';

type Props = {
  isPublic: boolean
  showName: boolean
};

export const PrivacyForm = ({ isPublic: initialIsPublic, showName: initialShowName }: Props) => {
  const t = useTranslations('myProfile');
  const router = useRouter();
  const [isPublic, setIsPublic] = useState(initialIsPublic);
  const [showName, setShowName] = useState(initialShowName);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const res = await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isPublic, showName }),
    });
    setSaving(false);
    if (!res.ok) {
      const d = await res.json();
      setError(d.error ?? t('uploadFailed'));
      return;
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 4000);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {saved && <Toast message={t('saved')} />}

      <div className="divide-y divide-stone-100 dark:divide-stone-700 rounded-xl squircle shadow-sm dark:shadow-stone-950/30 bg-white dark:bg-stone-800 overflow-hidden">
        <div className="px-4 py-4">
          <Checkbox
            checked={isPublic}
            onChange={e => setIsPublic(e.target.checked)}
            label={t('makePublicLabel')}
            description={t('makePublicDescription')}
          />
        </div>
        <div className="px-4 py-4">
          <Checkbox
            checked={showName}
            onChange={e => setShowName(e.target.checked)}
            label={t('showNameLabel')}
            description={t('showNameDescription')}
          />
        </div>
      </div>

      {error && <FormBanner type="error" message={error} />}
      <div className="flex gap-3">
        <Button type="submit" variant="neutral" size="lg" disabled={saving}>
          {saving ? t('saving') : t('saveProfile')}
        </Button>
      </div>
    </form>
  );
};
