// Data
import { queryKeys } from '@/data/queryKeys';
import { useApiQuery } from '@/data/shared/hooks';

type MyTagsResponse = { tags: string[] };

export const useMyTags = () =>
  useApiQuery<MyTagsResponse>(
    queryKeys.tags.mine(),
    '/api/tags',
  );
