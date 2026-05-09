// Data
import { queryKeys } from '@/data/queryKeys';
import { useApiQuery } from '@/data/shared/hooks';
import type { PoolResponse, Params } from './types';

export const usePool = (params?: Params) =>
  useApiQuery<PoolResponse>(queryKeys.pool.all, '/api/pool', {
    initialData: params?.initialData,
  });
