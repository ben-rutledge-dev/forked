'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
// Components
import { FilterIcon } from '@/components/Icons';
import { TokenInput, type TokenOption } from '@/components/TokenInput';
// Lib
import { GROUP_LABELS, GROUP_ORDER } from '@/lib/categories';

type SearchFilterBarProps = {
  query: string
  onQueryChange: (q: string) => void
  selectedCategories: string[]
  onCategoriesChange: (cats: string[]) => void
  categoryOptions: TokenOption[]
  groupLabels?: Record<string, string>
  groupOrder?: readonly string[] | string[]
  searchPlaceholder?: string
};

export const SearchFilterBar: React.FC<SearchFilterBarProps> = (props) => {
  const { query, onQueryChange, selectedCategories, onCategoriesChange, categoryOptions, groupLabels = GROUP_LABELS, groupOrder = GROUP_ORDER, searchPlaceholder } = props;
  const t = useTranslations('search');
  const [open, setOpen] = useState(selectedCategories.length > 0);
  const activeCount = selectedCategories.length;
  const placeholder = searchPlaceholder ?? t('placeholder');

  return (
    <div>
      {/* Search + toggle row */}
      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={e => onQueryChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 min-w-0 rounded-lg squircle bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-600 px-4 py-2 text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 focus:border-stone-500 dark:focus:border-stone-400 focus:outline-none focus:ring-1 focus:ring-stone-500 dark:focus:ring-stone-400"
        />
        {categoryOptions.length > 0 && (
          <button
            type="button"
            onClick={() => setOpen(o => !o)}
            className={`inline-flex items-center gap-1.5 squircle border px-4 py-2 text-sm transition-colors ${
              open || activeCount > 0
                ? 'border-stone-400 dark:border-stone-500 bg-stone-100 dark:bg-stone-700 text-stone-700 dark:text-stone-300'
                : 'border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-500 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-700'
            }`}
          >
            <FilterIcon className="w-3.5 h-3.5 opacity-60 shrink-0" />
            {t('filters')}
            {activeCount > 0 && (
              <span className="flex items-center justify-center rounded-full bg-primary-500 w-5 h-5 text-[10px] font-medium text-white">
                {activeCount}
              </span>
            )}
          </button>
        )}
      </div>

      {open && categoryOptions.length > 0 && (
        <div className="mt-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 px-3 py-3">
          <TokenInput
            mode="pills"
            value={selectedCategories}
            onChange={onCategoriesChange}
            options={categoryOptions}
            groupLabels={groupLabels}
            groupOrder={groupOrder}
          />
        </div>
      )}
    </div>
  );
};
