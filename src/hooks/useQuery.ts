import {
  useQuery as useTanstackQuery,
  UseQueryOptions,
  UseQueryResult,
} from "@tanstack/react-query";

/**
 * Custom useQuery hook with standardized error handling, loading, and retry logic.
 * @param options TanStack Query options
 * @returns UseQueryResult<TData, TError>
 */
export function useQuery<TData, TError = Error>(
  options: UseQueryOptions<TData, TError>
): UseQueryResult<TData, TError> {
  return useTanstackQuery({
    retry: (failureCount, error) => {
      // Retry up to 3 times for network errors, with exponential backoff
      if (failureCount >= 3) return false;
      // Optionally, check error type here
      return true;
    },
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10000),
    ...options,
    onError: (error) => {
      // Standardized error logging
      // eslint-disable-next-line no-console
      console.error("Query error:", error);
      if (options.onError) options.onError(error);
    },
  });
}
