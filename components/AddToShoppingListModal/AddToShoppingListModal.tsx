'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
// Data
import { useShoppingLists, usePostShoppingList } from '@/data/shopping-lists';
import { usePostItems } from '@/data/shopping-lists/[shoppingListId]/items';
// Components
import { Button } from '@/components/Button';
import { Checkbox } from '@/components/Checkbox';

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

export const AddToShoppingListModal = (props: AddToShoppingListModalProps) => {
  const t = useTranslations('addToShoppingList');
  const { onConfirm } = props;
  const [stage, setStage] = useState<Stage>(isRecipeFlow(props) ? 1 : 2);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [ingredientsLoading, setIngredientsLoading] = useState(isRecipeFlow(props));
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [chosenListId, setChosenListId] = useState<string | null>(null);
  const [firstSectionId, setFirstSectionId] = useState<string | null>(null);
  const pendingSectionFetch = useRef<Promise<string | null>>(Promise.resolve(null));
  const [newListTitle, setNewListTitle] = useState('');
  const [creatingList, setCreatingList] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: listsData } = useShoppingLists();
  const lists = listsData?.lists ?? [];

  const { mutateAsync: createList, isPending: creatingListPending } = usePostShoppingList();
  const { mutateAsync: postItems } = usePostItems({ shoppingListId: chosenListId ?? undefined });

  // Recipe flow: fetch ingredients from the API
  useEffect(() => {
    if (!isRecipeFlow(props)) return;
    fetch(`/api/recipes/${props.recipeId}`)
      .then(r => r.json())
      .then((data) => {
        const ings: Ingredient[] = (data.ingredients ?? []).map((i: Ingredient) => ({ id: i.id, name: i.name }));
        setIngredients(ings);
        setSelected(new Set(ings.map(i => i.id)));
      })
      .finally(() => setIngredientsLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Suggestion flow: seed ingredients from props immediately
  useEffect(() => {
    if (isRecipeFlow(props)) return;
    const ings: Ingredient[] = props.ingredients.map(i => ({ id: i.name, name: i.name }));
    setIngredients(ings);
    setSelected(new Set(ings.map(i => i.id)));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedIngredients = ingredients.filter(i => selected.has(i.id));

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

  const handleCreateList = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!newListTitle.trim()) return;
    const newList = await createList({ title: newListTitle.trim() });
    setNewListTitle('');
    setCreatingList(false);
    await handleSelectList(newList.id);
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

  const recipeTitle = isRecipeFlow(props) ? props.recipeTitle : null;

  return (
    <div className="p-6">

      {/* Stage 1: Select ingredients */}
      {stage === 1 && (
        <>
          <h2 className="text-lg font-semibold text-stone-800 mb-1">{t('modalHeading')}</h2>
          {recipeTitle && <p className="text-sm text-stone-500 mb-4">{recipeTitle}</p>}

          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-medium text-stone-600">{t('ingredientsLabel')}</span>
            {!ingredientsLoading && (
              <button className="text-xs text-primary-500 hover:underline" onClick={handleToggleAll}>
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
                        onChange={() => {
                          setSelected((prev) => {
                            const next = new Set(prev);
                            if (next.has(ing.id)) next.delete(ing.id);
                            else next.add(ing.id);
                            return next;
                          });
                        }}
                        label={ing.name}
                      />
                    </li>
                  ))}
                </ul>
              )}

          <div className="flex justify-end gap-2">
            <Button variant="secondary" size="sm" shape="pill" onClick={() => onConfirm(null)}>
              {t('cancel')}
            </Button>
            <Button
              variant="primary"
              size="sm"
              shape="pill"
              disabled={ingredientsLoading || selected.size === 0}
              onClick={() => setStage(2)}
            >
              {t('next')}
            </Button>
          </div>
        </>
      )}

      {/* Stage 2: Select list and submit */}
      {stage === 2 && (
        <>
          <h2 className="text-lg font-semibold text-stone-800 mb-4">{t('chooseListHeading')}</h2>

          <ul className="space-y-2 max-h-72 overflow-y-auto mb-4">
            {lists.map(list => (
              <li key={list.id}>
                <button
                  className={`w-full text-left rounded-lg border px-4 py-3 text-sm transition-colors ${
                    chosenListId === list.id
                      ? 'border-primary-400 bg-primary-50'
                      : 'border-stone-200 hover:border-stone-300'
                  }`}
                  onClick={() => handleSelectList(list.id)}
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
                <form onSubmit={handleCreateList} className="flex gap-2 mb-4">
                  <input
                    autoFocus
                    className="flex-1 rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
                    placeholder={t('newListPlaceholder')}
                    value={newListTitle}
                    onChange={e => setNewListTitle(e.target.value)}
                  />
                  <Button type="submit" variant="primary" size="sm" shape="pill" disabled={creatingListPending}>
                    {creatingListPending ? t('creating') : t('create')}
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
            <Button variant="secondary" size="sm" shape="pill" onClick={() => setStage(1)}>
              {t('back')}
            </Button>
            <Button
              variant="primary"
              size="sm"
              shape="pill"
              disabled={!chosenListId || submitting}
              onClick={handleSubmit}
            >
              {submitting ? t('adding') : t('addItems', { count: selectedIngredients.length })}
            </Button>
          </div>
        </>
      )}
    </div>
  );
};
