'use client';

import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
// Components
import { Button } from '@/components/Button';
import { FormBanner } from '@/components/FormBanner';
import { IconButton } from '@/components/IconButton';
import { ImageUpload } from '@/components/ImageUpload';
import { Toast } from '@/components/Toast';
import { SectionHeading } from '@/components/Typography';
// Types
import { IngredientFormData, RecipeFormData, StepFormData } from '@/types';

type Props = {
  initialData?: Partial<RecipeFormData>
  recipeId?: string
  forkedFrom?: { id: string, title: string, isPublic: boolean } | null
};

const emptyIngredient = (): IngredientFormData => ({ name: '', quantity: '', unit: '' });
const emptyStep = (): StepFormData => ({ instruction: '', timerSeconds: '', imageUrl: '' });

export const RecipeForm = ({ initialData, recipeId, forkedFrom }: Props) => {
  const router = useRouter();
  const [title, setTitle] = useState(initialData?.title ?? '');
  const [description, setDescription] = useState(initialData?.description ?? '');
  const [isPublic, setIsPublic] = useState(initialData?.isPublic ?? false);
  const [coverImageUrl, setCoverImageUrl] = useState(initialData?.coverImageUrl ?? '');
  const [ingredients, setIngredients] = useState<IngredientFormData[]>(
    initialData?.ingredients?.length ? initialData.ingredients : [emptyIngredient()],
  );
  const [steps, setSteps] = useState<StepFormData[]>(
    initialData?.steps?.length ? initialData.steps : [emptyStep()],
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    const validIngredients = ingredients.filter(i => i.name.trim());
    const validSteps = steps.filter(s => s.instruction.trim());

    try {
      const url = recipeId ? `/api/recipes/${recipeId}` : '/api/recipes';
      const method = recipeId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          isPublic,
          coverImageUrl: coverImageUrl || null,
          ingredients: validIngredients,
          steps: validSteps,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? 'Something went wrong');
        return;
      }

      const recipe = await res.json();
      if (recipeId) {
        setSaved(true);
        setTimeout(() => setSaved(false), 4000);
        router.refresh();
      }
      else {
        router.push(`/my/recipes/${recipe.id}`);
      }
    }
    finally {
      setSaving(false);
    }
  };

  const updateIngredient = (i: number, field: keyof IngredientFormData, value: string) => {
    setIngredients(prev => prev.map((ing, idx) => (idx === i ? { ...ing, [field]: value } : ing)));
  };

  const removeIngredient = (i: number) => {
    setIngredients(prev => prev.filter((_, idx) => idx !== i));
  };

  const moveIngredient = (i: number, dir: -1 | 1) => {
    setIngredients((prev) => {
      const next = [...prev];
      [next[i], next[i + dir]] = [next[i + dir], next[i]];
      return next;
    });
  };

  const updateStep = (i: number, field: keyof StepFormData, value: string) => {
    setSteps(prev => prev.map((s, idx) => (idx === i ? { ...s, [field]: value } : s)));
  };

  const removeStep = (i: number) => {
    setSteps(prev => prev.filter((_, idx) => idx !== i));
  };

  const moveStep = (i: number, dir: -1 | 1) => {
    setSteps((prev) => {
      const next = [...prev];
      [next[i], next[i + dir]] = [next[i + dir], next[i]];
      return next;
    });
  };

  const insertStep = (afterIndex: number) => {
    setSteps((prev) => {
      const next = [...prev];
      next.splice(afterIndex + 1, 0, emptyStep());
      return next;
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {forkedFrom && (
        <p className="text-sm text-stone-500">
          Forked from
          {' '}
          {forkedFrom.isPublic
            ? (
                <a href={`/recipes/${forkedFrom.id}`} className="underline hover:text-stone-700">
                  {forkedFrom.title}
                </a>
              )
            : (
                <span>{forkedFrom.title}</span>
              )}
        </p>
      )}

      {error && <FormBanner type="error" message={error} />}
      {saved && <Toast message="Recipe saved!" />}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Title</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
            placeholder="Grandma's tomato sauce"
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900 placeholder-stone-400 focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Description</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={2}
            placeholder="A short description (optional)"
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900 placeholder-stone-400 focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500 resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2">Cover photo</label>
          <ImageUpload
            value={coverImageUrl}
            onChange={setCoverImageUrl}
            onError={msg => setError(msg)}
            label="Add cover photo"
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-stone-700 cursor-pointer">
          <input
            type="checkbox"
            checked={isPublic}
            onChange={e => setIsPublic(e.target.checked)}
            className="rounded border-stone-300"
          />
          Make this recipe public
        </label>
      </div>

      <div>
        <div className="mb-3">
          <SectionHeading>Ingredients</SectionHeading>
        </div>
        {/* Column headers */}
        <div className="flex items-center gap-2 mb-1 pl-15 pr-9">
          <span className="w-16 text-xs text-stone-400 font-medium">Qty</span>
          <span className="w-28 text-xs text-stone-400 font-medium">Unit</span>
          <span className="flex-1 text-xs text-stone-400 font-medium">Ingredient</span>
        </div>
        <div className="space-y-2">
          {ingredients.map((ing, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="flex flex-col gap-1 mr-1">
                <IconButton
                  type="button"
                  onClick={() => moveIngredient(i, -1)}
                  disabled={i === 0}
                >
                  ▲
                </IconButton>
                <IconButton
                  type="button"
                  onClick={() => moveIngredient(i, 1)}
                  disabled={i === ingredients.length - 1}
                >
                  ▼
                </IconButton>
              </div>
              <input
                type="text"
                value={ing.quantity}
                onChange={e => updateIngredient(i, 'quantity', e.target.value)}
                placeholder="e.g. 2"
                className="w-16 rounded-lg border border-stone-300 px-2 py-1.5 text-sm focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500"
              />
              <input
                type="text"
                value={ing.unit}
                onChange={e => updateIngredient(i, 'unit', e.target.value)}
                placeholder="e.g. cups"
                className="w-28 rounded-lg border border-stone-300 px-2 py-1.5 text-sm focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500"
              />
              <input
                type="text"
                value={ing.name}
                onChange={e => updateIngredient(i, 'name', e.target.value)}
                placeholder="e.g. flour"
                className="flex-1 rounded-lg border border-stone-300 px-2 py-1.5 text-sm focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500"
              />
              {/* Inline delete */}
              <button
                type="button"
                onClick={() => removeIngredient(i)}
                aria-label="Remove ingredient"
                className="flex-none flex items-center justify-center w-7 h-7 rounded-full border border-transparent text-stone-400 hover:bg-danger-50 hover:border-danger-300 hover:text-danger-500 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10" className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
                  <line x1="2" y1="2" x2="8" y2="8" />
                  <line x1="8" y1="2" x2="2" y2="8" />
                </svg>
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setIngredients(prev => [...prev, emptyIngredient()])}
          className="mt-2 w-full flex items-center gap-2 py-1 text-xs text-stone-400 hover:text-stone-600 transition-colors group"
        >
          <span className="flex-1 border-t border-dashed border-stone-200 group-hover:border-stone-400 transition-colors" />
          <span>+ add ingredient</span>
          <span className="flex-1 border-t border-dashed border-stone-200 group-hover:border-stone-400 transition-colors" />
        </button>
      </div>

      <div>
        <div className="mb-3">
          <SectionHeading>Steps</SectionHeading>
        </div>
        <div className="space-y-0">
          {steps.map((step, i) => (
            <div key={i}>
              <div className="flex gap-2 py-1.5">
                <div className="flex flex-col items-center gap-1 pt-1 mr-1">
                  <span className="text-xs text-stone-400 font-medium">{i + 1}</span>
                  <IconButton
                    type="button"
                    onClick={() => moveStep(i, -1)}
                    disabled={i === 0}
                  >
                    ▲
                  </IconButton>
                  <IconButton
                    type="button"
                    onClick={() => moveStep(i, 1)}
                    disabled={i === steps.length - 1}
                  >
                    ▼
                  </IconButton>
                </div>
                <div className="flex-1 space-y-2 min-w-0">
                  <div className="flex gap-2 items-center">
                    <textarea
                      value={step.instruction}
                      onChange={e => updateStep(i, 'instruction', e.target.value)}
                      rows={2}
                      placeholder={`Step ${i + 1} instruction`}
                      className="flex-1 rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-900 placeholder-stone-400 focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500 resize-none"
                    />
                    <button
                      type="button"
                      onClick={() => removeStep(i)}
                      aria-label="Remove step"
                      className="flex-none flex items-center justify-center w-7 h-7 rounded-full border border-transparent text-stone-400 hover:bg-danger-50 hover:border-danger-300 hover:text-danger-500 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10" className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
                        <line x1="2" y1="2" x2="8" y2="8" />
                        <line x1="8" y1="2" x2="2" y2="8" />
                      </svg>
                    </button>
                  </div>
                  <div className="flex items-center gap-4 flex-wrap pt-3">
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-stone-500">Timer (seconds)</label>
                      <input
                        type="number"
                        min="0"
                        value={step.timerSeconds}
                        onChange={e => updateStep(i, 'timerSeconds', e.target.value)}
                        placeholder="optional"
                        className="w-28 rounded-lg border border-stone-300 px-2 py-1 text-xs focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500"
                      />
                    </div>
                    <ImageUpload
                      value={step.imageUrl ?? ''}
                      onChange={url => updateStep(i, 'imageUrl', url)}
                      onError={msg => setError(msg)}
                      label="Add photo"
                      previewSize="sm"
                    />
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => insertStep(i)}
                className="w-full flex items-center gap-2 py-1 text-xs text-stone-400 hover:text-stone-600 transition-colors group"
              >
                <span className="flex-1 border-t border-dashed border-stone-200 group-hover:border-stone-400 transition-colors" />
                <span>+ add step</span>
                <span className="flex-1 border-t border-dashed border-stone-200 group-hover:border-stone-400 transition-colors" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button
          type="submit"
          variant="neutral"
          size="lg"
          shape="pill"
          disabled={saving}
        >
          {saving ? 'Saving…' : recipeId ? 'Save changes' : 'Create recipe'}
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="lg"
          shape="pill"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
};
