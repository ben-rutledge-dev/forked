'use client';

import { useTranslations } from 'next-intl';
// Data
import type { BookEntry } from '@/data/recipe-books/[recipeBookId]/types';
// Components
import { Button } from '@/components/Button';
import { RecipeCard } from '@/components/RecipeCard';

type Props = {
  entries: BookEntry[]
  isMember: boolean
  currentUserId: string
  onAddRecipe: () => void
  onRemoveEntry: (entryId: string) => void
  onMove: (entryId: string, direction: 'up' | 'down') => void
};

export const BookRecipesSection = ({ entries, isMember, currentUserId, onAddRecipe, onRemoveEntry, onMove }: Props) => {
  const sortedEntries = [...entries].sort((a, b) => a.orderIndex - b.orderIndex);
  const t = useTranslations('recipeBooks');

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-stone-900">{t('recipesSection')}</h2>
        {isMember && (
          <Button variant="secondary" size="sm" onClick={onAddRecipe}>
            {t('addRecipe')}
          </Button>
        )}
      </div>

      {sortedEntries.length === 0
        ? (
            <p className="text-stone-400 text-sm py-8 text-center">{t('noRecipes')}</p>
          )
        : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedEntries.map((entry, i) => (
                <div key={entry.id}>
                  <RecipeCard
                    id={entry.recipe.id}
                    title={entry.recipe.title}
                    description={entry.recipe.description}
                    coverImageUrl={entry.recipe.coverImageUrl}
                    forkCount={entry.recipe.forkCount}
                    isPublic={entry.recipe.isPublic}
                    isOwned={entry.recipe.authorId === currentUserId}
                    onRemoveFromBook={isMember ? () => onRemoveEntry(entry.id) : undefined}
                  />
                  {isMember && (
                    <div className="flex gap-1 mt-1.5 justify-end">
                      <button
                        disabled={i === 0}
                        onClick={() => onMove(entry.id, 'up')}
                        className="rounded px-2 py-0.5 text-xs text-stone-400 hover:text-stone-600 disabled:opacity-30 border border-stone-200 bg-white"
                        title={t('moveUp')}
                      >
                        ↑
                      </button>
                      <button
                        disabled={i === sortedEntries.length - 1}
                        onClick={() => onMove(entry.id, 'down')}
                        className="rounded px-2 py-0.5 text-xs text-stone-400 hover:text-stone-600 disabled:opacity-30 border border-stone-200 bg-white"
                        title={t('moveDown')}
                      >
                        ↓
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
    </div>
  );
};
