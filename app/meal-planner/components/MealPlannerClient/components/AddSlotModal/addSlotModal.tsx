'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
// Data
import { postSlotSchema, type PostSlotPayload } from '@/data/meal-plans/[mealPlanId]/slots/types';
// Components
import { Button } from '@/components/Button';
import { TextInput } from '@/components/TextInput';

type AddSlotForm = PostSlotPayload;

type AddSlotModalProps = {
  onConfirm: (label: string | null) => void
};

export const AddSlotModal: React.FC<AddSlotModalProps> = (props) => {
  const { onConfirm } = props;
  const t = useTranslations('mealPlanner');
  const { register, handleSubmit, formState: { errors } } = useForm<AddSlotForm>({
    resolver: zodResolver(postSlotSchema),
  });

  const onSubmit = (data: AddSlotForm) => onConfirm(data.label.trim());

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
      <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">{t('addSlotHeading')}</h2>
      <p className="text-sm text-stone-500 dark:text-stone-400">{t('addSlotHint')}</p>
      <div>
        <TextInput
          autoFocus
          placeholder={t('customSlotPlaceholder')}
          {...register('label')}
        />
        {errors.label && <p className="mt-1 text-xs text-danger-500">{errors.label.message}</p>}
      </div>
      <div className="flex gap-2">
        <Button type="submit" variant="primary" size="sm">
          {t('addSlotSubmit')}
        </Button>
        <Button type="button" variant="secondary" size="sm" onClick={() => onConfirm(null)}>
          {t('back')}
        </Button>
      </div>
    </form>
  );
};
