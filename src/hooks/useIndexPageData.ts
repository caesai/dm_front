import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAtom } from 'jotai';
import moment from 'moment';
// API
import { APIGetCurrentBookings } from '@/api/restaurants.api.ts';
import { ApiGetStoriesBlocks } from '@/api/stories.api.ts';
import { APIGetTickets } from '@/api/events.api.ts';
// Types
import { IStoryBlock } from '@/types/stories.types.ts';
import { IBookingInfo, IRestaurant } from '@/types/restaurant.types.ts';
// Atoms
import { authAtom } from '@/atoms/userAtom.ts';
import { restaurantsListAtom } from '@/atoms/restaurantsListAtom.ts';
// Mocks
import { R } from '@/__mocks__/restaurant.mock.ts';

interface UseIndexPageDataOptions {
    currentCity: string;
    cityId: number;
}

interface UseIndexPageDataReturn {
    // Бронирования
    currentBookings: IBookingInfo[] | null;
    bookingsLoading: boolean;
    // Истории
    storiesBlocks: IStoryBlock[] | null;
    storiesLoading: boolean;
    // Рестораны (отфильтрованные по городу)
    restaurantsList: IRestaurant[];
    restaurantsLoading: boolean;
    // Общее состояние
    isInitialLoading: boolean;
}

// Кэш для историй по городу (в памяти)
const storiesCache = new Map<number, { data: IStoryBlock[]; timestamp: number }>();
const STORIES_CACHE_TTL = 3 * 60 * 1000; // 3 минуты

/**
 * Хук для оптимизированной загрузки данных главной страницы.
 * 
 * Оптимизации:
 * - Параллельная загрузка бронирований/билетов и историй
 * - Кэширование историй по городу в памяти
 * - Мемоизация фильтрации ресторанов
 * - Отмена запросов при размонтировании
 */
