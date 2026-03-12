import { useState, useEffect, useCallback, useRef } from 'react';
import { CacheManager } from '../lib/cache';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface UseQueryOptions {
  cacheTime?: number; // Tiempo en ms que los datos permanecen en caché (default: 10 minutos)
  staleTime?: number; // Tiempo en ms antes de considerar datos obsoletos (default: 2 min)
  refetchOnMount?: boolean;
  enabled?: boolean;
  /** Persist cache to localStorage (survives page reloads). Default true. */
  persist?: boolean;
}

// Cache global en memoria
const queryCache = new Map<string, CacheEntry<any>>();

export function useCachedQuery<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: UseQueryOptions = {}
) {
  const {
    cacheTime = 10 * 60 * 1000, // 10 minutos default
    staleTime = 2 * 60 * 1000,  // 2 minutos default
    refetchOnMount = true,
    enabled = true,
    persist = true,
  } = options;

  const [data, setData] = useState<T | null>(() => {
    // Initialise from memory cache or localStorage synchronously
    const memCached = queryCache.get(key);
    if (memCached && Date.now() < memCached.expiresAt) return memCached.data;
    if (persist) {
      const stored = CacheManager.get<T>(key);
      if (stored) return stored;
    }
    return null;
  });
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(data === null);
  const [isFetching, setIsFetching] = useState(false);
  
  const fetchInProgressRef = useRef(false);

  const fetchData = useCallback(async (force = false) => {
    if (!enabled) return;
    if (fetchInProgressRef.current && !force) return;

    // Verificar cache
    const cached = queryCache.get(key);
    const now = Date.now();

    if (cached && !force) {
      // Si está en caché y no ha expirado
      if (now < cached.expiresAt) {
        setData(cached.data);
        setIsLoading(false);
        
        // Si los datos son "stale", refetch en background
        if (now > cached.timestamp + staleTime) {
          setIsFetching(true);
        } else {
          return;
        }
      }
    }

    fetchInProgressRef.current = true;
    setIsFetching(true);
    if (!cached) setIsLoading(true);

    try {
      const result = await fetcher();
      
      // Guardar en caché en memoria
      queryCache.set(key, {
        data: result,
        timestamp: now,
        expiresAt: now + cacheTime,
      });

      // Persistir en localStorage
      if (persist) {
        CacheManager.set(key, result, Math.round(cacheTime / 60000));
      }

      setData(result);
      setError(null);
    } catch (err) {
      setError(err as Error);
      console.error(`Error fetching ${key}:`, err);
    } finally {
      setIsLoading(false);
      setIsFetching(false);
      fetchInProgressRef.current = false;
    }
  }, [key, fetcher, enabled, cacheTime, staleTime]);

  useEffect(() => {
    if (refetchOnMount || !queryCache.has(key)) {
      fetchData();
    } else {
      // Cargar desde cache inmediatamente
      const cached = queryCache.get(key);
      if (cached && Date.now() < cached.expiresAt) {
        setData(cached.data);
        setIsLoading(false);
      } else {
        fetchData();
      }
    }
  }, [key, fetchData, refetchOnMount]);

  const refetch = useCallback(() => fetchData(true), [fetchData]);

  return {
    data,
    error,
    isLoading,
    isFetching,
    refetch,
  };
}

/**
 * Hook para invalidar cache manualmente
 */
export function useInvalidateQuery() {
  return useCallback((key: string | string[]) => {
    if (Array.isArray(key)) {
      key.forEach((k) => queryCache.delete(k));
    } else {
      queryCache.delete(key);
    }
  }, []);
}

/**
 * Limpiar toda la cache (útil en logout o cambios importantes)
 */
export function clearAllCache() {
  queryCache.clear();
}

/**
 * Prefetch de datos (cargar antes de que se necesiten)
 */
export async function prefetchQuery<T>(
  key: string,
  fetcher: () => Promise<T>,
  cacheTime = 5 * 60 * 1000
) {
  const cached = queryCache.get(key);
  const now = Date.now();

  // Solo prefetch si no está en caché o ha expirado
  if (!cached || now >= cached.expiresAt) {
    try {
      const data = await fetcher();
      queryCache.set(key, {
        data,
        timestamp: now,
        expiresAt: now + cacheTime,
      });
    } catch (error) {
      console.error(`Error prefetching ${key}:`, error);
    }
  }
}
