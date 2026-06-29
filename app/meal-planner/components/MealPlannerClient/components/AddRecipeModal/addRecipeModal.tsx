'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useState, useDeferredValue } from 'react';
// Data
import { useSavedRecipes, type SavedRecipe } from '@/data/meal-plans';
// Components
import { Button } from '@/components/Button';
import { TextInput } from '@/components/TextInput';

type Props = {
  slotLabel: string
  dayLabel: string
  onConfirm: (recipe: SavedRecipe | null) => void
};

export const AddRecipeModal = ({ slotLabel, dayLabel, onConfirm }: Props) => {
  const t = useTranslations('mealPlanner');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<SavedRecipe | null>(null);
  const deferredSearch = useDeferredValue(search);

  const { data, isLoading } = useSavedRecipes(deferredSearch || undefined);
  const recipes = data?.recipes ?? [];

  if (selected) {
    return (
      <div className="p-6 space-y-4">
        <h2 className="text-lg font-semibold text-stone-900">
          {t('pickRecipeHeading', { slot: slotLabel, day: dayLabel })}
        </h2>
        <div className="flex items-center gap-4 rounded-xl squircle shadow-sm p-4">
          {selected.coverImageUrl
            ? (
                <Image
                  src={selected.coverImageUrl}
                  alt={selected.title}
                  width={64}
                  height={64}
                  className="rounded-lg object-cover h-16 w-16 flex-shrink-0"
                />
              )
            : (
                <div className="h-16 w-16 flex-shrink-0 rounded-lg bg-stone-100" />
              )}
          <div>
            <p className="font-medium text-stone-900">{selected.title}</p>
            {selected.description && (
              <p className="text-sm text-stone-500 line-clamp-2 mt-0.5">{selected.description}</p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="primary" size="sm" onClick={() => onConfirm(selected)}>
            {t('confirmAdd')}
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setSelected(null)}>
            {t('back')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-lg font-semibold text-stone-900">
        {t('pickRecipeHeading', { slot: slotLabel, day: dayLabel })}
      </h2>
      <TextInput
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder={t('searchPlaceholder')}
      />
      <div className="max-h-80 overflow-y-auto space-y-2">
        {isLoading && <p className="text-sm text-stone-400 py-4 text-center">{t('loading')}</p>}
        {!isLoading && recipes.length === 0 && (
          <p className="text-sm text-stone-400 py-4 text-center">{t('noRecipesFound')}</p>
        )}
        {recipes.map(recipe => (
          <button
            key={recipe.id}
            className="w-full flex items-center gap-3 rounded-xl squircle shadow-sm p-3 hover:shadow-md hover:bg-stone-50 text-left transition-colors"
            onClick={() => setSelected(recipe)}
          >
            {recipe.coverImageUrl
              ? (
                  <Image
                    src={recipe.coverImageUrl}
                    alt={recipe.title}
                    width={48}
                    height={48}
                    className="rounded-lg object-cover h-12 w-12 flex-shrink-0"
                  />
                )
              : (
                  <div className="h-12 w-12 flex-shrink-0 rounded-lg bg-stone-100" />
                )}
            <div className="min-w-0">
              <p className="font-medium text-stone-900 truncate">{recipe.title}</p>
              {recipe.description && (
                <p className="text-xs text-stone-500 truncate">{recipe.description}</p>
              )}
            </div>
          </button>
        ))}
      </div>
      <Button variant="secondary" size="sm" onClick={() => onConfirm(null)}>
        {t('back')}
      </Button>
    </div>
  );
};
