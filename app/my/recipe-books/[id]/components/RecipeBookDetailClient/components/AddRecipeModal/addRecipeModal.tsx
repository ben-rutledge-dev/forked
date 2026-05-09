'use client';

import Image from 'next/image';
import { useState } from 'react';
// Components
import { Button } from '@/components/Button';
import { TextInput } from '@/components/TextInput';
// Types
import type { Recipe } from '@/types';

type Props = {
  userRecipes: Pick<Recipe, 'id' | 'title' | 'coverImageUrl'>[]
  existingRecipeIds: string[]
  onConfirm: (value: string | null) => void
};

export const AddRecipeModal = ({ userRecipes, existingRecipeIds, onConfirm }: Props) => {
  const [recipeSearch, setRecipeSearch] = useState('');
  const existing = new Set(existingRecipeIds);
  const addableRecipes = userRecipes.filter(
    r => !existing.has(r.id) && r.title.toLowerCase().includes(recipeSearch.toLowerCase()),
  );

  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold text-stone-900 mb-4">Add a recipe</h2>
      <TextInput
        type="text"
        value={recipeSearch}
        onChange={e => setRecipeSearch(e.target.value)}
        placeholder="Search your recipes…"
        className="mb-3"
      />
      <div className="max-h-72 overflow-y-auto space-y-1">
        {addableRecipes.length === 0
          ? (
              <p className="text-center text-stone-400 text-sm py-6">No recipes to add.</p>
            )
          : (
              addableRecipes.map(r => (
                <button
                  key={r.id}
                  onClick={() => onConfirm(r.id)}
                  className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-stone-50 transition-colors"
                >
                  {r.coverImageUrl
                    ? (
                        <Image src={r.coverImageUrl} alt="" width={40} height={40} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                      )
                    : (
                        <div className="w-10 h-10 rounded-lg bg-stone-100 shrink-0" />
                      )}
                  <span className="text-sm font-medium text-stone-900 line-clamp-1">{r.title}</span>
                </button>
              ))
            )}
      </div>
      <div className="mt-4">
        <Button variant="secondary" size="sm" shape="pill" onClick={() => onConfirm(null)}>
          Close
        </Button>
      </div>
    </div>
  );
};
