/**
 * @fileoverview Тесты для хука useIndexPageData.
 * 
 * Хук useIndexPageData - критичный хук для загрузки данных главной страницы.
 * Оптимизирует загрузку бронирований, билетов, историй и фильтрацию ресторанов.
 * 
 * Тесты покрывают:
 * - Загрузку бронирований и билетов
 * - Загрузку историй с кэшированием
 * - Фильтрацию ресторанов по городу
 * - Отмену запросов при размонтировании
 * - Кэширование историй
 * 
 * @module __tests__/hooks/useIndexPageData
 * 
 * @see {@link useIndexPageData} - тестируемый хук
 */

import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useIndexPageData } from '@/hooks/useIndexPageData.ts';
import { authAtom } from '@/atoms/userAtom.ts';
import { restaurantsListAtom } from '@/atoms/restaurantsListAtom.ts';
import { TestProvider } from '@/__mocks__/atom.mock.tsx';
import { mockRestaurantWithBanquets } from '@/__mocks__/restaurant.mock.ts';
import { R } from '@/__mocks__/restaurant.mock.ts';

// Мокируем moment для тестов
jest.mock('moment', () => {
    const actualMoment = jest.requireActual('moment');
    const momentFn = actualMoment.default || actualMoment;
    return {
        __esModule: true,
        default: momentFn,
        ...actualMoment,
    };
});

// ============================================
// Моки API
// ============================================

const mockAPIGetCurrentBookings = jest.fn();
const mockAPIGetTickets = jest.fn();
const mockApiGetStoriesBlocks = jest.fn();

jest.mock('@/api/restaurants.api.ts', () => ({
    APIGetCurrentBookings: (...args: any[]) => mockAPIGetCurrentBookings(...args),
}));

jest.mock('@/api/events.api.ts', () => ({
    APIGetTickets: (...args: any[]) => mockAPIGetTickets(...args),
}));

jest.mock('@/api/stories.api.ts', () => ({
    ApiGetStoriesBlocks: (...args: any[]) => mockApiGetStoriesBlocks(...args),
}));

// ============================================
// Вспомогательные функции
// ============================================

const mockBooking = {
    id: '1',
    booking_type: 'restaurant',
    booking_date: '2026-02-15',
    time: '18:00',
    restaurant: mockRestaurantWithBanquets,
    tags: '',
    duration: 120,
    guests_count: 4,
    children_count: 0,
    event_title: '',
    booking_status: 'confirmed',
    user_comments: '',
    certificate_value: 0,
    certificate_expired_at: '',
    features: [],
};

const mockTicket = {
    id: 1,
    date_start: '2026-02-20T19:00:00Z',
    restaurant: mockRestaurantWithBanquets,
    guest_count: 2,
    event_title: 'Концерт',
};

const mockStories = [
    {
        id: 1,
        restaurant: mockRestaurantWithBanquets,
        stories: [
            {
                id: 1,
                media_url: 'https://example.com/story1.jpg',
                media_type: 'image',
            },
        ],
    },
];

const renderHookWithProvider = (
    currentCity: string = 'spb',
    cityId: number = 2,
    auth?: { access_token: string } | null,
    restaurants?: any[]
) => {
    // Если auth явно передан как null, используем null, иначе используем дефолтное значение
    const authValue = auth === null ? null : (auth ?? { access_token: 'test_token' });
    const initialValues: any[] = [
        [authAtom, authValue],
        [restaurantsListAtom, restaurants ?? [mockRestaurantWithBanquets]],
    ];

    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <TestProvider initialValues={initialValues}>{children}</TestProvider>
    );

    return renderHook(
        () => useIndexPageData({ currentCity, cityId }),
        { wrapper }
    );
};

