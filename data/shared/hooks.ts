import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
} from '@tanstack/react-query';
// Lib
import { apiFetch, ApiError } from '@/lib/apiFetch';

export const useApiQuery = <T>(
  queryKey: readonly unknown[],
  url: string,
  options?: Omit<UseQueryOptions<T, ApiError>, 'queryKey' | 'queryFn'>,
) => {
  return useQuery<T, ApiError>({
    queryKey,
    queryFn: () => apiFetch<T>(url),
    ...options,
  });
};

export const useApiPost = <TPayload, TResponse>(
  url: string,
  options?: UseMutationOptions<TResponse, ApiError, TPayload>,
) => {
  return useMutation<TResponse, ApiError, TPayload>({
    mutationFn: payload =>
      apiFetch<TResponse>(url, {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    ...options,
  });
};

export const useApiPatch = <TPayload, TResponse>(
  url: string | ((payload: TPayload) => string),
  options?: UseMutationOptions<TResponse, ApiError, TPayload>,
) => {
  return useMutation<TResponse, ApiError, TPayload>({
    mutationFn: payload =>
      apiFetch<TResponse>(
        typeof url === 'function' ? url(payload) : url,
        { method: 'PATCH', body: JSON.stringify(payload) },
      ),
    ...options,
  });
};

export const useApiPut = <TPayload, TResponse>(
  url: string | ((payload: TPayload) => string),
  options?: UseMutationOptions<TResponse, ApiError, TPayload>,
) => {
  return useMutation<TResponse, ApiError, TPayload>({
    mutationFn: payload =>
      apiFetch<TResponse>(
        typeof url === 'function' ? url(payload) : url,
        { method: 'PUT', body: JSON.stringify(payload) },
      ),
    ...options,
  });
};

export const useApiDelete = <TPayload, TResponse>(
  url: string | ((payload: TPayload) => string),
  options?: UseMutationOptions<TResponse, ApiError, TPayload>,
) => {
  return useMutation<TResponse, ApiError, TPayload>({
    mutationFn: payload =>
      apiFetch<TResponse>(
        typeof url === 'function' ? url(payload) : url,
        { method: 'DELETE', body: JSON.stringify(payload) },
      ),
    ...options,
  });
};

export { useQueryClient };
