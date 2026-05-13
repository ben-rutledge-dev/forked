'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
// Components
import { TokenInput, type TokenOption } from '@/components/TokenInput';
// Lib
import { GROUP_LABELS, GROUP_ORDER } from '@/lib/categories';

type Props = {
  query: string
  onQueryChange: (q: string) => void
  selectedCategories: string[]
  onCategoriesChange: (cats: string[]) => void
  categoryOptions: TokenOption[]
  groupLabels?: Record<string, string>
  groupOrder?: readonly string[] | string[]
  searchPlaceholder?: string
};

export const SearchFilterBar = ({
  query,
  onQueryChange,
  selectedCategories,
  onCategoriesChange,
  categoryOptions,
  groupLabels = GROUP_LABELS,
  groupOrder = GROUP_ORDER,
  searchPlaceholder,
}: Props) => {
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
          className="flex-1 min-w-0 rounded-lg border border-stone-300 px-4 py-2 text-sm text-stone-900 placeholder-stone-400 focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500"
        />
        {categoryOptions.length > 0 && (
          <button
            type="button"
            onClick={() => setOpen(o => !o)}
            className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm transition-colors ${
              open || activeCount > 0
                ? 'border-stone-400 bg-stone-100 text-stone-700'
                : 'border-stone-300 bg-white text-stone-500 hover:bg-stone-50'
            }`}
          >
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" className="opacity-60 shrink-0">
              <path d="M2 4h12M4 8h8M6 12h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            {t('filters')}
            {activeCount > 0 && (
              <span className="rounded-full bg-stone-700 px-1.5 py-0.5 text-[11px] font-medium leading-none text-white">
                {activeCount}
              </span>
            )}
          </button>
        )}
      </div>

      {open && categoryOptions.length > 0 && (
        <div className="mt-2 rounded-lg border border-stone-200 bg-stone-50 px-3 py-3">
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
