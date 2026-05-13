'use client';

import { useTranslations } from 'next-intl';
// Components
import { Button } from '@/components/Button';

export type AlertConfirmProps = {
  text: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'primary'
  onConfirm: (value: boolean) => void
};

export const AlertConfirm = ({
  text,
  confirmLabel,
  cancelLabel,
  variant = 'danger',
  onConfirm,
}: AlertConfirmProps) => {
  const t = useTranslations('alertConfirm');

  return (
    <div className="p-6 flex flex-col gap-5">
      <p className="text-stone-700 text-sm leading-relaxed">{text}</p>
      <div className="flex justify-end gap-2">
        <Button variant="secondary" size="sm" shape="rounded" onClick={() => onConfirm(false)}>
          {cancelLabel ?? t('cancel')}
        </Button>
        <Button
          variant={variant === 'danger' ? 'danger' : 'primary'}
          size="sm"
          shape="rounded"
          className={variant === 'danger' ? 'bg-danger-500 text-white hover:bg-danger-600 px-3 py-1' : ''}
          onClick={() => onConfirm(true)}
        >
          {confirmLabel ?? t('confirm')}
        </Button>
      </div>
    </div>
  );
};
