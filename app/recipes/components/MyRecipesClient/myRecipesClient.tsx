'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
// Data
import { useRecipeBooks } from '@/data/recipe-books';
import { usePostAcceptInvite } from '@/data/recipe-books/[recipeBookId]/invites/accept';
import { usePostDeclineInvite } from '@/data/recipe-books/[recipeBookId]/invites/decline';
import type { PendingInvite } from '@/data/recipe-books/types';
import { useFavouriteRecipes, useMyRecipes, usePoolRecipes } from '@/data/recipes';
// Components
import { Button } from '@/components/Button';
import { PageHeader } from '@/components/PageHeader';
import { PageLayout } from '@/components/PageLayout';
import { Pagination } from '@/components/Pagination';
import { RecipeBookCard } from '@/components/RecipeBookCard';
import { RecipeCard } from '@/components/RecipeCard';
import { ResultCount } from '@/components/ResultCount';
import { SearchFilterBar } from '@/components/SearchFilterBar';
import type { TokenOption } from '@/components/TokenInput';
import { SectionLabel } from '@/components/Typography';
// Lib
import { GROUP_LABELS, GROUP_ORDER } from '@/lib/categories';

type RecipeFilterMeta = {
  id: string
  tags: string[]
  categories: Array<{ slug: string, label: string, group: string }>
};

type PoolCategory = {
  id: string
  slug: string
  label: string
  group: string
};

type Props = {
  allRecipes: RecipeFilterMeta[]
  defaultTab?: 'recipes' | 'books' | 'favourites' | 'browse'
  initialTagFilter?: string[]
  initialCategories?: string[]
  allPoolCategories?: PoolCategory[]
  initialFavourites?: string[]
  isAuthenticated?: boolean
};

const PAGE_SIZE = 12;
const POOL_PAGE_SIZE = 24;
const TAB_KEYS = ['browse', 'recipes', 'favourites', 'books'] as Array<'recipes' | 'favourites' | 'books' | 'browse'>;

