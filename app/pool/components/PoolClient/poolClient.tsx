'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
// Data
import { usePoolRecipes } from '@/data/recipes';
// Components
import { Pagination } from '@/components/Pagination';
import { RecipeCard } from '@/components/RecipeCard';
import { ResultCount } from '@/components/ResultCount';
import { SearchFilterBar } from '@/components/SearchFilterBar';
import type { TokenOption } from '@/components/TokenInput';
import { PageHeading } from '@/components/Typography';
// Lib
import { GROUP_LABELS, GROUP_ORDER } from '@/lib/categories';

type Category = {
  id: string
  slug: string
  label: string
  group: string
};

type PoolRecipe = {
  id: string
  title: string
  description: string | null
  coverImageUrl: string | null
  forkCount: number
  authorId: string | null
  isPublic: boolean
  forkedFromId: string | null
  tags: string[]
};

type Props = {
  initialRecipes: PoolRecipe[]
  initialTotal: number
  initialPage: number
  initialQuery: string
  initialCategories: string[]
  allCategories: Category[]
};

type Filters = {
  query: string
  categories: string[]
};

const PAGE_SIZE = 24;

export const PoolClient = ({
  initialRecipes,
  initialTotal,
  initialPage,
  initialQuery,
  initialCategories,
  allCategories,
}: Props) => {
  const router = useRouter();
  const t = useTranslations('pool');

  const [filters, setFilters] = useState<Filters>({
    query: initialQuery,
    categories: initialCategories,
  });
  const [debouncedFilters, setDebouncedFilters] = useState<Filters>(filters);
  const [page, setPage] = useState(initialPage);

  const hasFilters = filters.query.length > 0 || filters.categories.length > 0;

  // Single debounce for all filter changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilters(filters);
      setPage(1);
    }, 150);
    return () => clearTimeout(timer);
  }, [filters]);

  // Single URL sync
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedFilters.query) params.set('q', debouncedFilters.query);
    if (page > 1) params.set('page', String(page));
    if (debouncedFilters.categories.length > 0) {
      params.set('categories', debouncedFilters.categories.join(','));
    }
    router.replace(`/pool?${params.toString()}`, { scroll: false });
  }, [debouncedFilters, page, router]);

  const { data, isFetching } = usePoolRecipes({
    categories: debouncedFilters.categories,
    q: debouncedFilters.query,
    page,
    initialData:
      initialCategories.length === 0 && !initialQuery
        ? { recipes: initialRecipes, total: initialTotal }
        : undefined,
  });

  const recipes = data?.recipes ?? initialRecipes;
  const total = data?.total ?? initialTotal;

  const categoryOptions: TokenOption[] = allCategories.map(cat => ({
    id: cat.slug,
    label: cat.label,
    group: cat.group,
  }));

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const clearAll = () => setFilters({ query: '', categories: [] });

  return (
    <div>
      <PageHeading className="mb-4">{t('heading')}</PageHeading>

      <div className="mb-6">
        <SearchFilterBar
          query={filters.query}
          onQueryChange={q => setFilters(f => ({ ...f, query: q }))}
          selectedCategories={filters.categories}
          onCategoriesChange={categories => setFilters(f => ({ ...f, categories }))}
          categoryOptions={categoryOptions}
          groupLabels={GROUP_LABELS}
          groupOrder={GROUP_ORDER}
          searchPlaceholder={t('searchPlaceholder')}
        />
        <ResultCount
          count={total}
          isFetching={isFetching}
          hasFilters={hasFilters}
          onClear={clearAll}
        />
      </div>

      <div className={isFetching ? 'opacity-60 transition-opacity' : ''}>
        {recipes.length === 0
          ? (
              <div className="text-center py-20 text-stone-400">
                {hasFilters ? t('noResults') : t('empty')}
              </div>
            )
          : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recipes.map(r => (
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
                <Pagination
                  page={page}
                  totalPages={totalPages}
                  onPageChange={p => setPage(p)}
                />
              </>
            )}
      </div>
    </div>
  );
};
