'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
// Data
import { useRecipeBooks } from '@/data/recipe-books';
import { usePostAcceptInvite } from '@/data/recipe-books/[recipeBookId]/invites/accept';
import { usePostDeclineInvite } from '@/data/recipe-books/[recipeBookId]/invites/decline';
import type { BookWithStats, PendingInvite } from '@/data/recipe-books/types';
import { useMyRecipes } from '@/data/recipes';
// Components
import { Button } from '@/components/Button';
import { Pagination } from '@/components/Pagination';
import { RecipeBookCard } from '@/components/RecipeBookCard';
import { RecipeCard } from '@/components/RecipeCard';
import { ResultCount } from '@/components/ResultCount';
import { SearchFilterBar } from '@/components/SearchFilterBar';
import type { TokenOption } from '@/components/TokenInput';
import { PageHeading, SectionLabel } from '@/components/Typography';
// Types
import type { Recipe } from '@/types';
// Lib
import { GROUP_LABELS, GROUP_ORDER } from '@/lib/categories';

type RecipeFilterMeta = {
  id: string
  tags: string[]
  categories: Array<{ slug: string, label: string, group: string }>
};

type Props = {
  initialRecipes: Recipe[]
  allRecipes: RecipeFilterMeta[]
  initialBooks: BookWithStats[]
  initialPending: PendingInvite[]
  defaultTab?: 'recipes' | 'books'
  initialTagFilter?: string[]
  initialCategories?: string[]
};

const PAGE_SIZE = 12;

