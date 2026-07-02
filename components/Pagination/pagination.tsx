'use client';

import { useTranslations } from 'next-intl';
// Components
import { Button } from '@/components/Button';

type PaginationProps = {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
};

export const Pagination: React.FC<PaginationProps> = (props) => {
  const { page, totalPages, onPageChange } = props;
  const t = useTranslations('pagination');
  if (totalPages <= 1) return null;

  return (
    <div className="mt-10 flex items-center justify-center gap-3">
      <Button
        variant="secondary"
        size="md"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
      >
        {t('previous')}
      </Button>
      <span className="text-sm text-stone-500">
        {t('page')}
        {' '}
        {page}
        {' '}
        {t('of')}
        {' '}
        {totalPages}
      </span>
      <Button
        variant="secondary"
        size="md"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
      >
        {t('next')}
      </Button>
    </div>
  );
};
