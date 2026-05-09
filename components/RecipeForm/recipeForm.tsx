'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
// Hooks
import { useListField } from '@/hooks/useListField';
// Components
import { FormIngredients } from './components/FormIngredients';
import { FormSteps } from './components/FormSteps';
import { Button } from '@/components/Button';
import { Checkbox } from '@/components/Checkbox';
import { FormBanner } from '@/components/FormBanner';
import { FormField } from '@/components/FormField';
import { ImageUpload } from '@/components/ImageUpload';
import { Textarea } from '@/components/Textarea';
import { TextInput } from '@/components/TextInput';
import { Toast } from '@/components/Toast';
// Types
import { IngredientFormData, RecipeFormData, StepFormData } from '@/types';

type Props = {
  initialData?: Partial<RecipeFormData>
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
  unit: '',
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

  const [fields, setFields] = useState<RecipeFields>({
    title: initialData?.title ?? '',
    description: initialData?.description ?? '',
    isPublic: initialData?.isPublic ?? false,
    coverImageUrl: initialData?.coverImageUrl ?? '',
  });

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

  const ingredientActions = useListField(setIngredients);
  const stepActions = useListField(setSteps);

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage('');
    setStatus('saving');

    const validIngredients = ingredients
      .filter(i => i.name.trim())
      .map(({ _id, ...rest }) => rest);

    const validSteps = steps
      .filter(s => s.instruction.trim())
      .map(({ _id, ...rest }) => rest);

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
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setErrorMessage(data.error ?? 'Something went wrong');
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
      setErrorMessage('Something went wrong');
      setStatus('error');
    }
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

      {status === 'error' && <FormBanner type="error" message={errorMessage} />}
      {status === 'saved' && <Toast message="Recipe saved!" />}

      <div className="space-y-4">
        <FormField label="Title">
          <TextInput
            type="text"
            value={fields.title}
            onChange={e => setField('title', e.target.value)}
            required
            placeholder="Grandma's tomato sauce"
          />
        </FormField>

        <FormField label="Description">
          <Textarea
            value={fields.description}
            onChange={e => setField('description', e.target.value)}
            rows={2}
            placeholder="A short description (optional)"
          />
        </FormField>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2">Cover photo</label>
          <ImageUpload
            value={fields.coverImageUrl}
            onChange={url => setField('coverImageUrl', url)}
            onError={msg => setErrorMessage(msg)}
            label="Add cover photo"
          />
        </div>

        <Checkbox
          checked={fields.isPublic}
          onChange={e => setField('isPublic', e.target.checked)}
          label="Make this recipe public"
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
          {status === 'saving' ? 'Saving…' : recipeId ? 'Save changes' : 'Create recipe'}
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
