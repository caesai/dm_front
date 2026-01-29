/**
 * @fileoverview Тесты для хука useDataLoader.
 * 
 * Хук useDataLoader - критичный инфраструктурный хук для загрузки данных приложения.
 * Реализует приоритизацию загрузки, кэширование и ленивую загрузку.
 * 
 * Тесты покрывают:
 * - Загрузку критичных данных (города, рестораны)
 * - Кэширование данных
 * - Фоновую загрузку событий
 * - Ленивую загрузку сертификатов
 * - Проверку наличия кэшированных данных
 * - Сброс флагов загрузки
 * 
 * @module __tests__/hooks/useDataLoader
 * 
 * @see {@link useDataLoader} - тестируемый хук
 */

import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useDataLoader } from '@/hooks/useDataLoader.ts';
import { authAtom, userAtom } from '@/atoms/userAtom.ts';
import { cityListAtom } from '@/atoms/cityListAtom.ts';
import { restaurantsListAtom } from '@/atoms/restaurantsListAtom.ts';
import { certificatesListAtom } from '@/atoms/certificatesListAtom.ts';
import { eventsListAtom } from '@/atoms/eventListAtom.ts';
import { TestProvider } from '@/__mocks__/atom.mock.tsx';
import { mockCityList } from '@/__mocks__/city.mock.ts';
import { mockRestaurantWithBanquets } from '@/__mocks__/restaurant.mock.ts';
import { mockUserData } from '@/__mocks__/user.mock.ts';

// ============================================
// Моки API
// ============================================

const mockAPIGetCityList = jest.fn();
const mockAPIGetRestaurantsList = jest.fn();
const mockAPIGetEventsList = jest.fn();
const mockAPIGetCertificates = jest.fn();

jest.mock('@/api/city.api.ts', () => ({
    APIGetCityList: (...args: any[]) => mockAPIGetCityList(...args),
}));

jest.mock('@/api/restaurants.api.ts', () => ({
    APIGetRestaurantsList: (...args: any[]) => mockAPIGetRestaurantsList(...args),
}));

jest.mock('@/api/events.api.ts', () => ({
    APIGetEventsList: (...args: any[]) => mockAPIGetEventsList(...args),
}));

jest.mock('@/api/certificates.api.ts', () => ({
    APIGetCertificates: (...args: any[]) => mockAPIGetCertificates(...args),
}));

// Мокируем useCachedData утилиты
const mockGetCachedData = jest.fn();
const mockSetCachedData = jest.fn();

jest.mock('@/hooks/useCachedData.ts', () => ({
    getCachedData: (...args: any[]) => mockGetCachedData(...args),
    setCachedData: (...args: any[]) => mockSetCachedData(...args),
}));

// ============================================
// Вспомогательные функции
// ============================================

const renderHookWithProvider = (
    auth?: { access_token: string } | null,
    user?: any
) => {
    // Если auth явно передан как null, используем null, иначе используем дефолтное значение
    const authValue = auth === null ? null : (auth ?? { access_token: 'test_token' });
    // Если user явно передан как null, используем null, иначе используем дефолтное значение
    const userValue = user === null ? null : (user ?? mockUserData);
    
    const initialValues: any[] = [
        [authAtom, authValue],
        [userAtom, userValue],
        [cityListAtom, []],
        [restaurantsListAtom, []],
        [certificatesListAtom, []],
        [eventsListAtom, null],
    ];

    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <TestProvider initialValues={initialValues}>{children}</TestProvider>
    );

    return renderHook(() => useDataLoader(), { wrapper });
};

