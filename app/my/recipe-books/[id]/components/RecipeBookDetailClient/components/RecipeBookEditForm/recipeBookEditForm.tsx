'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
// Data
import type { RecipeBookDetail } from '@/data/recipe-books/[recipeBookId]/types';
// Components
import { Button } from '@/components/Button';
import { Checkbox } from '@/components/Checkbox';
import { FormBanner } from '@/components/FormBanner';
import { FormField } from '@/components/FormField';
import { ImageUpload } from '@/components/ImageUpload';
import { Textarea } from '@/components/Textarea';
import { TextInput } from '@/components/TextInput';

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string(),
  isPublic: z.boolean(),
  coverImageUrl: z.string(),
});
type FormValues = z.infer<typeof schema>;

type Props = {
  book: RecipeBookDetail
  onSaved: (updated: Partial<RecipeBookDetail>) => void
  onCancel: () => void
};

export const RecipeBookEditForm = ({ book, onSaved, onCancel }: Props) => {
  const t = useTranslations('recipeBooks');

  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: book.title,
      description: book.description ?? '',
      isPublic: book.isPublic,
      coverImageUrl: book.coverImageUrl ?? '',
    },
  });

  const onSubmit = async (data: FormValues) => {
    const res = await fetch(`/api/recipe-books/${book.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, coverImageUrl: data.coverImageUrl || null }),
    });
    if (!res.ok) {
      const d = await res.json();
      setError('root', { message: d.error ?? 'Something went wrong' });
      return;
    }
    onSaved({
      title: data.title,
      description: data.description || null,
      isPublic: data.isPublic,
      coverImageUrl: data.coverImageUrl || null,
    });
  };

  const registerTitle = register('title');
  const registerDescription = register('description');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-4 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 p-5 space-y-4 mb-6">

      <FormField label={t('editTitleLabel')} error={errors.title?.message}>
        <TextInput {...registerTitle} />
      </FormField>

      <FormField label={t('editDescriptionLabel')}>
        <Textarea rows={2} {...registerDescription} />
      </FormField>

      <FormField label={t('editCoverPhotoLabel')}>
        <Controller
          name="coverImageUrl"
          control={control}
          render={({ field: { value, onChange } }) => (
            <ImageUpload
              value={value}
              onChange={onChange}
              onError={msg => setError('root', { message: msg })}
              label={t('editAddCoverPhoto')}
            />
          )}
        />
      </FormField>

      <Controller
        name="isPublic"
        control={control}
        render={({ field: { value, onChange } }) => (
          <Checkbox
            checked={value}
            onChange={e => onChange(e.target.checked)}
            label={t('editMakePublicLabel')}
          />
        )}
      />

      {errors.root && <FormBanner type="error" message={errors.root.message ?? ''} />}
      <div className="flex gap-2">
        <Button type="submit" variant="primary" size="sm" disabled={isSubmitting}>
          {isSubmitting ? t('editSaving') : t('editSave')}
        </Button>
        <Button type="button" variant="secondary" size="sm" onClick={onCancel}>
          {t('editCancel')}
        </Button>
      </div>
    </form>
  );
};