export const useIndexPageData = ({
    currentCity,
    cityId,
}: UseIndexPageDataOptions): UseIndexPageDataReturn => {
    const [auth] = useAtom(authAtom);
    const [restaurants] = useAtom(restaurantsListAtom);

    // Состояния
    const [currentBookings, setCurrentBookings] = useState<IBookingInfo[] | null>(null);
    const [bookingsLoading, setBookingsLoading] = useState(true);
    const [storiesBlocks, setStoriesBlocks] = useState<IStoryBlock[] | null>(null);
    const [storiesLoading, setStoriesLoading] = useState(true);

    // Refs для отмены запросов
    const abortControllerRef = useRef<{ bookings?: AbortController; stories?: AbortController }>({});
    const loadedRef = useRef({ bookings: false });

    /**
     * Получает кэшированные истории для города
     */
    const getCachedStories = useCallback((id: number): IStoryBlock[] | null => {
        const cached = storiesCache.get(id);
        if (cached && Date.now() - cached.timestamp < STORIES_CACHE_TTL) {
            return cached.data;
        }
        return null;
    }, []);

    /**
     * Сохраняет истории в кэш
     */
    const cacheStories = useCallback((id: number, stories: IStoryBlock[]) => {
        storiesCache.set(id, { data: stories, timestamp: Date.now() });
    }, []);

    /**
     * Загружает бронирования и билеты (один раз при монтировании)
     */
    const loadBookings = useCallback(async () => {
        if (!auth?.access_token || loadedRef.current.bookings) return;

        loadedRef.current.bookings = true;
        const controller = new AbortController();
        abortControllerRef.current.bookings = controller;

        try {
            const [bookingsResponse, ticketsResponse] = await Promise.all([
                APIGetCurrentBookings(auth.access_token),
                APIGetTickets(auth.access_token),
            ]);

            if (controller.signal.aborted) return;

            // Преобразуем билеты в формат бронирований
            const events: IBookingInfo[] = ticketsResponse.data.map((event) => ({
                id: event.id,
                booking_type: 'event',
                booking_date: moment(event.date_start).format('YYYY-MM-DD'),
                time: moment(event.date_start).format('HH:mm'),
                restaurant: event.restaurant,
                tags: '',
                duration: 0,
                guests_count: event.guest_count,
                children_count: 0,
                event_title: event.event_title,
                booking_status: 'confirmed',
                user_comments: '',
                certificate_value: 0,
                certificate_expired_at: '',
                features: [],
            }));

            const bookings = [...events, ...bookingsResponse.data.currentBookings];
            setCurrentBookings(bookings);
        } catch (error) {
            if (!controller.signal.aborted) {
                console.error('[useIndexPageData] Bookings error:', error);
                setCurrentBookings([]);
            }
        } finally {
            if (!controller.signal.aborted) {
                setBookingsLoading(false);
            }
        }
    }, [auth?.access_token]);

    /**
     * Загружает истории для города (с кэшированием)
     */
    const loadStories = useCallback(async () => {
        if (!auth?.access_token || !cityId) return;

        // Отменяем предыдущий запрос
        abortControllerRef.current.stories?.abort();
        
        const controller = new AbortController();
        abortControllerRef.current.stories = controller;

        // Проверяем кэш
        const cached = getCachedStories(cityId);
        if (cached) {
            setStoriesBlocks(cached);
            setStoriesLoading(false);
            
            // Обновляем в фоне если кэш старше 1 минуты
            const cacheEntry = storiesCache.get(cityId);
            if (cacheEntry && Date.now() - cacheEntry.timestamp > 60 * 1000) {
                // Фоновое обновление
                ApiGetStoriesBlocks(auth.access_token, cityId)
                    .then((response) => {
                        if (!controller.signal.aborted) {
                            const stories = response.data.filter((s) => s.stories.length > 0);
                            cacheStories(cityId, stories);
                            setStoriesBlocks(stories);
                        }
                    })
                    .catch(console.error);
            }
            return;
        }

        setStoriesLoading(true);

        try {
            const response = await ApiGetStoriesBlocks(auth.access_token, cityId);
            
            if (controller.signal.aborted) return;

            const stories = response.data.filter((s) => s.stories.length > 0);
            cacheStories(cityId, stories);
            setStoriesBlocks(stories);
        } catch (error) {
            if (!controller.signal.aborted) {
                console.error('[useIndexPageData] Stories error:', error);
                setStoriesBlocks([]);
            }
        } finally {
            if (!controller.signal.aborted) {
                setStoriesLoading(false);
            }
        }
    }, [auth?.access_token, cityId, getCachedStories, cacheStories]);

    /**
     * Мемоизированная фильтрация и сортировка ресторанов по городу
     */
    const restaurantsList = useMemo(() => {
        if (!restaurants.length) return [];

        let result: IRestaurant[] = [];
        let movableValue: IRestaurant | null = null;

        restaurants.forEach((e) => {
            if (e.id !== Number(R.SELF_EDGE_SPB_CHINOIS_ID)) {
                result.push(e);
            } else {
                movableValue = e;
            }
        });

        if (movableValue !== null) {
            result.unshift(movableValue);
        }

        // Фильтруем по городу
        return result.filter((v) => v.city.name_english === currentCity);
    }, [restaurants, currentCity]);

    // Загружаем бронирования при монтировании
    useEffect(() => {
        loadBookings();

        return () => {
            abortControllerRef.current.bookings?.abort();
        };
    }, [loadBookings]);

    // Загружаем истории при смене города
    useEffect(() => {
        loadStories();

        return () => {
            abortControllerRef.current.stories?.abort();
        };
    }, [loadStories]);

    // Определяем состояние загрузки ресторанов
    const restaurantsLoading = restaurants.length === 0;
    
    // Общее состояние начальной загрузки
    const isInitialLoading = bookingsLoading && storiesLoading && restaurantsLoading;

    return {
        currentBookings,
        bookingsLoading,
        storiesBlocks,
        storiesLoading,
        restaurantsList,
        restaurantsLoading,
        isInitialLoading,
    };
};