export const MyRecipesClient = ({
  initialRecipes,
  allRecipes,
  initialBooks,
  initialPending,
  defaultTab = 'recipes',
  initialTagFilter = [],
  initialCategories = [],
}: Props) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultTabFromUrl = (searchParams?.get('tab') as 'recipes' | 'books') ?? defaultTab;
  const [tab, setTab] = useState<'recipes' | 'books'>(defaultTabFromUrl);
  const [page, setPage] = useState(1);

  // Filter options always derived from the full unfiltered allRecipes set
  const usedCategories: TokenOption[] = (() => {
    const seen = new Map<string, TokenOption>();
    for (const recipe of allRecipes) {
      for (const cat of recipe.categories ?? []) {
        if (!seen.has(cat.slug)) {
          seen.set(cat.slug, { id: cat.slug, label: cat.label, group: cat.group });
        }
      }
    }
    return Array.from(seen.values());
  })();

  const usedTags: TokenOption[] = Array.from(
    new Set(allRecipes.flatMap(r => r.tags ?? [])),
  ).sort().map(t => ({ id: t, label: t, group: 'MY_TAGS' }));

  const filterOptions: TokenOption[] = [...usedCategories, ...usedTags];

  const [selectedFilters, setSelectedFilters] = useState<string[]>(() => [
    ...initialCategories,
    ...initialTagFilter,
  ]);

  const [query, setQuery] = useState('');

  const hasFilters = selectedFilters.length > 0 || query.length > 0;

  const activeCategories = selectedFilters.filter(
    id => filterOptions.find(o => o.id === id)?.group !== 'MY_TAGS',
  );
  const activeTags = selectedFilters.filter(
    id => filterOptions.find(o => o.id === id)?.group === 'MY_TAGS',
  );

  // URL sync
  useEffect(() => {
    const params = new URLSearchParams(searchParams?.toString() ?? '');
    if (activeTags.length > 0) params.set('tags', activeTags.join(','));
    else params.delete('tags');
    if (activeCategories.length > 0) params.set('categories', activeCategories.join(','));
    else params.delete('categories');
    if (page > 1) params.set('page', String(page));
    else params.delete('page');
    router.replace(`/my/recipes?${params.toString()}`, { scroll: false });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFilters, page]);

  // Always fetch all recipes; apply filters client-side for instant, reliable results
  const { data: allRecipeData = initialRecipes, isFetching } = useMyRecipes({
    initialData: initialRecipes,
  });

  let recipes = allRecipeData;
  if (query) {
    const q = query.toLowerCase();
    recipes = recipes.filter(r =>
      r.title.toLowerCase().includes(q)
      || (r.description ?? '').toLowerCase().includes(q),
    );
  }
  if (activeCategories.length > 0) {
    recipes = recipes.filter(r =>
      r.categories?.some(c => activeCategories.includes(c.slug)),
    );
  }
  if (activeTags.length > 0) {
    recipes = recipes.filter(r =>
      r.tags.some(t => activeTags.includes(t)),
    );
  }

  const { data: booksData = { books: initialBooks, pending: initialPending } } = useRecipeBooks({
    initialData: { books: initialBooks, pending: initialPending },
  });
  const { books, pending } = booksData;

  const handleTabChange = (t: 'recipes' | 'books') => {
    setTab(t);
    const params = new URLSearchParams(searchParams?.toString() ?? '');
    params.set('tab', t);
    router.replace(`/my/recipes?${params.toString()}`, { scroll: false });
  };

  const handleFiltersChange = (filters: string[]) => {
    setSelectedFilters(filters);
    setPage(1);
  };

  const handleQueryChange = (q: string) => {
    setQuery(q);
    setPage(1);
  };

  const clearAll = () => {
    setSelectedFilters([]);
    setQuery('');
    setPage(1);
  };

  const totalPages = Math.ceil(recipes.length / PAGE_SIZE);
  const visible = recipes.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <PageHeading>My Recipes</PageHeading>
        {tab === 'recipes'
          ? (
              <Link
                href="/my/recipes/new"
                className="rounded-full bg-primary-500 px-5 py-2 text-sm font-medium text-white hover:bg-primary-600 transition-colors"
              >
                + New recipe
              </Link>
            )
          : (
              <Link
                href="/my/recipe-books/new"
                className="rounded-full bg-primary-500 px-5 py-2 text-sm font-medium text-white hover:bg-primary-600 transition-colors"
              >
                + New recipe book
              </Link>
            )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-8 border-b border-stone-200">
        {(['recipes', 'books'] as const).map(t => (
          <button
            key={t}
            onClick={() => handleTabChange(t)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              tab === t
                ? 'border-primary-500 text-primary-500'
                : 'border-transparent text-stone-500 hover:text-stone-700'
            }`}
          >
            {t === 'recipes' ? 'Recipes' : 'Recipe Books'}
            {t === 'books' && pending.length > 0 && (
              <span className="ml-1.5 rounded-full bg-primary-500 px-1.5 py-0.5 text-xs text-white">
                {pending.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === 'recipes' && (
        <>
          <div className="mb-5">
            <SearchFilterBar
              query={query}
              onQueryChange={handleQueryChange}
              selectedCategories={selectedFilters}
              onCategoriesChange={handleFiltersChange}
              categoryOptions={filterOptions}
              groupLabels={GROUP_LABELS}
              groupOrder={[...GROUP_ORDER]}
              searchPlaceholder="Search recipes…"
            />
            <ResultCount
              count={recipes.length}
              isFetching={isFetching}
              hasFilters={hasFilters}
              onClear={clearAll}
            />
          </div>

          <div className={isFetching ? 'opacity-60 transition-opacity' : ''}>
            {recipes.length === 0
              ? (
                  <div className="text-center py-20 text-stone-400">
                    {hasFilters
                      ? 'No recipes match your filters.'
                      : (
                          <>
                            <p>No recipes yet.</p>
                            <div className="mt-4 flex items-center justify-center gap-4">
                              <Link href="/my/recipes/new" className="text-stone-700 underline hover:text-stone-900">Create one</Link>
                              <span className="text-stone-300">or</span>
                              <Link href="/pool" className="text-stone-700 underline hover:text-stone-900">fork from the pool</Link>
                            </div>
                          </>
                        )}
                  </div>
                )
              : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {visible.map(r => (
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
                        />
                      ))}
                    </div>
                    <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
                  </>
                )}
          </div>
        </>
      )}

      {tab === 'books' && (
        <>
          {pending.length > 0 && (
            <section className="mb-8">
              <SectionLabel className="mb-3">Pending invites</SectionLabel>
              <div className="space-y-3">
                {pending.map(invite => (
                  <InviteRow key={invite.id} invite={invite} />
                ))}
              </div>
            </section>
          )}
          {books.length === 0
            ? (
                <div className="text-center py-20 text-stone-400">
                  <p>No recipe books yet.</p>
                  <Link href="/my/recipe-books/new" className="mt-4 inline-block text-stone-700 underline hover:text-stone-900">Create one</Link>
                </div>
              )
            : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {books.map(b => (
                    <RecipeBookCard
                      key={b.id}
                      id={b.id}
                      title={b.title}
                      coverImageUrl={b.coverImageUrl}
                      isPublic={b.isPublic}
                      role={b.role}
                      memberCount={b.memberCount}
                      recipeCount={b.recipeCount}
                    />
                  ))}
                </div>
              )}
        </>
      )}
    </div>
  );
};

type InviteRowProps = {
  invite: PendingInvite
};

const InviteRow = ({ invite }: InviteRowProps) => {
  const { mutate: accept, isPending: accepting } = usePostAcceptInvite({ recipeBookId: invite.recipeBook.id });
  const { mutate: decline, isPending: declining } = usePostDeclineInvite({ recipeBookId: invite.recipeBook.id });
  const isPending = accepting || declining;

  return (
    <div className="flex items-center justify-between rounded-xl border border-stone-200 bg-white px-5 py-4">
      <div>
        <p className="font-medium text-stone-900">{invite.recipeBook.title}</p>
        <p className="text-xs text-stone-400 mt-0.5">
          {'Invited as '}
          <span className="font-medium">{invite.role}</span>
        </p>
      </div>
      <div className="flex gap-2">
        <Button variant="primary" size="sm" shape="pill" disabled={isPending} onClick={() => accept()}>Accept</Button>
        <Button variant="secondary" size="sm" shape="pill" disabled={isPending} onClick={() => decline()}>Decline</Button>
      </div>
    </div>
  );
};
