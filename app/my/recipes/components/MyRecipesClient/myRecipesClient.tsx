"use client";

import { useState } from "react";
import Link from "next/link";
import { RecipeCard } from "@/components/RecipeCard";
import { Pagination } from "@/components/Pagination";

type Recipe = {
  id: string;
  title: string;
  description: string | null;
  coverImageUrl: string | null;
  forkCount: number;
  isPublic: boolean;
  forkedFromId: string | null;
};

const PAGE_SIZE = 12;

export function MyRecipesClient({ initialRecipes }: { initialRecipes: Recipe[] }) {
  const [recipes, setRecipes] = useState(initialRecipes);
  const [page, setPage] = useState(1);

  function handleVisibilityToggle(id: string, isPublic: boolean) {
    setRecipes((prev) => prev.map((r) => (r.id === id ? { ...r, isPublic } : r)));
  }

  const totalPages = Math.ceil(recipes.length / PAGE_SIZE);
  const visible = recipes.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold text-stone-900">My Recipes</h1>
        <Link
          href="/my/recipes/new"
          className="rounded-full bg-primary-500 px-5 py-2 text-sm font-medium text-white hover:bg-primary-600 transition-colors"
        >
          + New recipe
        </Link>
      </div>

      {recipes.length === 0 ? (
        <div className="text-center py-20 text-stone-400">
          <p>No recipes yet.</p>
          <div className="mt-4 flex items-center justify-center gap-4">
            <Link href="/my/recipes/new" className="text-stone-700 underline hover:text-stone-900">
              Create one
            </Link>
            <span className="text-stone-300">or</span>
            <Link href="/pool" className="text-stone-700 underline hover:text-stone-900">
              fork from the pool
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {visible.map((r) => (
              <RecipeCard
                key={r.id}
                id={r.id}
                title={r.title}
                description={r.description}
                coverImageUrl={r.coverImageUrl}
                forkCount={r.forkCount}
                isPublic={r.isPublic}
                isOwned
                forkedFromId={r.forkedFromId}
                onVisibilityToggle={handleVisibilityToggle}
              />
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
