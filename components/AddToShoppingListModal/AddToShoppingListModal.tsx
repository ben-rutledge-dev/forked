'use client';

import { useEffect, useState } from 'react';
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

export type AddToShoppingListModalProps = {
  recipeId: string
  recipeTitle: string
  onConfirm: (value: unknown) => void
};

type Stage = 1 | 2;

export const AddToShoppingListModal = ({
  recipeId,
  recipeTitle,
  onConfirm,
}: AddToShoppingListModalProps) => {
  const [stage, setStage] = useState<Stage>(1);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [ingredientsLoading, setIngredientsLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [chosenListId, setChosenListId] = useState<string | null>(null);
  const [firstSectionId, setFirstSectionId] = useState<string | null>(null);
  const [newListTitle, setNewListTitle] = useState('');
  const [creatingList, setCreatingList] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: listsData } = useShoppingLists();
  const lists = listsData?.lists ?? [];

  const { mutateAsync: createList, isPending: creatingListPending } = usePostShoppingList();
  const { mutateAsync: postItems } = usePostItems({ shoppingListId: chosenListId ?? undefined });

  // Fetch ingredients when modal mounts
  useEffect(() => {
    fetch(`/api/recipes/${recipeId}`)
      .then(r => r.json())
      .then((data) => {
        const ings: Ingredient[] = (data.ingredients ?? []).map((i: Ingredient) => ({ id: i.id, name: i.name }));
        setIngredients(ings);
        setSelected(new Set(ings.map(i => i.id)));
      })
      .finally(() => setIngredientsLoading(false));
  }, [recipeId]);

  const selectedIngredients = ingredients.filter(i => selected.has(i.id));

  const handleToggleAll = () => {
    if (selected.size === ingredients.length) setSelected(new Set());
    else setSelected(new Set(ingredients.map(i => i.id)));
  };

  const handleSelectList = async (listId: string) => {
    setChosenListId(listId);
    const res = await fetch(`/api/shopping-lists/${listId}`);
    if (res.ok) {
      const data = await res.json();
      const sections: Array<{ id: string }> = data.sections ?? [];
      setFirstSectionId(sections[0]?.id ?? null);
    }
  };

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListTitle.trim()) return;
    const newList = await createList({ title: newListTitle.trim() });
    setNewListTitle('');
    setCreatingList(false);
    await handleSelectList(newList.id);
  };

  const handleSubmit = async () => {
    if (!chosenListId || !firstSectionId) return;
    setError(null);
    setSubmitting(true);
    try {
      const items = selectedIngredients.map(ing => ({
        name: ing.name,
        sectionId: firstSectionId,
        recipeId,
        recipeTitle,
      }));
      await postItems({ items });
      const listName = lists.find(l => l.id === chosenListId)?.title ?? 'list';
      onConfirm({ success: true, count: items.length, listName });
    }
    catch {
      setError('Something went wrong. Please try again.');
    }
    finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6">

      {/* Stage 1: Select ingredients */}
      {stage === 1 && (
        <>
          <h2 className="text-lg font-semibold text-stone-800 mb-1">Add to shopping list</h2>
          <p className="text-sm text-stone-500 mb-4">{recipeTitle}</p>

          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-medium text-stone-600">Ingredients</span>
            {!ingredientsLoading && (
              <button className="text-xs text-primary-500 hover:underline" onClick={handleToggleAll}>
                {selected.size === ingredients.length ? 'Deselect all' : 'Select all'}
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
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              shape="pill"
              disabled={ingredientsLoading || selected.size === 0}
              onClick={() => setStage(2)}
            >
              Next →
            </Button>
          </div>
        </>
      )}

      {/* Stage 2: Select list and submit */}
      {stage === 2 && (
        <>
          <h2 className="text-lg font-semibold text-stone-800 mb-4">Choose a list</h2>

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
                    {list.uncheckedCount}
                    {' '}
                    items
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
                    placeholder="New list name…"
                    value={newListTitle}
                    onChange={e => setNewListTitle(e.target.value)}
                  />
                  <Button type="submit" variant="primary" size="sm" shape="pill" disabled={creatingListPending}>
                    {creatingListPending ? 'Creating…' : 'Create'}
                  </Button>
                </form>
              )
            : (
                <button
                  className="text-sm text-primary-500 hover:underline mb-4"
                  onClick={() => setCreatingList(true)}
                >
                  + New list
                </button>
              )}

          {error && <p className="text-sm text-danger-600 mb-3">{error}</p>}

          <div className="flex justify-between">
            <Button variant="secondary" size="sm" shape="pill" onClick={() => setStage(1)}>
              ← Back
            </Button>
            <Button
              variant="primary"
              size="sm"
              shape="pill"
              disabled={!chosenListId || !firstSectionId || submitting}
              onClick={handleSubmit}
            >
              {submitting ? 'Adding…' : `Add ${selectedIngredients.length} item${selectedIngredients.length !== 1 ? 's' : ''}`}
            </Button>
          </div>
        </>
      )}
    </div>
  );
};
