'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
// Components
import { CategoryPillButton } from '@/components/CategoryPill';
import { SectionLabel } from '@/components/Typography';

type Category = {
  id: string
  slug: string
  label: string
  group: string
};

const GROUP_LABELS: Record<string, string> = {
  CUISINE: 'Cuisine',
  MEAL_TYPE: 'Meal type',
  DIETARY: 'Dietary',
  EFFORT: 'Effort',
};

const GROUP_ORDER = ['CUISINE', 'MEAL_TYPE', 'DIETARY', 'EFFORT'];

type Props = {
  allCategories: Category[]
  activeCategories: string[]
};

export const CategoryFilter = ({ allCategories, activeCategories }: Props) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateUrl = useCallback((newSlugs: string[]) => {
    const params = new URLSearchParams(searchParams?.toString() ?? '');
    if (newSlugs.length > 0) {
      params.set('categories', newSlugs.join(','));
    }
    else {
      params.delete('categories');
    }
    params.delete('page');
    router.push(`/pool?${params.toString()}`);
  }, [router, searchParams]);

  const toggleCategory = (slug: string) => {
    const next = activeCategories.includes(slug)
      ? activeCategories.filter(s => s !== slug)
      : [...activeCategories, slug];
    updateUrl(next);
  };

  const clearFilters = () => updateUrl([]);

  const grouped = GROUP_ORDER.reduce<Record<string, Category[]>>((acc, g) => {
    acc[g] = allCategories.filter(c => c.group === g);
    return acc;
  }, {});

  const hasFilters = activeCategories.length > 0;

  return (
    <div className="mb-6">
      {GROUP_ORDER.map((group) => {
        const cats = grouped[group] ?? [];
        if (cats.length === 0) return null;
        return (
          <div key={group} className="mb-3">
            <SectionLabel className="mb-1.5">{GROUP_LABELS[group]}</SectionLabel>
            <div className="flex flex-wrap gap-1.5">
              {cats.map((cat) => {
                const active = activeCategories.includes(cat.slug);
                return (
                  <CategoryPillButton
                    key={cat.slug}
                    active={active}
                    onClick={() => toggleCategory(cat.slug)}
                  >
                    {cat.label}
                  </CategoryPillButton>
                );
              })}
            </div>
          </div>
        );
      })}
      {hasFilters && (
        <button
          type="button"
          onClick={clearFilters}
          className="text-sm text-stone-500 underline hover:text-stone-700 mt-1"
        >
          Clear filters
        </button>
      )}
    </div>
  );
};