describe('useDataLoader', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockGetCachedData.mockReturnValue(null);
        mockSetCachedData.mockImplementation(() => {});
    });

    describe('loadCriticalData', () => {
        it('должен загрузить критичные данные при наличии авторизации', async () => {
            mockAPIGetCityList.mockResolvedValue({ data: mockCityList });
            mockAPIGetRestaurantsList.mockResolvedValue({
                data: [mockRestaurantWithBanquets],
            });

            const { result } = renderHookWithProvider();

            let success: boolean | undefined;
            await act(async () => {
                success = await result.current.loadCriticalData();
            });

            await waitFor(() => {
                expect(mockAPIGetCityList).toHaveBeenCalled();
                expect(mockAPIGetRestaurantsList).toHaveBeenCalledWith('test_token');
            });

            expect(success).toBe(true);
            expect(mockSetCachedData).toHaveBeenCalledWith('app_cities', mockCityList);
            expect(mockSetCachedData).toHaveBeenCalledWith(
                'app_restaurants',
                [mockRestaurantWithBanquets]
            );
        });

        it('должен использовать кэшированные данные, если они есть', async () => {
            mockGetCachedData.mockImplementation((key: string) => {
                if (key === 'app_cities') return mockCityList;
                if (key === 'app_restaurants') return [mockRestaurantWithBanquets];
                return null;
            });

            const { result } = renderHookWithProvider();

            let success: boolean | undefined;
            await act(async () => {
                success = await result.current.loadCriticalData();
            });

            // Должен сразу вернуть true при наличии кэша
            expect(success).toBe(true);

            // Но все равно должен обновить данные в фоне
            await waitFor(() => {
                expect(mockAPIGetCityList).toHaveBeenCalled();
            });
        });

        it('должен вернуть true без загрузки, если нет авторизации', async () => {
            const { result } = renderHookWithProvider(null);

            let success: boolean | undefined;
            await act(async () => {
                success = await result.current.loadCriticalData();
            });

            expect(success).toBe(true);
            expect(mockAPIGetCityList).not.toHaveBeenCalled();
        });

        it('должен обработать ошибку загрузки городов', async () => {
            mockAPIGetCityList.mockRejectedValue(new Error('API Error'));
            mockAPIGetRestaurantsList.mockResolvedValue({
                data: [mockRestaurantWithBanquets],
            });

            const { result } = renderHookWithProvider();

            let success: boolean | undefined;
            await act(async () => {
                success = await result.current.loadCriticalData();
            });

            // Должен вернуть true, если хотя бы один запрос успешен
            expect(success).toBe(true);
        });

        it('не должен загружать данные повторно', async () => {
            mockAPIGetCityList.mockResolvedValue({ data: mockCityList });
            mockAPIGetRestaurantsList.mockResolvedValue({
                data: [mockRestaurantWithBanquets],
            });

            const { result } = renderHookWithProvider();

            await act(async () => {
                await result.current.loadCriticalData();
            });

            await act(async () => {
                await result.current.loadCriticalData();
            });

            // Должен быть вызван только один раз
            expect(mockAPIGetCityList).toHaveBeenCalledTimes(1);
        });
    });

    describe('loadEvents', () => {
        it('должен загрузить события при наличии авторизации', async () => {
            const mockEvents = [{ id: 1, title: 'Event 1' }];
            mockAPIGetEventsList.mockResolvedValue({ data: mockEvents });

            const { result } = renderHookWithProvider();

            await act(async () => {
                await result.current.loadEvents();
            });

            await waitFor(() => {
                expect(mockAPIGetEventsList).toHaveBeenCalledWith('test_token');
            });
        });

        it('не должен загружать события без авторизации', async () => {
            const { result } = renderHookWithProvider(null);

            await act(async () => {
                await result.current.loadEvents();
            });

            expect(mockAPIGetEventsList).not.toHaveBeenCalled();
        });

        it('не должен загружать события повторно', async () => {
            mockAPIGetEventsList.mockResolvedValue({ data: [] });

            const { result } = renderHookWithProvider();

            await act(async () => {
                await result.current.loadEvents();
            });

            await act(async () => {
                await result.current.loadEvents();
            });

            expect(mockAPIGetEventsList).toHaveBeenCalledTimes(1);
        });

        it('должен обработать ошибку загрузки событий', async () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
            mockAPIGetEventsList.mockRejectedValue(new Error('API Error'));

            const { result } = renderHookWithProvider();

            await act(async () => {
                await result.current.loadEvents();
            });

            expect(consoleSpy).toHaveBeenCalled();
            consoleSpy.mockRestore();
        });
    });

    describe('loadCertificates', () => {
        it('должен загрузить сертификаты при наличии авторизации и пользователя', async () => {
            const mockCertificates = [{ id: 1, title: 'Certificate 1' }];
            mockAPIGetCertificates.mockResolvedValue({ data: mockCertificates });

            const { result } = renderHookWithProvider(
                { access_token: 'test_token' },
                { ...mockUserData, id: 123 }
            );

            await act(async () => {
                await result.current.loadCertificates();
            });

            await waitFor(() => {
                expect(mockAPIGetCertificates).toHaveBeenCalledWith('test_token', 123);
            });
        });

        it('не должен загружать сертификаты без авторизации', async () => {
            const { result } = renderHookWithProvider(null);

            await act(async () => {
                await result.current.loadCertificates();
            });

            expect(mockAPIGetCertificates).not.toHaveBeenCalled();
        });

        it('не должен загружать сертификаты без пользователя', async () => {
            const { result } = renderHookWithProvider(
                { access_token: 'test_token' },
                null
            );

            await act(async () => {
                await result.current.loadCertificates();
            });

            expect(mockAPIGetCertificates).not.toHaveBeenCalled();
        });
    });

    describe('loadBackgroundData', () => {
        it('должен запустить фоновую загрузку событий', async () => {
            mockAPIGetEventsList.mockResolvedValue({ data: [] });

            const { result } = renderHookWithProvider();

            act(() => {
                result.current.loadBackgroundData();
            });

            // Ждем выполнения setTimeout (100ms задержка в хуке)
            await act(async () => {
                await new Promise((resolve) => setTimeout(resolve, 150));
            });

            await waitFor(() => {
                expect(mockAPIGetEventsList).toHaveBeenCalled();
            });
        });
    });

    describe('hasCachedCriticalData', () => {
        it('должен вернуть true при наличии валидного кэша', () => {
            mockGetCachedData.mockImplementation((key: string) => {
                if (key === 'app_cities') return mockCityList;
                if (key === 'app_restaurants') return [mockRestaurantWithBanquets];
                return null;
            });

            const { result } = renderHookWithProvider();

            let hasCache: boolean | undefined;
            act(() => {
                hasCache = result.current.hasCachedCriticalData();
            });

            expect(hasCache).toBe(true);
        });

        it('должен вернуть false при отсутствии кэша', () => {
            mockGetCachedData.mockReturnValue(null);

            const { result } = renderHookWithProvider();

            let hasCache: boolean | undefined;
            act(() => {
                hasCache = result.current.hasCachedCriticalData();
            });

            expect(hasCache).toBe(false);
        });

        it('должен вернуть false при пустом кэше', () => {
            mockGetCachedData.mockImplementation((key: string) => {
                if (key === 'app_cities') return [];
                if (key === 'app_restaurants') return [];
                return null;
            });

            const { result } = renderHookWithProvider();

            let hasCache: boolean | undefined;
            act(() => {
                hasCache = result.current.hasCachedCriticalData();
            });

            expect(hasCache).toBe(false);
        });
    });

    describe('resetLoadFlags', () => {
        it('должен сбросить флаги загрузки', async () => {
            mockAPIGetCityList.mockResolvedValue({ data: mockCityList });
            mockAPIGetRestaurantsList.mockResolvedValue({
                data: [mockRestaurantWithBanquets],
            });

            const { result } = renderHookWithProvider();

            await act(async () => {
                await result.current.loadCriticalData();
            });

            expect(mockAPIGetCityList).toHaveBeenCalledTimes(1);

            act(() => {
                result.current.resetLoadFlags();
            });

            await act(async () => {
                await result.current.loadCriticalData();
            });

            // После сброса должен загрузить снова
            expect(mockAPIGetCityList).toHaveBeenCalledTimes(2);
        });
    });
});
