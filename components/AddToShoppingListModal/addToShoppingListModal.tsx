'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
// Data
import { useShoppingLists, usePostShoppingList } from '@/data/shopping-lists';
import { usePostItems } from '@/data/shopping-lists/[shoppingListId]/items';
// Components
import { Button } from '@/components/Button';
import { Checkbox } from '@/components/Checkbox';
import { ModalHeading } from '@/components/Typography';

type Ingredient = {
  id: string
  name: string
};

type RecipeFlowProps = {
  recipeId: string
  recipeTitle: string
  onConfirm: (value: unknown) => void
};

type SuggestionFlowProps = {
  ingredients: Array<{ name: string }>
  onConfirm: (value: unknown) => void
};

export type AddToShoppingListModalProps = RecipeFlowProps | SuggestionFlowProps;

const isRecipeFlow = (props: AddToShoppingListModalProps): props is RecipeFlowProps =>
  'recipeId' in props;

type Stage = 1 | 2;

// ─── Modal root ───────────────────────────────────────────────────────────────

export const AddToShoppingListModal = (props: AddToShoppingListModalProps) => {
  const t = useTranslations('addToShoppingList');
  const { onConfirm } = props;
  const [stage, setStage] = useState<Stage>(isRecipeFlow(props) ? 1 : 2);
  const [ingredients, setIngredients] = useState<Ingredient[]>(() => {
    if (isRecipeFlow(props)) return [];
    return props.ingredients.map(i => ({ id: i.name, name: i.name }));
  });
  const [ingredientsLoading, setIngredientsLoading] = useState(isRecipeFlow(props));
  const [selected, setSelected] = useState<Set<string>>(() => {
    if (isRecipeFlow(props)) return new Set();
    return new Set(props.ingredients.map(i => i.name));
  });
  const [chosenListId, setChosenListId] = useState<string | null>(null);
  const [firstSectionId, setFirstSectionId] = useState<string | null>(null);
  const pendingSectionFetch = useRef<Promise<string | null>>(Promise.resolve(null));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: listsData } = useShoppingLists();
  const lists = listsData?.lists ?? [];

  const { mutateAsync: createList } = usePostShoppingList();
  const { mutateAsync: postItems } = usePostItems({ shoppingListId: chosenListId ?? undefined });

  useEffect(() => {
    if (!isRecipeFlow(props)) return;
    fetch(`/api/recipes/${props.recipeId}`)
      .then(r => r.json())
      .then((data) => {
        const fetched: Ingredient[] = (data.ingredients ?? []).map((i: Ingredient) => ({ id: i.id, name: i.name }));
        setIngredients(fetched);
        setSelected(new Set(fetched.map(i => i.id)));
      })
      .finally(() => setIngredientsLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedIngredients = ingredients.filter(i => selected.has(i.id));

  const handleToggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleToggleAll = () => {
    if (selected.size === ingredients.length) setSelected(new Set());
    else setSelected(new Set(ingredients.map(i => i.id)));
  };

  const handleSelectList = (listId: string) => {
    setChosenListId(listId);
    setFirstSectionId(null);
    pendingSectionFetch.current = fetch(`/api/shopping-lists/${listId}`)
      .then(r => r.json())
      .then((data) => {
        const sections: Array<{ id: string }> = data.sections ?? [];
        const id = sections[0]?.id ?? null;
        setFirstSectionId(id);
        return id;
      });
  };

  const handleCreateList = async (title: string) => {
    const newList = await createList({ title: title.trim() });
    handleSelectList(newList.id);
  };

  const handleSubmit = async () => {
    if (!chosenListId) return;
    const sectionId = firstSectionId ?? await pendingSectionFetch.current;
    if (!sectionId) return;
    setError(null);
    setSubmitting(true);
    try {
      const recipeContext = isRecipeFlow(props)
        ? { recipeId: props.recipeId, recipeTitle: props.recipeTitle }
        : {};
      const items = selectedIngredients.map(ing => ({
        name: ing.name,
        sectionId,
        ...recipeContext,
      }));
      await postItems({ items });
      const listName = lists.find(l => l.id === chosenListId)?.title ?? 'list';
      onConfirm({ success: true, count: items.length, listName });
    }
    catch {
      setError(t('errorMessage'));
    }
    finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6">
      {stage === 1 && (
        <StageOne
          recipeTitle={isRecipeFlow(props) ? props.recipeTitle : null}
          ingredients={ingredients}
          ingredientsLoading={ingredientsLoading}
          selected={selected}
          onToggle={handleToggle}
          onToggleAll={handleToggleAll}
          onCancel={() => onConfirm(null)}
          onNext={() => setStage(2)}
        />
      )}
      {stage === 2 && (
        <StageTwo
          lists={lists}
          chosenListId={chosenListId}
          onSelectList={handleSelectList}
          onCreateList={handleCreateList}
          error={error}
          submitting={submitting}
          selectedCount={selectedIngredients.length}
          onBack={() => setStage(1)}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
};

// ─── Stage 1: Select ingredients ─────────────────────────────────────────────

type StageOneProps = {
  recipeTitle: string | null
  ingredients: Ingredient[]
  ingredientsLoading: boolean
  selected: Set<string>
  onToggle: (id: string) => void
  onToggleAll: () => void
  onCancel: () => void
  onNext: () => void
};

const StageOne = ({
  recipeTitle,
  ingredients,
  ingredientsLoading,
  selected,
  onToggle,
  onToggleAll,
  onCancel,
  onNext,
}: StageOneProps) => {
  const t = useTranslations('addToShoppingList');
  return (
    <>
      <ModalHeading className="mb-1">{t('modalHeading')}</ModalHeading>
      {recipeTitle && <p className="text-sm text-stone-500 mb-4">{recipeTitle}</p>}

      <div className="flex justify-between items-center mb-3">
        <span className="text-sm font-medium text-stone-600">{t('ingredientsLabel')}</span>
        {!ingredientsLoading && (
          <button className="text-xs text-primary-500 hover:underline" onClick={onToggleAll}>
            {selected.size === ingredients.length ? t('deselectAll') : t('selectAll')}
          </button>
        )}
      </div>

      {ingredientsLoading
        ? (
            <div className="space-y-3 mb-6">
              {[1, 2, 3].map(n => (
                <div key={n} className="h-5 bg-stone-100 rounded animate-pulse" />
              ))}
            </div>
          )
        : (
            <ul className="space-y-2 max-h-72 overflow-y-auto mb-6">
              {ingredients.map(ing => (
                <li key={ing.id}>
                  <Checkbox
                    id={`ing-${ing.id}`}
                    checked={selected.has(ing.id)}
                    onChange={() => onToggle(ing.id)}
                    label={ing.name}
                  />
                </li>
              ))}
            </ul>
          )}

      <div className="flex justify-end gap-2">
        <Button variant="secondary" size="sm" onClick={onCancel}>
          {t('cancel')}
        </Button>
        <Button
          variant="primary"
          size="sm"
          disabled={ingredientsLoading || selected.size === 0}
          onClick={onNext}
        >
          {t('next')}
        </Button>
      </div>
    </>
  );
};

// ─── Stage 2: Select list ─────────────────────────────────────────────────────

const newListSchema = z.object({
  title: z.string().min(1, 'List name is required').max(100),
});
type NewListForm = z.infer<typeof newListSchema>;

type ListItem = { id: string, title: string, uncheckedCount: number };

type StageTwoProps = {
  lists: ListItem[]
  chosenListId: string | null
  onSelectList: (id: string) => void
  onCreateList: (title: string) => Promise<void>
  error: string | null
  submitting: boolean
  selectedCount: number
  onBack: () => void
  onSubmit: () => void
};

const StageTwo = ({
  lists,
  chosenListId,
  onSelectList,
  onCreateList,
  error,
  submitting,
  selectedCount,
  onBack,
  onSubmit,
}: StageTwoProps) => {
  const t = useTranslations('addToShoppingList');
  const [creatingList, setCreatingList] = useState(false);

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<NewListForm>({
    resolver: zodResolver(newListSchema),
  });

  const registerTitle = register('title');

  const onNewList = async (data: NewListForm) => {
    await onCreateList(data.title);
    reset();
    setCreatingList(false);
  };

  return (
    <>
      <ModalHeading className="mb-4">{t('chooseListHeading')}</ModalHeading>

      <ul className="space-y-2 max-h-72 overflow-y-auto mb-4">
        {lists.map(list => (
          <li key={list.id}>
            <button
              className={`w-full text-left rounded-lg border px-4 py-3 text-sm transition-colors ${
                chosenListId === list.id
                  ? 'border-primary-400 bg-primary-50'
                  : 'border-stone-200 hover:border-stone-300'
              }`}
              onClick={() => onSelectList(list.id)}
            >
              <span className="font-medium">{list.title}</span>
              <span className="ml-2 text-stone-400">
                {t('itemCount', { count: list.uncheckedCount })}
              </span>
            </button>
          </li>
        ))}
      </ul>

      {creatingList
        ? (
            <form onSubmit={handleSubmit(onNewList)} className="flex gap-2 mb-4">
              <input
                autoFocus
                className="flex-1 rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
                placeholder={t('newListPlaceholder')}
                {...registerTitle}
              />
              <Button type="submit" variant="primary" size="sm" disabled={isSubmitting}>
                {isSubmitting ? t('creating') : t('create')}
              </Button>
            </form>
          )
        : (
            <button
              className="text-sm text-primary-500 hover:underline mb-4"
              onClick={() => setCreatingList(true)}
            >
              {t('newList')}
            </button>
          )}

      {error && <p className="text-sm text-danger-600 mb-3">{error}</p>}

      <div className="flex justify-between">
        <Button variant="secondary" size="sm" onClick={onBack}>
          {t('back')}
        </Button>
        <Button
          variant="primary"
          size="sm"
          disabled={!chosenListId || submitting}
          onClick={onSubmit}
        >
          {submitting ? t('adding') : t('addItems', { count: selectedCount })}
        </Button>
      </div>
    </>
  );
};
