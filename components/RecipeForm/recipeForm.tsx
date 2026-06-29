'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
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

const recipeSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string(),
  isPublic: z.boolean(),
  coverImageUrl: z.string(),
});
type RecipeFormValues = z.infer<typeof recipeSchema>;

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

  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RecipeFormValues>({
    resolver: zodResolver(recipeSchema),
    defaultValues: {
      title: initialData?.title ?? '',
      description: initialData?.description ?? '',
      isPublic: initialData?.isPublic ?? false,
      coverImageUrl: initialData?.coverImageUrl ?? '',
    },
  });

  const [selectedCategoryIds, setSelectedCategoryIds] = useState<Set<string>>(
    new Set(initialData?.categoryIds ?? []),
  );
  const [tags, setTags] = useState<string[]>(initialData?.tags ?? []);
  const [addedTags, setAddedTags] = useState<string[]>([]);
  const [removedFromPool, setRemovedFromPool] = useState<Set<string>>(new Set());
  const [tagInput, setTagInput] = useState('');
  const [saved, setSaved] = useState(false);

  const { data: myTagsData } = useMyTags();

  const tagPool = useMemo(() => {
    const pool = new Set([
      ...(initialData?.tags ?? []),
      ...(myTagsData?.tags ?? []),
      ...addedTags,
    ]);
    removedFromPool.forEach(tag => pool.delete(tag));
    return Array.from(pool);
  }, [initialData?.tags, myTagsData?.tags, addedTags, removedFromPool]);

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

  const ingredientActions = useListField(setIngredients);
  const stepActions = useListField(setSteps);

  const onSubmit = async (data: RecipeFormValues) => {
    if (data.isPublic && selectedCategoryIds.size === 0) {
      setError('root', { message: t('categoryRequired') });
      return;
    }

    const validIngredients = ingredients
      .map(i => ({ id: i.id, name: i.name, quantity: i.quantity, unit: i.unit, unitKey: i.unitKey ?? null }));

    const validSteps = steps
      .map(s => ({ id: s.id, instruction: s.instruction, timerSeconds: s.timerSeconds, imageUrl: s.imageUrl }));

    const url = recipeId ? `/api/recipes/${recipeId}` : '/api/recipes';
    const method = recipeId ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        coverImageUrl: data.coverImageUrl || null,
        ingredients: validIngredients,
        steps: validSteps,
        categoryIds: Array.from(selectedCategoryIds),
        tags,
      }),
    });

    if (!res.ok) {
      const d = await res.json();
      setError('root', { message: d.error ?? t('somethingWentWrong') });
      return;
    }

    const recipe = await res.json();

    if (recipeId) {
      setSaved(true);
      setTimeout(() => setSaved(false), 4000);
      router.refresh();
    }
    else {
      router.push(`/recipes/${recipe.id}`);
    }
  };

  const noCategoriesSelected = selectedCategoryIds.size === 0;

  const registerTitle = register('title');
  const registerDescription = register('description');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
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

      {saved && <Toast message={t('saved')} />}

      <div className="space-y-4">
        <FormField label={t('titleLabel')} error={errors.title?.message}>
          <TextInput
            type="text"
            placeholder={t('titlePlaceholder')}
            {...registerTitle}
          />
        </FormField>

        <FormField label={t('descriptionLabel')}>
          <Textarea
            rows={2}
            placeholder={t('descriptionPlaceholder')}
            {...registerDescription}
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
          <Controller
            name="coverImageUrl"
            control={control}
            render={({ field: { value, onChange } }) => (
              <ImageUpload
                value={value}
                onChange={onChange}
                onError={msg => setError('root', { message: msg })}
                label={t('coverPhotoLabel')}
              />
            )}
          />
        </div>

        <Controller
          name="isPublic"
          control={control}
          render={({ field: { value, onChange } }) => (
            <div>
              <Checkbox
                checked={value}
                onChange={e => onChange(e.target.checked)}
                label={t('makePublicLabel')}
                disabled={noCategoriesSelected && !value}
              />
              {noCategoriesSelected && !value && (
                <p className="mt-1 text-xs text-stone-400">
                  {t('categoryRequired')}
                </p>
              )}
            </div>
          )}
        />
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
        onError={msg => setError('root', { message: msg })}
      />

      {errors.root && <FormBanner type="error" message={errors.root.message ?? ''} />}
      <div className="flex gap-3 pt-2">
        <Button
          type="submit"
          variant="neutral"
          size="lg"
          disabled={isSubmitting}
        >
          {isSubmitting ? t('saving') : recipeId ? t('saveChanges') : t('createRecipe')}
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="lg"
          onClick={() => router.back()}
        >
          {t('cancel')}
        </Button>
      </div>
    </form>
  );
};
