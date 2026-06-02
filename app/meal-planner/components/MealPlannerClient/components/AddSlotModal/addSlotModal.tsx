'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
// Components
import { Button } from '@/components/Button';
import { TextInput } from '@/components/TextInput';

type Props = {
  onConfirm: (label: string | null) => void
};

export const AddSlotModal = ({ onConfirm }: Props) => {
  const t = useTranslations('mealPlanner');
  const [label, setLabel] = useState('');

  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    const trimmed = label.trim();
    if (!trimmed) return;
    onConfirm(trimmed);
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-4">
      <h2 className="text-lg font-semibold text-stone-900">{t('addSlotHeading')}</h2>
      <p className="text-sm text-stone-500">{t('addSlotHint')}</p>
      <TextInput
        autoFocus
        value={label}
        onChange={e => setLabel(e.target.value)}
        placeholder={t('customSlotPlaceholder')}
      />
      <div className="flex gap-2">
        <Button type="submit" variant="primary" size="sm" shape="pill" disabled={!label.trim()}>
          {t('addSlotSubmit')}
        </Button>
        <Button type="button" variant="secondary" size="sm" shape="pill" onClick={() => onConfirm(null)}>
          {t('back')}
        </Button>
      </div>
    </form>
  );
};
