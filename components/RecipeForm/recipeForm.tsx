'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
// Data
import { useCategories } from '@/data/categories';
import type { Category } from '@/data/categories/types';
import { useMyTags } from '@/data/tags';
// Hooks
import { useListField } from '@/hooks/useListField';
// Components
import { FormIngredients } from './components/FormIngredients';
import { FormSteps } from './components/FormSteps';
import { Button } from '@/components/Button';
import { CategoryPillButton } from '@/components/CategoryPill';
import { Checkbox } from '@/components/Checkbox';
import { CornerDeleteButton } from '@/components/CornerDeleteButton';
import { FormBanner } from '@/components/FormBanner';
import { FormField } from '@/components/FormField';
import { ImageUpload } from '@/components/ImageUpload';
import { Textarea } from '@/components/Textarea';
import { TextInput } from '@/components/TextInput';
import { Toast } from '@/components/Toast';
import { SectionLabel } from '@/components/Typography';
// Types
import { IngredientFormData, RecipeFormData, StepFormData } from '@/types';
// Lib
import { GROUP_LABELS, CATEGORY_GROUP_ORDER } from '@/lib/categories';

type Props = {
  initialData?: Partial<RecipeFormData & { categoryIds?: string[], tags?: string[] }>
  recipeId?: string
  forkedFrom?: { id: string, title: string, isPublic: boolean } | null
};

type Status = 'idle' | 'saving' | 'saved' | 'error';

type RecipeFields = {
  title: string
  description: string
  isPublic: boolean
  coverImageUrl: string
};

export type IngredientItem = IngredientFormData & { _id: string };
export type StepItem = StepFormData & { _id: string };

const newId = () => crypto.randomUUID();

export const emptyIngredient = (): IngredientItem => ({
  _id: newId(),
  name: '',
  quantity: '',
  unit: null,
  unitKey: null,
});

export const emptyStep = (): StepItem => ({
  _id: newId(),
  instruction: '',
  timerSeconds: '',
  imageUrl: '',
});

const withIds = <T extends object>(items: T[]): (T & { _id: string })[] =>
  items.map(item => ({ ...item, _id: newId() }));

