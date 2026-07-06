'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Controller, useForm } from 'react-hook-form';
// Data
import { postRecipeBookSchema, type PostRecipeBookPayload } from '@/data/recipe-books/types';
// Components
import { Button } from '@/components/Button';
import { FormBanner } from '@/components/FormBanner';
import { FormField } from '@/components/FormField';
import { ImageUpload } from '@/components/ImageUpload';
import { Textarea } from '@/components/Textarea';
import { TextInput } from '@/components/TextInput';
import { Toggle } from '@/components/Toggle';

type FormValues = PostRecipeBookPayload;

export const NewRecipeBookForm = () => {
  const router = useRouter();
  const t = useTranslations('recipeBooks');

  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(postRecipeBookSchema),
    defaultValues: { title: '', description: '', isPublic: false, coverImageUrl: '' },
  });

  const onSubmit = async (data: FormValues) => {
    const res = await fetch('/api/recipe-books', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const d = await res.json();
      setError('root', { message: d.error ?? 'Failed to create' });
      return;
    }
    const book = await res.json();
    router.push(`/my/recipe-books/${book.id}`);
  };

  const registerTitle = register('title');
  const registerDescription = register('description');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

      <FormField label={t('titleLabel')} error={errors.title?.message}>
        <TextInput
          type="text"
          placeholder={t('titlePlaceholder')}
          {...registerTitle}
        />
      </FormField>

      <FormField
        label={(
          <>
            {t('descriptionLabel')}
            {' '}
            <span className="font-normal text-stone-400 dark:text-stone-500">{t('descriptionOptional')}</span>
          </>
        )}
      >
        <Textarea
          rows={3}
          placeholder={t('descriptionPlaceholder')}
          {...registerDescription}
        />
      </FormField>

      <div>
        <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
          {t('coverPhotoLabel')}
          <span className="font-normal text-stone-400 dark:text-stone-500">{t('descriptionOptional')}</span>
        </label>
        <Controller
          name="coverImageUrl"
          control={control}
          render={({ field: { value, onChange } }) => (
            <ImageUpload
              value={value}
              onChange={onChange}
              onError={msg => setError('root', { message: msg })}
              label="Add cover photo"
            />
          )}
        />
      </div>

      <Controller
        name="isPublic"
        control={control}
        render={({ field: { value, onChange } }) => (
          <Toggle
            checked={value}
            onChange={onChange}
            label={value ? t('publicLabel') : t('privateLabel')}
          />
        )}
      />

      {errors.root && <FormBanner type="error" message={errors.root.message ?? ''} />}
      <div className="flex gap-3 pt-2">
        <Button type="submit" variant="primary" size="md" disabled={isSubmitting}>
          {isSubmitting ? t('creating') : t('create')}
        </Button>
        <Button type="button" variant="secondary" size="md" href="/my/recipe-books">
          {t('cancel')}
        </Button>
      </div>
    </form>
  );
};
