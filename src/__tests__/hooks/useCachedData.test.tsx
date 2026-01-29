/**
 * @fileoverview Тесты для хука useCachedData.
 * 
 * Хук useCachedData - инфраструктурный хук для кэширования данных с паттерном stale-while-revalidate.
 * Критичен для производительности приложения.
 * 
 * Тесты покрывают:
 * - Сохранение и получение данных из кэша
 * - Проверку устаревания кэша (TTL)
 * - Паттерн stale-while-revalidate
 * - Очистку кэша
 * - Утилиты getCachedData и setCachedData
 * 
 * @module __tests__/hooks/useCachedData
 * 
 * @see {@link useCachedData} - тестируемый хук
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useCachedData, getCachedData, setCachedData } from '@/hooks/useCachedData.ts';
import { localStorageMock, setupLocalStorageMock } from '@/__mocks__/localStorage.mock.ts';

// Мокируем localStorage
setupLocalStorageMock();

describe('useCachedData', () => {
    beforeEach(() => {
        localStorageMock.clear();
        jest.clearAllMocks();
    });

    describe('getFromCache и saveToCache', () => {
        it('должен сохранять и получать данные из кэша', () => {
            const { result } = renderHook(() =>
                useCachedData<string>({ cacheKey: 'test', ttl: 1000 })
            );

            act(() => {
                result.current.saveToCache('test data');
            });

            const cached = result.current.getFromCache();
            expect(cached).not.toBeNull();
            expect(cached?.data).toBe('test data');
            expect(cached?.timestamp).toBeGreaterThan(0);
        });

        it('должен возвращать null для несуществующего кэша', () => {
            const { result } = renderHook(() =>
                useCachedData<string>({ cacheKey: 'test', ttl: 1000 })
            );

            const cached = result.current.getFromCache();
            expect(cached).toBeNull();
        });

        it('должен обрабатывать ошибки при чтении кэша', () => {
            const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
            const originalGetItem = localStorageMock.getItem;
            localStorageMock.getItem = jest.fn(() => {
                throw new Error('Storage error');
            });

            const { result } = renderHook(() =>
                useCachedData<string>({ cacheKey: 'test', ttl: 1000 })
            );

            const cached = result.current.getFromCache();
            expect(cached).toBeNull();
            expect(consoleSpy).toHaveBeenCalled();

            consoleSpy.mockRestore();
            localStorageMock.getItem = originalGetItem;
        });
    });

    describe('isCacheStale', () => {
        it('должен определить свежий кэш как не устаревший', () => {
            const { result } = renderHook(() =>
                useCachedData<string>({ cacheKey: 'test', ttl: 10000 })
            );

            act(() => {
                result.current.saveToCache('test data');
            });

            const cached = result.current.getFromCache();
            expect(cached).not.toBeNull();
            expect(result.current.isCacheStale(cached!)).toBe(false);
        });

        it('должен определить устаревший кэш', () => {
            const { result } = renderHook(() =>
                useCachedData<string>({ cacheKey: 'test', ttl: 100 })
            );

            // Сохраняем данные с устаревшим timestamp
            const staleEntry = {
                data: 'test data',
                timestamp: Date.now() - 200, // Кэш старше TTL (100ms)
            };
            localStorageMock.setItem('cache_test', JSON.stringify(staleEntry));

            const cached = result.current.getFromCache();
            expect(cached).not.toBeNull();
            expect(result.current.isCacheStale(cached!)).toBe(true);
        });
    });

    describe('getCachedOrFetch', () => {
        it('должен вернуть данные из кэша, если они есть', async () => {
            const { result } = renderHook(() =>
                useCachedData<string>({ cacheKey: 'test', ttl: 10000 })
            );

            act(() => {
                result.current.saveToCache('cached data');
            });

            const fetchFn = jest.fn().mockResolvedValue({ data: 'fresh data' });
            const onDataReceived = jest.fn();

            let data: string | undefined;
            await act(async () => {
                data = await result.current.getCachedOrFetch(fetchFn, onDataReceived);
            });

            expect(data).toBe('cached data');
            expect(fetchFn).not.toHaveBeenCalled();
            expect(onDataReceived).toHaveBeenCalledWith('cached data', true);
        });

        it('должен сделать запрос, если кэша нет', async () => {
            const { result } = renderHook(() =>
                useCachedData<string>({ cacheKey: 'test', ttl: 10000 })
            );

            const fetchFn = jest.fn().mockResolvedValue({ data: 'fresh data' });
            const onDataReceived = jest.fn();

            let data: string | undefined;
            await act(async () => {
                data = await result.current.getCachedOrFetch(fetchFn, onDataReceived);
            });

            expect(data).toBe('fresh data');
            expect(fetchFn).toHaveBeenCalledTimes(1);
            expect(onDataReceived).toHaveBeenCalledWith('fresh data', false);

            // Проверяем, что данные сохранились в кэш
            const cached = result.current.getFromCache();
            expect(cached?.data).toBe('fresh data');
        });

        it('должен обновить устаревший кэш в фоне (stale-while-revalidate)', async () => {
            const { result } = renderHook(() =>
                useCachedData<string>({ cacheKey: 'test', ttl: 100 })
            );

            act(() => {
                result.current.saveToCache('stale data');
            });

            // Симулируем устаревший кэш через прямое изменение timestamp в localStorage
            const staleEntry = {
                data: 'stale data',
                timestamp: Date.now() - 200, // Кэш старше TTL
            };
            localStorageMock.setItem('cache_test', JSON.stringify(staleEntry));

            const fetchFn = jest.fn().mockResolvedValue({ data: 'fresh data' });
            const onDataReceived = jest.fn();

            let data: string | undefined;
            await act(async () => {
                data = await result.current.getCachedOrFetch(fetchFn, onDataReceived);
            });

            // Сразу возвращает устаревшие данные
            expect(data).toBe('stale data');
            expect(onDataReceived).toHaveBeenCalledWith('stale data', true);

            // Ждем фонового обновления
            await waitFor(() => {
                expect(fetchFn).toHaveBeenCalled();
            }, { timeout: 3000 });

            await waitFor(() => {
                expect(onDataReceived).toHaveBeenCalledWith('fresh data', false);
            }, { timeout: 3000 });

            // Проверяем, что кэш обновился
            const cached = result.current.getFromCache();
            expect(cached?.data).toBe('fresh data');
        });

        it('не должен делать несколько фоновых обновлений одновременно', async () => {
            const { result } = renderHook(() =>
                useCachedData<string>({ cacheKey: 'test', ttl: 100 })
            );

            // Симулируем устаревший кэш
            const staleEntry = {
                data: 'stale data',
                timestamp: Date.now() - 200,
            };
            localStorageMock.setItem('cache_test', JSON.stringify(staleEntry));

            const fetchFn = jest.fn().mockResolvedValue({ data: 'fresh data' });

            // Вызываем несколько раз подряд
            await act(async () => {
                await Promise.all([
                    result.current.getCachedOrFetch(fetchFn),
                    result.current.getCachedOrFetch(fetchFn),
                    result.current.getCachedOrFetch(fetchFn),
                ]);
            });

            // Должен быть только один запрос
            await waitFor(() => {
                expect(fetchFn).toHaveBeenCalledTimes(1);
            }, { timeout: 3000 });
        });

        it('должен обработать ошибку при запросе', async () => {
            const { result } = renderHook(() =>
                useCachedData<string>({ cacheKey: 'test', ttl: 10000 })
            );

            const fetchFn = jest.fn().mockRejectedValue(new Error('API Error'));

            await act(async () => {
                await expect(
                    result.current.getCachedOrFetch(fetchFn)
                ).rejects.toThrow('API Error');
            });

            // Проверяем, что функция была вызвана
            expect(fetchFn).toHaveBeenCalled();
        });
    });

    describe('clearCache', () => {
        it('должен очистить кэш', () => {
            const { result } = renderHook(() =>
                useCachedData<string>({ cacheKey: 'test', ttl: 10000 })
            );

            act(() => {
                result.current.saveToCache('test data');
            });

            expect(result.current.getFromCache()).not.toBeNull();

            act(() => {
                result.current.clearCache();
            });

            expect(result.current.getFromCache()).toBeNull();
        });
    });
});

describe('getCachedData и setCachedData (утилиты)', () => {
    beforeEach(() => {
        localStorageMock.clear();
    });

    it('должен сохранять и получать данные через утилиты', () => {
        setCachedData('test', 'test data');
        const data = getCachedData<string>('test');
        expect(data).toBe('test data');
    });

    it('должен возвращать null для несуществующего кэша', () => {
        const data = getCachedData<string>('nonexistent');
        expect(data).toBeNull();
    });

    it('должен обрабатывать ошибки при чтении', () => {
        const originalGetItem = localStorageMock.getItem;
        localStorageMock.getItem = jest.fn(() => {
            throw new Error('Storage error');
        });

        const data = getCachedData<string>('test');
        expect(data).toBeNull();

        localStorageMock.getItem = originalGetItem;
    });

    it('должен обрабатывать ошибки при сохранении', () => {
        const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
        const originalSetItem = localStorageMock.setItem;
        localStorageMock.setItem = jest.fn(() => {
            throw new Error('Storage error');
        });

        setCachedData('test', 'test data');
        expect(consoleSpy).toHaveBeenCalled();

        consoleSpy.mockRestore();
        localStorageMock.setItem = originalSetItem;
    });
});