export const MyRecipesClient: React.FC<Props> = (props) => {
  const {
    allRecipes,
    defaultTab = 'recipes',
    initialTagFilter = [],
    initialCategories = [],
    allPoolCategories = [],
    initialFavourites = [],
    isAuthenticated = true,
  } = props;
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations('myRecipes');
  const defaultTabFromUrl = (searchParams?.get('tab') as 'recipes' | 'books' | 'favourites' | 'browse') ?? defaultTab;
  const [tab, setTab] = useState<'recipes' | 'books' | 'favourites' | 'browse'>(
    isAuthenticated ? defaultTabFromUrl : 'browse',
  );

  // Browse tab state
  const [browseQuery, setBrowseQuery] = useState('');
  const [browseCategories, setBrowseCategories] = useState<string[]>([]);
  const [browsePage, setBrowsePage] = useState(1);
  const browseDebouncedQuery = browseQuery; // no debounce needed — usePoolRecipes handles it
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
    router.replace(`/recipes?${params.toString()}`, { scroll: false });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFilters, page]);

  // Always fetch all recipes; apply filters client-side for instant, reliable results
  const { data: allRecipeData = [], isFetching } = useMyRecipes();
  const { data: favouriteRecipes = [] } = useFavouriteRecipes();
  const { data: booksData = { books: [], pending: [] } } = useRecipeBooks();
  const { books, pending } = booksData;

  const { data: poolData, isFetching: poolFetching } = usePoolRecipes({
    categories: browseCategories,
    q: browseDebouncedQuery,
    page: browsePage,
  });
  const poolRecipes = poolData?.recipes ?? [];
  const poolTotal = poolData?.total ?? 0;
  const poolTotalPages = Math.ceil(poolTotal / POOL_PAGE_SIZE);
  const poolHasFilters = browseQuery.length > 0 || browseCategories.length > 0;

  const poolCategoryOptions: TokenOption[] = allPoolCategories.map(cat => ({
    id: cat.slug,
    label: cat.label,
    group: cat.group,
  }));

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
      r.tags.some(tag => activeTags.includes(tag)),
    );
  }

  const handleTabChange = (t: 'recipes' | 'books' | 'favourites' | 'browse') => {
    setTab(t);
    const params = new URLSearchParams(searchParams?.toString() ?? '');
    params.set('tab', t);
    router.replace(`/recipes?${params.toString()}`, { scroll: false });
  };

  const handleFiltersChange = (filters: string[]) => {
    setSelectedFilters(filters);
    setPage(1);
  };

  const handleQueryChange = (q: string) => {
    setQuery(q);
    setPage(1);
  };

  const handleBrowseQueryChange = (q: string) => {
    setBrowseQuery(q);
    setBrowsePage(1);
  };

  const handleBrowseCategoriesChange = (cats: string[]) => {
    setBrowseCategories(cats);
    setBrowsePage(1);
  };

  const clearBrowse = () => {
    setBrowseQuery('');
    setBrowseCategories([]);
    setBrowsePage(1);
  };

  const clearAll = () => {
    setSelectedFilters([]);
    setQuery('');
    setPage(1);
  };

  const totalPages = Math.ceil(recipes.length / PAGE_SIZE);
  const visible = recipes.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <PageLayout>
      <PageHeader title={t('heading')} action={isAuthenticated ? <HeaderAction tab={tab} /> : undefined} />

      {/* Tabs — only shown when logged in */}
      {isAuthenticated && (
        <div className="flex gap-1 mb-8 border-b border-stone-200 dark:border-stone-700">
          {TAB_KEYS.map(tabKey => (
            <button
              key={tabKey}
              onClick={() => handleTabChange(tabKey)}
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
                tab === tabKey
                  ? 'border-primary-500 text-primary-500'
                  : 'border-transparent text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200'
              }`}
            >
              {tabKey === 'recipes' ? t('tabRecipes') : tabKey === 'favourites' ? t('tabFavourites') : tabKey === 'books' ? t('tabBooks') : t('tabBrowse')}
              {tabKey === 'books' && pending.length > 0 && (
                <span className="ml-1.5 rounded-full bg-primary-500 px-1.5 py-0.5 text-xs text-white">
                  {pending.length}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

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
              searchPlaceholder={t('searchPlaceholder')}
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
                  <div className="text-center py-20 text-stone-400 dark:text-stone-500">
                    {hasFilters
                      ? t('noResults')
                      : (
                          <>
                            <p>{t('noRecipesYet')}</p>
                            <div className="mt-4 flex items-center justify-center gap-4">
                              <Link href="/recipes/new" className="text-stone-700 dark:text-stone-300 underline hover:text-stone-900 dark:hover:text-stone-100">{t('createOne')}</Link>
                              <span className="text-stone-300 dark:text-stone-600">{t('or')}</span>
                              <Link href="/recipes?tab=browse" className="text-stone-700 dark:text-stone-300 underline hover:text-stone-900 dark:hover:text-stone-100">{t('forkFromPool')}</Link>
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

      {tab === 'favourites' && (
        <div>
          {favouriteRecipes.length === 0
            ? (
                <div className="text-center py-20 text-stone-400">
                  <p>{t('noFavouritesYet')}</p>
                  <Link href="/recipes?tab=browse" className="mt-4 inline-block text-stone-700 underline hover:text-stone-900">{t('browsPool')}</Link>
                </div>
              )
            : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {favouriteRecipes.map(r => (
                    <RecipeCard
                      key={r.id}
                      id={r.id}
                      title={r.title}
                      description={r.description}
                      coverImageUrl={r.coverImageUrl}
                      forkCount={r.forkCount}
                      showPoolActions
                      isFavourited
                    />
                  ))}
                </div>
              )}
        </div>
      )}

      {tab === 'books' && (
        <>
          {pending.length > 0 && (
            <section className="mb-8">
              <SectionLabel className="mb-3">{t('pendingInvites')}</SectionLabel>
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
                  <p>{t('noBooksYet')}</p>
                  <Link href="/my/recipe-books/new" className="mt-4 inline-block text-stone-700 underline hover:text-stone-900">{t('createBook')}</Link>
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

      {tab === 'browse' && (
        <>
          <div className="mb-6">
            <SearchFilterBar
              query={browseQuery}
              onQueryChange={handleBrowseQueryChange}
              selectedCategories={browseCategories}
              onCategoriesChange={handleBrowseCategoriesChange}
              categoryOptions={poolCategoryOptions}
              groupLabels={GROUP_LABELS}
              groupOrder={[...GROUP_ORDER]}
              searchPlaceholder={t('searchPlaceholder')}
            />
            <ResultCount
              count={poolTotal}
              isFetching={poolFetching}
              hasFilters={poolHasFilters}
              onClear={clearBrowse}
            />
          </div>

          <div className={poolFetching ? 'opacity-60 transition-opacity' : ''}>
            {poolRecipes.length === 0
              ? (
                  <div className="text-center py-20 text-stone-400">
                    {poolHasFilters ? t('noResults') : t('noRecipesYet')}
                  </div>
                )
              : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {poolRecipes.map(r => (
                        <RecipeCard
                          key={r.id}
                          id={r.id}
                          title={r.title}
                          description={r.description}
                          coverImageUrl={r.coverImageUrl}
                          forkCount={r.forkCount}
                          showPoolActions
                          isFavourited={initialFavourites.includes(r.id)}
                        />
                      ))}
                    </div>
                    <Pagination page={browsePage} totalPages={poolTotalPages} onPageChange={setBrowsePage} />
                  </>
                )}
          </div>
        </>
      )}
    </PageLayout>
  );
};

type InviteRowProps = {
  invite: PendingInvite
};

const InviteRow: React.FC<InviteRowProps> = (props) => {
  const { invite } = props;
  const { mutate: accept, isPending: accepting } = usePostAcceptInvite({ recipeBookId: invite.recipeBook.id });
  const { mutate: decline, isPending: declining } = usePostDeclineInvite({ recipeBookId: invite.recipeBook.id });
  const isPending = accepting || declining;
  const t = useTranslations('myRecipes');

  return (
    <div className="flex items-center justify-between rounded-xl squircle shadow-sm bg-white dark:bg-stone-800 px-5 py-4">
      <div>
        <p className="font-medium text-stone-900 dark:text-stone-100">{invite.recipeBook.title}</p>
        <p className="text-xs text-stone-400 dark:text-stone-500 mt-0.5">
          {t('invitedAs')}
          {' '}
          <span className="font-medium">{invite.role}</span>
        </p>
      </div>
      <div className="flex gap-2">
        <Button variant="primary" size="sm" disabled={isPending} onClick={() => accept()}>{t('accept')}</Button>
        <Button variant="secondary" size="sm" disabled={isPending} onClick={() => decline()}>{t('decline')}</Button>
      </div>
    </div>
  );
};

type HeaderActionProps = {
  tab: 'recipes' | 'books' | 'favourites' | 'browse'
};

const HeaderAction: React.FC<HeaderActionProps> = (props) => {
  const { tab } = props;
  const t = useTranslations('myRecipes');
  if (tab === 'recipes') {
    return (
      <Button href="/recipes/new" variant="primary" size="lg">
        {t('newRecipe')}
      </Button>
    );
  }
  if (tab === 'books') {
    return (
      <Button href="/my/recipe-books/new" variant="primary" size="lg">
        {t('newRecipeBook')}
      </Button>
    );
  }
  return null;
};
