"use client";

import { useState } from "react";
import { RecipeCard } from "@/components/RecipeCard";
import { Button } from "@/components/Button";
import { Pagination } from "@/components/Pagination";

type Recipe = {
  id: string;
  title: string;
  description: string | null;
  coverImageUrl: string | null;
  forkCount: number;
};

type Props = {
  initialRecipes: Recipe[];
  initialTotal: number;
  initialPage: number;
  initialQuery: string;
};

const PAGE_SIZE = 24;

export function PoolClient({
  initialRecipes,
  initialTotal,
  initialPage,
  initialQuery,
}: Props) {
  const [recipes, setRecipes] = useState(initialRecipes);
  const [query, setQuery] = useState(initialQuery);
  const [page, setPage] = useState(initialPage);
  const [total, setTotal] = useState(initialTotal);
  const [loading, setLoading] = useState(false);

  async function search(q: string, p: number) {
    setLoading(true);
    const params = new URLSearchParams({ q, page: String(p) });
    const res = await fetch(`/api/pool?${params}`);
    if (res.ok) {
      const data = await res.json();
      setRecipes(data.recipes);
      setTotal(data.total);
      setPage(p);
    }
    setLoading(false);
  }

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-stone-900 mb-4">Recipe Pool</h1>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            search(query, 1);
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title or ingredient…"
            className="flex-1 rounded-lg border border-stone-300 px-4 py-2 text-stone-900 placeholder-stone-400 focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500"
          />
          <Button type="submit" variant="primary" size="md" shape="rounded">
            Search
          </Button>
          {query && (
            <Button
              type="button"
              variant="secondary"
              size="md"
              shape="rounded"
              onClick={() => {
                setQuery("");
                search("", 1);
              }}
            >
              Clear
            </Button>
          )}
        </form>
      </div>

      {loading ? (
        <div className="text-center py-20 text-stone-400">Loading…</div>
      ) : recipes.length === 0 ? (
        <div className="text-center py-20 text-stone-400">
          {query ? `No recipes found for "${query}"` : "No public recipes yet."}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recipes.map((r) => (
              <RecipeCard
                key={r.id}
                id={r.id}
                title={r.title}
                description={r.description}
                coverImageUrl={r.coverImageUrl}
                forkCount={r.forkCount}
              />
            ))}
          </div>

          <Pagination page={page} totalPages={totalPages} onPageChange={(p) => search(query, p)} />
        </>
      )}
    </div>
  );
}