export const RecipeForm = ({ initialData, recipeId, forkedFrom }: Props) => {
  const router = useRouter();
  const t = useTranslations('recipeForm');
  const { data: categoriesData, isLoading: categoriesLoading } = useCategories();

  const [fields, setFields] = useState<RecipeFields>({
    title: initialData?.title ?? '',
    description: initialData?.description ?? '',
    isPublic: initialData?.isPublic ?? false,
    coverImageUrl: initialData?.coverImageUrl ?? '',
  });

  const [selectedCategoryIds, setSelectedCategoryIds] = useState<Set<string>>(
    new Set(initialData?.categoryIds ?? []),
  );
  const [tags, setTags] = useState<string[]>(initialData?.tags ?? []);
  const [addedTags, setAddedTags] = useState<string[]>([]);
  const [removedFromPool, setRemovedFromPool] = useState<Set<string>>(new Set());
  const [tagInput, setTagInput] = useState('');

  const { data: myTagsData } = useMyTags();

  // Derive the pool from initial recipe tags + user's all-time tags + locally added, minus removed
  const tagPool = useMemo(() => {
    const pool = new Set([
      ...(initialData?.tags ?? []),
      ...(myTagsData?.tags ?? []),
      ...addedTags,
    ]);
    removedFromPool.forEach(t => pool.delete(t));
    return Array.from(pool);
  }, [initialData?.tags, myTagsData?.tags, addedTags, removedFromPool]);

  const [status, setStatus] = useState<Status>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const [ingredients, setIngredients] = useState<IngredientItem[]>(
    initialData?.ingredients?.length
      ? withIds(initialData.ingredients)
      : [emptyIngredient()],
  );

  const [steps, setSteps] = useState<StepItem[]>(
    initialData?.steps?.length
      ? withIds(initialData.steps)
      : [emptyStep()],
  );

  const setField = <K extends keyof RecipeFields>(key: K, value: RecipeFields[K]) =>
    setFields(prev => ({ ...prev, [key]: value }));

  const toggleCategory = (id: string) => {
    setSelectedCategoryIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleTag = (tag: string) =>
    setTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);

  const removeTagFromPool = (tag: string) => {
    setRemovedFromPool(prev => new Set([...prev, tag]));
    setTags(prev => prev.filter(t => t !== tag));
    setAddedTags(prev => prev.filter(t => t !== tag));
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    const raw = tagInput.trim().toLowerCase();
    if (!raw) return;
    setRemovedFromPool((prev) => {
      const next = new Set(prev);
      next.delete(raw);
      return next;
    });
    if (!tagPool.includes(raw)) setAddedTags(prev => [...prev, raw]);
    if (!tags.includes(raw)) setTags(prev => [...prev, raw]);
    setTagInput('');
  };

  const handleIsPublicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setField('isPublic', e.target.checked);
  };

  const ingredientActions = useListField(setIngredients);
  const stepActions = useListField(setSteps);

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage('');
    setStatus('saving');

    if (fields.isPublic && selectedCategoryIds.size === 0) {
      setErrorMessage(t('categoryRequired'));
      setStatus('error');
      return;
    }

    const validIngredients = ingredients
      .map(i => ({ id: i.id, name: i.name, quantity: i.quantity, unit: i.unit, unitKey: i.unitKey ?? null }));

    const validSteps = steps
      .map(s => ({ id: s.id, instruction: s.instruction, timerSeconds: s.timerSeconds, imageUrl: s.imageUrl }));

    try {
      const url = recipeId ? `/api/recipes/${recipeId}` : '/api/recipes';
      const method = recipeId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...fields,
          coverImageUrl: fields.coverImageUrl || null,
          ingredients: validIngredients,
          steps: validSteps,
          categoryIds: Array.from(selectedCategoryIds),
          tags,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setErrorMessage(data.error ?? t('somethingWentWrong'));
        setStatus('error');
        return;
      }

      const recipe = await res.json();

      if (recipeId) {
        setStatus('saved');
        setTimeout(() => setStatus('idle'), 4000);
        router.refresh();
      }
      else {
        router.push(`/my/recipes/${recipe.id}`);
      }
    }
    catch {
      setErrorMessage(t('somethingWentWrong'));
      setStatus('error');
    }
  };

  const noCategoriesSelected = selectedCategoryIds.size === 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {forkedFrom && (
        <p className="text-sm text-stone-500">
          {t('forkedFrom')}
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

      {status === 'error' && <FormBanner type="error" message={errorMessage} />}
      {status === 'saved' && <Toast message={t('saved')} />}

      <div className="space-y-4">
        <FormField label={t('titleLabel')}>
          <TextInput
            type="text"
            value={fields.title}
            onChange={e => setField('title', e.target.value)}
            required
            placeholder={t('titlePlaceholder')}
          />
        </FormField>

        <FormField label={t('descriptionLabel')}>
          <Textarea
            value={fields.description}
            onChange={e => setField('description', e.target.value)}
            rows={2}
            placeholder={t('descriptionPlaceholder')}
          />
        </FormField>

        {/* Categories + My Tags */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2">{t('categoriesLabel')}</label>
          {categoriesLoading
            ? <p className="text-sm text-stone-400">{t('loadingCategories')}</p>
            : (
                <div className="space-y-3">
                  {CATEGORY_GROUP_ORDER.map((group) => {
                    const cats: Category[] = categoriesData?.[group] ?? [];
                    if (cats.length === 0) return null;
                    return (
                      <div key={group}>
                        <SectionLabel className="mb-1.5">{GROUP_LABELS[group]}</SectionLabel>
                        <div className="flex flex-wrap gap-1.5">
                          {cats.map(cat => (
                            <CategoryPillButton
                              key={cat.id}
                              active={selectedCategoryIds.has(cat.id)}
                              onClick={() => toggleCategory(cat.id)}
                            >
                              {cat.label}
                            </CategoryPillButton>
                          ))}
                        </div>
                      </div>
                    );
                  })}

                  {/* My Tags — same pill style, with hover delete */}
                  <div>
                    <SectionLabel className="mb-1.5">{t('myTagsLabel')}</SectionLabel>
                    <div className="flex flex-wrap gap-1.5">
                      {tagPool.map(tag => (
                        <div key={tag} className="relative group/tag">
                          <CategoryPillButton
                            active={tags.includes(tag)}
                            onClick={() => toggleTag(tag)}
                          >
                            {tag}
                          </CategoryPillButton>
                          <span className="opacity-0 group-hover/tag:opacity-100 transition-opacity">
                            <CornerDeleteButton onClick={() => removeTagFromPool(tag)} label={`Remove ${tag}`} />
                          </span>
                        </div>
                      ))}
                    </div>
                    <input
                      type="text"
                      value={tagInput}
                      onChange={e => setTagInput(e.target.value)}
                      onKeyDown={handleTagInputKeyDown}
                      placeholder={t('tagPlaceholder')}
                      className="mt-2 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-900 placeholder-stone-400 focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500"
                    />
                  </div>
                </div>
              )}
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2">{t('coverPhotoLabel')}</label>
          <ImageUpload
            value={fields.coverImageUrl}
            onChange={url => setField('coverImageUrl', url)}
            onError={msg => setErrorMessage(msg)}
            label={t('coverPhotoLabel')}
          />
        </div>

        <div>
          <Checkbox
            checked={fields.isPublic}
            onChange={handleIsPublicChange}
            label={t('makePublicLabel')}
            disabled={noCategoriesSelected && !fields.isPublic}
          />
          {noCategoriesSelected && !fields.isPublic && (
            <p className="mt-1 text-xs text-stone-400">
              {t('categoryRequired')}
            </p>
          )}
        </div>
      </div>

      <FormIngredients
        ingredients={ingredients}
        actions={ingredientActions}
        emptyIngredient={emptyIngredient}
      />

      <FormSteps
        steps={steps}
        actions={stepActions}
        emptyStep={emptyStep}
        onError={msg => setErrorMessage(msg)}
      />

      <div className="flex gap-3 pt-2">
        <Button
          type="submit"
          variant="neutral"
          size="lg"
          shape="pill"
          disabled={status === 'saving'}
        >
          {status === 'saving' ? t('saving') : recipeId ? t('saveChanges') : t('createRecipe')}
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="lg"
          shape="pill"
          onClick={() => router.back()}
        >
          {t('cancel')}
        </Button>
      </div>
    </form>
  );
};
