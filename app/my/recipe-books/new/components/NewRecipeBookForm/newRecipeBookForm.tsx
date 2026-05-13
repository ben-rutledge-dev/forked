'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
// Components
import { Button } from '@/components/Button';
import { FormBanner } from '@/components/FormBanner';
import { FormField } from '@/components/FormField';
import { ImageUpload } from '@/components/ImageUpload';
import { Textarea } from '@/components/Textarea';
import { TextInput } from '@/components/TextInput';
import { Toggle } from '@/components/Toggle';

export const NewRecipeBookForm = () => {
  const router = useRouter();
  const t = useTranslations('recipeBooks');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/recipe-books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, isPublic, coverImageUrl }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? 'Failed to create');
        return;
      }
      const book = await res.json();
      router.push(`/my/recipe-books/${book.id}`);
    }
    finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <FormBanner type="error" message={error} />}

      <div>
        <FormField label={t('titleLabel')}>
          <TextInput
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
            placeholder={t('titlePlaceholder')}
          />
        </FormField>
      </div>

      <div>
        <FormField
          label={(
            <>
              {t('descriptionLabel')}
              {' '}
              <span className="font-normal text-stone-400">{t('descriptionOptional')}</span>
            </>
          )}
        >
          <Textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={3}
            placeholder={t('descriptionPlaceholder')}
          />
        </FormField>
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-700 mb-2">
          {t('coverPhotoLabel')}
          <span className="font-normal text-stone-400">{t('descriptionOptional')}</span>
        </label>
        <ImageUpload
          value={coverImageUrl}
          onChange={setCoverImageUrl}
          onError={msg => setError(msg)}
          label="Add cover photo"
        />
      </div>

      <Toggle
        checked={isPublic}
        onChange={setIsPublic}
        label={isPublic ? t('publicLabel') : t('privateLabel')}
      />

      <div className="flex gap-3 pt-2">
        <Button type="submit" variant="primary" size="md" shape="pill" disabled={saving || !title.trim()}>
          {saving ? t('creating') : t('create')}
        </Button>
        <Button type="button" variant="secondary" size="md" shape="pill" href="/my/recipe-books">
          {t('cancel')}
        </Button>
      </div>
    </form>
  );
};