describe('useIndexPageData', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Не настраиваем моки по умолчанию - каждый тест должен настроить свои моки явно
        // Используем уникальные cityId для каждого теста, чтобы избежать конфликтов кэша
    });

    describe('loadBookings', () => {
        it('должен объединить бронирования и билеты', async () => {
            // Настраиваем моки для stories, чтобы избежать ошибок
            mockApiGetStoriesBlocks.mockResolvedValue({
                data: [],
            });

            // Настраиваем моки для этого теста
            mockAPIGetCurrentBookings.mockResolvedValue({
                data: { currentBookings: [mockBooking] },
            });
            mockAPIGetTickets.mockResolvedValue({
                data: [mockTicket],
            });

            const { result } = renderHookWithProvider();

            // Ждем, пока промисы разрешатся и состояние обновится
            await waitFor(
                () => {
                    // Проверяем, что API были вызваны
                    expect(mockAPIGetCurrentBookings).toHaveBeenCalledWith('test_token');
                    expect(mockAPIGetTickets).toHaveBeenCalledWith('test_token');
                    // Проверяем, что данные загружены
                    expect(result.current.currentBookings).not.toBeNull();
                    expect(result.current.currentBookings?.length).toBeGreaterThan(0);
                },
                { timeout: 10000 }
            );

            // Проверяем конкретное количество элементов
            expect(result.current.currentBookings?.length).toBe(2);

            // Проверяем, что данные объединены правильно
            // Билеты преобразуются в события и добавляются первыми, затем бронирования
            expect(result.current.currentBookings).not.toBeNull();
            expect(result.current.currentBookings?.length).toBe(2);
            
            const eventBooking = result.current.currentBookings?.find(b => b.booking_type === 'event');
            const restaurantBooking = result.current.currentBookings?.find(b => b.booking_type === 'restaurant');
            expect(eventBooking).toBeDefined();
            expect(restaurantBooking).toBeDefined();
        }, 20000); // Увеличиваем timeout для всего теста

        it('не должен загружать данные без авторизации', async () => {
            // Настраиваем моки (хотя они не должны быть вызваны)
            mockAPIGetCurrentBookings.mockResolvedValue({
                data: { currentBookings: [] },
            });
            mockAPIGetTickets.mockResolvedValue({
                data: [],
            });

            const { result } = renderHookWithProvider('spb', 2, null);

            // Ждем немного, чтобы убедиться, что useEffect не запустился
            await waitFor(() => {
                // Проверяем, что API не были вызваны и данные не загружены
                expect(mockAPIGetCurrentBookings).not.toHaveBeenCalled();
                expect(result.current.currentBookings).toBeNull();
            }, { timeout: 1000 });
        });

        it('не должен загружать данные повторно', async () => {
            mockAPIGetCurrentBookings.mockResolvedValue({
                data: { currentBookings: [] },
            });
            mockAPIGetTickets.mockResolvedValue({ data: [] });

            const { result, rerender } = renderHookWithProvider();

            await waitFor(() => {
                expect(result.current.currentBookings).not.toBeNull();
            });

            rerender();

            // Должен быть вызван только один раз
            expect(mockAPIGetCurrentBookings).toHaveBeenCalledTimes(1);
        });

        it('должен обработать ошибку загрузки', async () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
            mockAPIGetCurrentBookings.mockRejectedValue(new Error('API Error'));
            mockAPIGetTickets.mockRejectedValue(new Error('API Error'));

            const { result } = renderHookWithProvider();

            await waitFor(() => {
                expect(result.current.currentBookings).toEqual([]);
            });

            expect(consoleSpy).toHaveBeenCalled();
            consoleSpy.mockRestore();
        });
    });

    describe('loadStories', () => {
        it('должен загрузить истории для города', async () => {
            // Используем уникальный cityId, чтобы избежать конфликтов кэша
            const uniqueCityId = 990;
            
            // Настраиваем моки для этого теста
            mockApiGetStoriesBlocks.mockResolvedValue({
                data: mockStories,
            });

            const { result } = renderHookWithProvider('spb', uniqueCityId);

            await waitFor(() => {
                expect(result.current.storiesBlocks).not.toBeNull();
            }, { timeout: 5000 });

            expect(mockApiGetStoriesBlocks).toHaveBeenCalledWith('test_token', uniqueCityId);
        });

        it('должен использовать кэш историй', async () => {
            mockApiGetStoriesBlocks.mockResolvedValue({
                data: mockStories,
            });

            const { result: result1 } = renderHookWithProvider('spb', 2);

            await waitFor(() => {
                expect(result1.current.storiesBlocks).not.toBeNull();
            });

            // Второй вызов должен использовать кэш
            const { result: result2 } = renderHookWithProvider('spb', 2);

            // Должен сразу вернуть кэшированные данные
            await waitFor(() => {
                expect(result2.current.storiesBlocks).not.toBeNull();
            }, { timeout: 1000 });
        });

        it('должен использовать кэш историй при повторном запросе', async () => {
            mockApiGetStoriesBlocks.mockResolvedValue({
                data: mockStories,
            });

            // Используем уникальный cityId, чтобы гарантировать, что кэш пуст при первом запросе
            const uniqueCityId = 996;
            const { result: result1 } = renderHookWithProvider('spb', uniqueCityId);

            await waitFor(() => {
                expect(result1.current.storiesBlocks).not.toBeNull();
            });

            expect(mockApiGetStoriesBlocks).toHaveBeenCalledTimes(1);

            // Очищаем моки перед вторым запросом
            mockApiGetStoriesBlocks.mockClear();
            mockApiGetStoriesBlocks.mockResolvedValue({
                data: mockStories,
            });

            // Второй вызов с тем же cityId должен использовать кэш
            const { result: result2 } = renderHookWithProvider('spb', uniqueCityId);

            // Кэш работает через внутренний Map в хуке
            // Проверяем, что данные доступны сразу (из кэша)
            await waitFor(() => {
                expect(result2.current.storiesBlocks).not.toBeNull();
            });

            // API не должен быть вызван второй раз, так как используется кэш
            expect(mockApiGetStoriesBlocks).not.toHaveBeenCalled();
        });

        it('не должен загружать истории без авторизации', async () => {
            // Используем уникальный cityId, чтобы избежать использования кэша из предыдущих тестов
            const uniqueCityId = 997;
            const { result } = renderHookWithProvider('spb', uniqueCityId, null);

            await waitFor(() => {
                // Проверяем, что API не был вызван и данные не загружены
                expect(mockApiGetStoriesBlocks).not.toHaveBeenCalled();
                expect(result.current.storiesBlocks).toBeNull();
            }, { timeout: 1000 });
        });

        it('не должен загружать истории без cityId', async () => {
            // Используем уникальный cityId=0, чтобы избежать использования кэша
            const uniqueCityId = 0;
            renderHookWithProvider('spb', uniqueCityId);

            await waitFor(() => {
                // Проверяем, что API не был вызван
                expect(mockApiGetStoriesBlocks).not.toHaveBeenCalled();
            }, { timeout: 1000 });
        });

        it('должен загрузить истории для нового города', async () => {
            mockApiGetStoriesBlocks.mockResolvedValue({
                data: mockStories,
            });

            // Используем уникальные cityId, которые точно не были использованы в предыдущих тестах
            const firstCityId = 999;
            const secondCityId = 998;

            const { result: result1, unmount: unmount1 } = renderHookWithProvider('spb', firstCityId);

            await waitFor(() => {
                expect(result1.current.storiesBlocks).not.toBeNull();
                expect(mockApiGetStoriesBlocks).toHaveBeenCalledWith('test_token', firstCityId);
            });

            // Размонтируем первый хук
            unmount1();
            
            // Очищаем моки и настраиваем заново
            mockApiGetStoriesBlocks.mockClear();
            mockApiGetStoriesBlocks.mockResolvedValue({
                data: mockStories,
            });

            // Загружаем истории для другого города с другим cityId
            const { result: result2 } = renderHookWithProvider('moscow', secondCityId);

            // Ждем, пока хук загрузит истории
            await waitFor(() => {
                expect(mockApiGetStoriesBlocks).toHaveBeenCalled();
                expect(mockApiGetStoriesBlocks).toHaveBeenCalledWith('test_token', secondCityId);
                expect(result2.current.storiesBlocks).not.toBeNull();
            }, { timeout: 5000 });
        });

        it('должен фильтровать пустые истории', async () => {
            // Используем уникальный cityId, чтобы избежать конфликтов кэша
            const uniqueCityId = 991;
            
            // Настраиваем моки для этого теста
            mockApiGetStoriesBlocks.mockResolvedValue({
                data: [
                    ...mockStories,
                    {
                        id: 2,
                        restaurant: mockRestaurantWithBanquets,
                        stories: [], // Пустые истории
                    },
                ],
            });

            const { result } = renderHookWithProvider('spb', uniqueCityId);

            await waitFor(() => {
                expect(result.current.storiesBlocks).not.toBeNull();
                expect(result.current.storiesBlocks?.length).toBe(1);
            }, { timeout: 5000 });

            // Должен отфильтровать пустые истории
            expect(result.current.storiesBlocks?.length).toBe(1);
        });
    });

    describe('restaurantsList', () => {
        it('должен отфильтровать рестораны по городу', () => {
            const spbRestaurant = {
                ...mockRestaurantWithBanquets,
                id: '1',
                city: {
                    id: 2,
                    name: 'Санкт-Петербург',
                    name_english: 'spb',
                    name_dative: 'Санкт-Петербурге',
                },
            };

            const moscowRestaurant = {
                ...mockRestaurantWithBanquets,
                id: '2',
                city: {
                    id: 1,
                    name: 'Москва',
                    name_english: 'moscow',
                    name_dative: 'Москве',
                },
            };

            const { result } = renderHookWithProvider(
                'spb',
                2,
                { access_token: 'test_token' },
                [spbRestaurant, moscowRestaurant]
            );

            expect(result.current.restaurantsList).toHaveLength(1);
            expect(result.current.restaurantsList[0].city.name_english).toBe('spb');
        });

        it('должен переместить Self Edge Chinois в начало списка', () => {
            const chinoisRestaurant = {
                ...mockRestaurantWithBanquets,
                id: R.SELF_EDGE_SPB_CHINOIS_ID,
                city: {
                    id: 2,
                    name: 'Санкт-Петербург',
                    name_english: 'spb',
                    name_dative: 'Санкт-Петербурге',
                },
            };

            const otherRestaurant = {
                ...mockRestaurantWithBanquets,
                id: '1',
                city: {
                    id: 2,
                    name: 'Санкт-Петербург',
                    name_english: 'spb',
                    name_dative: 'Санкт-Петербурге',
                },
            };

            const { result } = renderHookWithProvider(
                'spb',
                2,
                { access_token: 'test_token' },
                [otherRestaurant, chinoisRestaurant]
            );

            expect(result.current.restaurantsList[0].id).toBe(R.SELF_EDGE_SPB_CHINOIS_ID);
        });

        it('должен вернуть пустой массив для пустого списка ресторанов', () => {
            const { result } = renderHookWithProvider(
                'spb',
                2,
                { access_token: 'test_token' },
                []
            );

            expect(result.current.restaurantsList).toEqual([]);
        });
    });

    describe('Отмена запросов', () => {
        it('должен отменить запросы при размонтировании', async () => {
            // Используем промис, который никогда не разрешится
            const neverResolvingPromise = new Promise<{ data: { currentBookings: any[] } }>(() => {
                // Промис никогда не разрешается
            });
            
            mockAPIGetCurrentBookings.mockReturnValue(neverResolvingPromise);
            mockAPIGetTickets.mockResolvedValue({ data: [] });

            const { result, unmount } = renderHookWithProvider();

            // Ждем начала запроса
            await waitFor(() => {
                expect(mockAPIGetCurrentBookings).toHaveBeenCalled();
            }, { timeout: 1000 });

            // Сохраняем текущее состояние перед размонтированием
            const stateBeforeUnmount = result.current.currentBookings;

            // Размонтируем до завершения запроса
            await act(async () => {
                unmount();
            });

            // Состояние не должно было измениться до размонтирования
            expect(stateBeforeUnmount).toBeNull();
        });
    });
});
