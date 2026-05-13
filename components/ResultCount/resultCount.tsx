'use client';

import { useTranslations } from 'next-intl';

type Props = {
  count: number
  isFetching?: boolean
  hasFilters?: boolean
  onClear?: () => void
};

export const ResultCount = ({
  count,
  isFetching = false,
  hasFilters = false,
  onClear,
}: Props) => {
  const t = useTranslations('search');

  return (
    <div className="flex items-center justify-between mt-2 min-h-[20px]">
      <p className="text-sm text-stone-400">
        {isFetching ? t('loading') : t('count', { count })}
      </p>
      {hasFilters && onClear && (
        <button
          type="button"
          onClick={onClear}
          className="text-sm text-stone-400 hover:text-stone-600 underline"
        >
          {t('clearAll')}
        </button>
      )}
    </div>
  );
};
