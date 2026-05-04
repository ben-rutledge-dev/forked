import Layout from "@/components/Layout";
import RecipeCard from "@/components/RecipeCard";
import { GetServerSideProps } from "next";
import { prisma } from "@/lib/prisma";
import { useState } from "react";

type Recipe = {
  id: string;
  title: string;
  description: string | null;
  coverImageUrl: string | null;
  forkCount: number;
};

type Props = {
  recipes: Recipe[];
  total: number;
  page: number;
  query: string;
};

const PAGE_SIZE = 24;

export default function Pool({ recipes: initial, total, page: initialPage, query: initialQuery }: Props) {
  const [recipes, setRecipes] = useState(initial);
  const [query, setQuery] = useState(initialQuery);
  const [page, setPage] = useState(initialPage);
  const [total2, setTotal2] = useState(total);
  const [loading, setLoading] = useState(false);

  async function search(q: string, p: number) {
    setLoading(true);
    const params = new URLSearchParams({ q, page: String(p) });
    const res = await fetch(`/api/pool?${params}`);
    if (res.ok) {
      const data = await res.json();
      setRecipes(data.recipes);
      setTotal2(data.total);
      setPage(p);
    }
    setLoading(false);
  }

  const totalPages = Math.ceil(total2 / PAGE_SIZE);

  return (
    <Layout title="Recipe Pool">
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
            <button
              type="submit"
              className="rounded-lg bg-primary-500 px-5 py-2 text-sm text-white hover:bg-primary-600 transition-colors"
            >
              Search
            </button>
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  search("", 1);
                }}
                className="rounded-lg border border-stone-300 px-4 py-2 text-sm text-stone-600 hover:bg-stone-100 transition-colors"
              >
                Clear
              </button>
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

            {totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-2">
                <button
                  onClick={() => search(query, page - 1)}
                  disabled={page <= 1}
                  className="rounded-lg border border-stone-300 px-4 py-2 text-sm text-stone-600 hover:bg-stone-100 disabled:opacity-40 transition-colors"
                >
                  Previous
                </button>
                <span className="text-sm text-stone-500">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => search(query, page + 1)}
                  disabled={page >= totalPages}
                  className="rounded-lg border border-stone-300 px-4 py-2 text-sm text-stone-600 hover:bg-stone-100 disabled:opacity-40 transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const q = String(query.q ?? "");
  const page = Math.max(1, Number(query.page ?? 1));
  const skip = (page - 1) * PAGE_SIZE;

  const where = q
    ? {
        isPublic: true,
        OR: [
          { title: { contains: q } },
          { ingredients: { some: { name: { contains: q } } } },
        ],
      }
    : { isPublic: true };

  const [recipes, total] = await Promise.all([
    prisma.recipe.findMany({
      where,
      select: { id: true, title: true, description: true, coverImageUrl: true, forkCount: true },
      orderBy: { forkCount: "desc" },
      skip,
      take: PAGE_SIZE,
    }),
    prisma.recipe.count({ where }),
  ]);

  return {
    props: {
      recipes: recipes.map((r) => ({
        ...r,
        description: r.description ?? null,
        coverImageUrl: r.coverImageUrl ?? null,
      })),
      total,
      page,
      query: q,
    },
  };
};
