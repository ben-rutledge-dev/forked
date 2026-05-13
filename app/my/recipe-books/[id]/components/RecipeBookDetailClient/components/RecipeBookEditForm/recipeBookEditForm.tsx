'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
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

type EditFields = {
  title: string
  description: string
  isPublic: boolean
  coverImageUrl: string
};

type EditStatus = 'idle' | 'saving' | 'error';

type Props = {
  book: RecipeBookDetail
  onSaved: (updated: Partial<RecipeBookDetail>) => void
  onCancel: () => void
};

export const RecipeBookEditForm = ({ book, onSaved, onCancel }: Props) => {
  const [fields, setFields] = useState<EditFields>({
    title: book.title,
    description: book.description ?? '',
    isPublic: book.isPublic,
    coverImageUrl: book.coverImageUrl ?? '',
  });
  const [status, setStatus] = useState<EditStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const t = useTranslations('recipeBooks');

  const setField = <K extends keyof EditFields>(key: K, value: EditFields[K]) =>
    setFields(prev => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('saving');
    setErrorMessage('');
    try {
      const res = await fetch(`/api/recipe-books/${book.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...fields, coverImageUrl: fields.coverImageUrl || null }),
      });
      if (!res.ok) {
        const d = await res.json();
        setErrorMessage(d.error ?? 'Something went wrong');
        setStatus('error');
        return;
      }
      onSaved({
        title: fields.title,
        description: fields.description || null,
        isPublic: fields.isPublic,
        coverImageUrl: fields.coverImageUrl || null,
      });
    }
    catch {
      setErrorMessage('Something went wrong');
      setStatus('error');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 rounded-xl border border-stone-200 bg-stone-50 p-5 space-y-4 mb-6">
      {status === 'error' && <FormBanner type="error" message={errorMessage} />}
      <FormField label={t('editTitleLabel')}>
        <TextInput value={fields.title} onChange={e => setField('title', e.target.value)} required />
      </FormField>
      <FormField label={t('editDescriptionLabel')}>
        <Textarea value={fields.description} onChange={e => setField('description', e.target.value)} rows={2} />
      </FormField>
      <FormField label={t('editCoverPhotoLabel')}>
        <ImageUpload
          value={fields.coverImageUrl}
          onChange={url => setField('coverImageUrl', url)}
          onError={msg => setErrorMessage(msg)}
          label={t('editAddCoverPhoto')}
        />
      </FormField>
      <Checkbox
        checked={fields.isPublic}
        onChange={e => setField('isPublic', e.target.checked)}
        label={t('editMakePublicLabel')}
      />
      <div className="flex gap-2">
        <Button type="submit" variant="primary" size="sm" shape="pill" disabled={status === 'saving'}>
          {status === 'saving' ? t('editSaving') : t('editSave')}
        </Button>
        <Button type="button" variant="secondary" size="sm" shape="pill" onClick={onCancel}>
          {t('editCancel')}
        </Button>
      </div>
    </form>
  );
};
