'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
// Components
import { Button } from '@/components/Button';
import { FormBanner } from '@/components/FormBanner';
import { ImageUpload } from '@/components/ImageUpload';

export const NewRecipeBookForm = () => {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
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
        <label className="block text-sm font-medium text-stone-700 mb-1">Title</label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
          className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="My favourite weeknight dinners"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1">
          Description
          {' '}
          <span className="font-normal text-stone-400">(optional)</span>
        </label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
          placeholder="A short description of this collection…"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-700 mb-2">
          Cover photo
          <span className="font-normal text-stone-400">(optional)</span>
        </label>
        <ImageUpload
          value={coverImageUrl}
          onChange={setCoverImageUrl}
          onError={msg => setError(msg)}
          label="Add cover photo"
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          role="switch"
          aria-checked={isPublic}
          onClick={() => setIsPublic(v => !v)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            isPublic ? 'bg-primary-500' : 'bg-stone-300'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
              isPublic ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
        <span className="text-sm text-stone-700">
          {isPublic ? 'Public' : 'Private'}
          {' '}
          recipe book
        </span>
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" variant="primary" size="md" shape="pill" disabled={saving || !title.trim()}>
          {saving ? 'Creating…' : 'Create recipe book'}
        </Button>
        <Button type="button" variant="secondary" size="md" shape="pill" href="/my/recipe-books">
          Cancel
        </Button>
      </div>
    </form>
  );
};
