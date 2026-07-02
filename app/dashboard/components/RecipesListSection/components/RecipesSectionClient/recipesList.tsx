'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
// Data
import type { PostRecipeResponse } from '@/data/recipes/types';
// Components
import { CompactRecipeCard } from './components/CompactRecipeCard';

type RecipesListProps = {
  recipes: PostRecipeResponse[]
};

export const RecipesList: React.FC<RecipesListProps> = (props) => {
  const { recipes } = props;
  const t = useTranslations('dashboard.recipes');

  if (recipes.length === 0) {
    return (
      <div className="rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 px-5 py-6 text-center">
        <p className="text-sm text-stone-500 dark:text-stone-400 mb-2">{t('noRecipesYet')}</p>
        <div className="flex justify-center gap-4 text-xs">
          <Link href="/recipes/new" className="text-primary-500 hover:underline">{t('createRecipe')}</Link>
          <Link href="/recipes" className="text-primary-500 hover:underline">{t('browsePool')}</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-3 grid-cols-[repeat(auto-fill,minmax(11rem,1fr))]">
      {recipes.map(recipe => (
        <CompactRecipeCard
          key={recipe.id}
          id={recipe.id}
          title={recipe.title}
          coverImageUrl={recipe.coverImageUrl}
          tags={recipe.tags}
          categories={recipe.categories}
        />
      ))}
    </div>
  );
};
