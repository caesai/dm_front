import { useCallback, useRef } from 'react';

interface CacheEntry<T> {
    data: T;
    timestamp: number;
}

interface UseCachedDataOptions {
    /** Время жизни кэша в миллисекундах (по умолчанию 5 минут) */
    ttl?: number;
    /** Ключ для сохранения в localStorage */
    cacheKey: string;
}

/**
 * Хук для кэширования данных с паттерном stale-while-revalidate.
 * 
 * При первом запросе возвращает кэшированные данные (если есть),
 * затем обновляет их в фоновом режиме через API.
 * 
 * @example
 * const { getCachedOrFetch } = useCachedData({ cacheKey: 'cities', ttl: 10 * 60 * 1000 });
 * const cities = await getCachedOrFetch(() => APIGetCityList());
 */
export const useCachedData = <T>({ ttl = 5 * 60 * 1000, cacheKey }: UseCachedDataOptions) => {
    const isRevalidatingRef = useRef(false);

    /**
     * Получает данные из localStorage
     */
    const getFromCache = useCallback((): CacheEntry<T> | null => {
        try {
            const cached = localStorage.getItem(`cache_${cacheKey}`);
            if (cached) {
                return JSON.parse(cached) as CacheEntry<T>;
            }
        } catch (e) {
            console.warn(`[useCachedData] Failed to read cache for ${cacheKey}:`, e);
        }
        return null;
    }, [cacheKey]);

    /**
     * Сохраняет данные в localStorage
     */
    const saveToCache = useCallback((data: T): void => {
        try {
            const entry: CacheEntry<T> = {
                data,
                timestamp: Date.now(),
            };
            localStorage.setItem(`cache_${cacheKey}`, JSON.stringify(entry));
        } catch (e) {
            console.warn(`[useCachedData] Failed to save cache for ${cacheKey}:`, e);
        }
    }, [cacheKey]);

    /**
     * Проверяет, устарел ли кэш
     */
    const isCacheStale = useCallback((entry: CacheEntry<T>): boolean => {
        return Date.now() - entry.timestamp > ttl;
    }, [ttl]);

    /**
     * Получает данные из кэша или делает запрос к API.
     * Реализует паттерн stale-while-revalidate:
     * - Если кэш есть и свежий - возвращает кэш
     * - Если кэш устаревший - возвращает кэш и обновляет в фоне
     * - Если кэша нет - делает запрос и кэширует результат
     * 
     * @param fetchFn - Функция для получения данных с API
     * @param onDataReceived - Колбэк, вызываемый при получении данных (кэш или API)
     * @returns Promise с данными
     */
    const getCachedOrFetch = useCallback(async (
        fetchFn: () => Promise<{ data: T }>,
        onDataReceived?: (data: T, fromCache: boolean) => void
    ): Promise<T> => {
        const cached = getFromCache();

        // Если есть кэш - сразу возвращаем его
        if (cached) {
            onDataReceived?.(cached.data, true);

            // Если кэш устарел - обновляем в фоне
            if (isCacheStale(cached) && !isRevalidatingRef.current) {
                isRevalidatingRef.current = true;
                fetchFn()
                    .then((response) => {
                        saveToCache(response.data);
                        onDataReceived?.(response.data, false);
                    })
                    .catch(console.error)
                    .finally(() => {
                        isRevalidatingRef.current = false;
                    });
            }

            return cached.data;
        }

        // Если кэша нет - делаем запрос
        const response = await fetchFn();
        saveToCache(response.data);
        onDataReceived?.(response.data, false);
        return response.data;
    }, [getFromCache, saveToCache, isCacheStale]);

    /**
     * Очищает кэш
     */
    const clearCache = useCallback((): void => {
        try {
            localStorage.removeItem(`cache_${cacheKey}`);
        } catch (e) {
            console.warn(`[useCachedData] Failed to clear cache for ${cacheKey}:`, e);
        }
    }, [cacheKey]);

    return {
        getCachedOrFetch,
        getFromCache,
        saveToCache,
        clearCache,
        isCacheStale,
    };
};

/**
 * Утилита для получения данных из кэша синхронно (без хука)
 */
export const getCachedData = <T>(cacheKey: string): T | null => {
    try {
        const cached = localStorage.getItem(`cache_${cacheKey}`);
        if (cached) {
            const entry = JSON.parse(cached) as CacheEntry<T>;
            return entry.data;
        }
    } catch {
        return null;
    }
    return null;
};

/**
 * Утилита для сохранения данных в кэш синхронно (без хука)
 */
export const setCachedData = <T>(cacheKey: string, data: T): void => {
    try {
        const entry: CacheEntry<T> = {
            data,
            timestamp: Date.now(),
        };
        localStorage.setItem(`cache_${cacheKey}`, JSON.stringify(entry));
    } catch (e) {
        console.warn(`[setCachedData] Failed to save cache for ${cacheKey}:`, e);
    }
};

