// Data
import { queryKeys } from '@/data/queryKeys';
import { useApiQuery } from '@/data/shared/hooks';
import type { CategoriesResponse } from './types';

export const useCategories = () =>
  useApiQuery<CategoriesResponse>(
    queryKeys.categories.all(),
    '/api/categories',
    { staleTime: 24 * 60 * 60 * 1000 },
  );
