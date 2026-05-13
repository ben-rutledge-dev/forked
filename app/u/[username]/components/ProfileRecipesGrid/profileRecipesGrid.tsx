'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
// Components
import { Pagination } from '@/components/Pagination';
import { RecipeCard } from '@/components/RecipeCard';
// Types
import type { Recipe } from '@/types';

const PAGE_SIZE = 12;

export const ProfileRecipesGrid = ({ recipes }: { recipes: Recipe[] }) => {
  const [page, setPage] = useState(1);
  const t = useTranslations('myProfile');
  const totalPages = Math.ceil(recipes.length / PAGE_SIZE);
  const visible = recipes.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (recipes.length === 0) {
    return <p className="text-stone-400 text-sm">{t('noPublicRecipes')}</p>;
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map(recipe => (
          <RecipeCard
            key={recipe.id}
            id={recipe.id}
            title={recipe.title}
            description={recipe.description ?? null}
            coverImageUrl={recipe.coverImageUrl}
            isPublic={recipe.isPublic}
            forkCount={0}
            forkedFromId={recipe.forkedFromId ?? null}
          />
        ))}
      </div>
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </>
  );
};
