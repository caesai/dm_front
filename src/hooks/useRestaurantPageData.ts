import { Dispatch, SetStateAction, useCallback, useEffect, useRef, useState } from 'react';
import { useAtom } from 'jotai';
// API
import { 
    APIGetAvailableDays, 
    APIGetAvailableTimeSlots, 
    APIGetEventsInRestaurant 
} from '@/api/restaurants.api.ts';
// Types
import { IEvent } from '@/types/events.types.ts';
import { ITimeSlot } from '@/pages/BookingPage/BookingPage.types.ts';
// Atoms
import { authAtom } from '@/atoms/userAtom.ts';
import { bookingDateAtom, timeslotAtom } from '@/atoms/bookingInfoAtom.ts';
// Utils
import { formatDate } from '@/utils.ts';
import { PickerValue } from '@/lib/react-mobile-picker/components/Picker.tsx';

interface UseRestaurantPageDataOptions {
    restaurantId: string;
    onError?: (message: string) => void;
}

interface UseRestaurantPageDataReturn {
    // События
    events: IEvent[] | null;
    eventsLoading: boolean;
    // Даты бронирования
    dates: PickerValue[];
    date: PickerValue;
    setDate: Dispatch<SetStateAction<PickerValue>>;
    datesLoading: boolean;
    // Таймслоты
    availableTimeslots: ITimeSlot[];
    timeslotLoading: boolean;
    timeslotsError: boolean;
    currentSelectedTime: ITimeSlot | null;
    setCurrentSelectedTime: (time: ITimeSlot | null) => void;
    // Общее состояние загрузки
    isInitialLoading: boolean;
}

// Кэш для доступных дней (в памяти, сбрасывается при перезагрузке)
const daysCache = new Map<string, { data: PickerValue[]; timestamp: number }>();
const DAYS_CACHE_TTL = 5 * 60 * 1000; // 5 минут

// Глобальное отслеживание инициализированных ресторанов (общее для всех вызовов хука)
let globalInitializedRestaurantId: string | null = null;

/**
 * Хук для оптимизированной загрузки данных страницы ресторана.
 * 
 * Оптимизации:
 * - Параллельная загрузка событий и доступных дней
 * - Кэширование доступных дней в памяти
 * - Предотвращение дублирующих запросов
 * - Умная инвалидация при смене ресторана
 * - Загрузка данных только для текущего ресторана
 * - Уменьшение количества запросов к API
 *  Возвращает:
 * - События 
 * - Загрузка событий
 * - Даты бронирования
 * - Дата бронирования
 * - Установка даты бронирования
 * - Загрузка дат бронирования
 * - Доступные таймслоты
 * - Загрузка таймслотов
 * - Ошибка загрузки таймслотов
 * - Текущий выбранный таймслот
 * - Установка текущего выбранного таймслота
 * - Начальная загрузка
 */
export const useRestaurantPageData = ({
    restaurantId,
    onError,
}: UseRestaurantPageDataOptions): UseRestaurantPageDataReturn => {
    const [auth] = useAtom(authAtom);
    const [date, setDate] = useAtom(bookingDateAtom);
    const [currentSelectedTime, setCurrentSelectedTimeAtom] = useAtom(timeslotAtom);

    // Состояния
    const [events, setEvents] = useState<IEvent[] | null>(null);
    const [eventsLoading, setEventsLoading] = useState(true);
    const [dates, setDates] = useState<PickerValue[]>([]);
    const [datesLoading, setDatesLoading] = useState(true);
    const [availableTimeslots, setAvailableTimeslots] = useState<ITimeSlot[]>([]);
    const [timeslotLoading, setTimeslotLoading] = useState(true);
    const [timeslotsError, setTimeslotsError] = useState(false);

    // Refs для отслеживания текущих запросов
    const currentRequestRef = useRef<{ events?: AbortController; days?: AbortController; timeslots?: AbortController }>({});

    /**
     * Получает закэшированные дни или null
     */
    const getCachedDays = useCallback((id: string): PickerValue[] | null => {
        const cacheKey = `restaurant_${id}`;
        const cached = daysCache.get(cacheKey);
        
        if (cached && Date.now() - cached.timestamp < DAYS_CACHE_TTL) {
            return cached.data;
        }
        
        return null;
    }, []);

    /**
     * Сохраняет дни в кэш
     */
    const cacheDays = useCallback((id: string, days: PickerValue[]) => {
        const cacheKey = `restaurant_${id}`;
        daysCache.set(cacheKey, { data: days, timestamp: Date.now() });
    }, []);

    /**
     * Загружает начальные данные (события + доступные дни) параллельно
     */
    const loadInitialData = useCallback(async () => {
        if (!auth?.access_token || !restaurantId) return;

        // Проверяем, нужно ли сбрасывать состояние при смене ресторана
        const isNewRestaurant = globalInitializedRestaurantId !== restaurantId;
        
        if (isNewRestaurant) {
            // Отменяем предыдущие запросы
            currentRequestRef.current.events?.abort();
            currentRequestRef.current.days?.abort();
            currentRequestRef.current.timeslots?.abort();

            // Сбрасываем состояние для нового ресторана
            setCurrentSelectedTimeAtom(null);
            setDate({ value: 'unset', title: 'unset' });
            setEvents(null);
            setEventsLoading(true);
            setDatesLoading(true);
            setAvailableTimeslots([]);
        }

        // Проверяем кэш для дней
        const cachedDays = getCachedDays(restaurantId);
        if (cachedDays && cachedDays.length > 0) {
            setDates(cachedDays);
            setDatesLoading(false);
            
            // Устанавливаем первую дату только для нового ресторана
            if (isNewRestaurant) {
                setDate(cachedDays[0]);
            }
        }

        // Создаем контроллеры для отмены запросов
        const eventsController = new AbortController();
        const daysController = new AbortController();
        currentRequestRef.current.events = eventsController;
        currentRequestRef.current.days = daysController;

        // Запускаем параллельную загрузку
        const eventsPromise = APIGetEventsInRestaurant(restaurantId, auth.access_token)
            .then((res) => {
                if (!eventsController.signal.aborted) {
                    setEvents(res.data);
                }
            })
            .catch((err) => {
                if (!eventsController.signal.aborted) {
                    console.error('[useRestaurantPageData] Events error:', err);
                    setEvents([]);
                    onError?.('Ошибка при загрузке событий');
                }
            })
            .finally(() => {
                if (!eventsController.signal.aborted) {
                    setEventsLoading(false);
                }
            });

        // Загружаем дни только если нет в кэше
        const daysPromise = cachedDays 
            ? Promise.resolve() 
            : APIGetAvailableDays(auth.access_token, restaurantId, 1)
                .then((res) => {
                    if (!daysController.signal.aborted) {
                        const formattedDates = res.data.map((date) => ({
                            title: formatDate(date),
                            value: date,
                        }));
                        
                        setDates(formattedDates);
                        cacheDays(restaurantId, formattedDates);

                        // Устанавливаем первую дату для нового ресторана
                        if (formattedDates.length > 0 && isNewRestaurant) {
                            setDate(formattedDates[0]);
                        }
                    }
                })
                .catch((err) => {
                    if (!daysController.signal.aborted) {
                        console.error('[useRestaurantPageData] Days error:', err);
                        onError?.('Ошибка при загрузке доступных дат');
                    }
                })
                .finally(() => {
                    if (!daysController.signal.aborted) {
                        setDatesLoading(false);
                    }
                });

        await Promise.all([eventsPromise, daysPromise]);
        
        if (isNewRestaurant) {
            globalInitializedRestaurantId = restaurantId;
        }
    }, [
        auth?.access_token, 
        restaurantId, 
        getCachedDays, 
        cacheDays, 
        setDate, 
        setCurrentSelectedTimeAtom,
        onError
    ]);

    /**
     * Загружает таймслоты для выбранной даты
     */
    const loadTimeslots = useCallback(async () => {
        if (!auth?.access_token || !restaurantId || date.value === 'unset') {
            return;
        }

        // Отменяем предыдущий запрос таймслотов
        currentRequestRef.current.timeslots?.abort();
        
        const controller = new AbortController();
        currentRequestRef.current.timeslots = controller;

        setTimeslotLoading(true);
        setTimeslotsError(false);

        try {
            const res = await APIGetAvailableTimeSlots(
                auth.access_token, 
                restaurantId, 
                date.value.toString(), 
                1
            );
            
            if (!controller.signal.aborted) {
                setAvailableTimeslots(res.data);
            }
        } catch (err) {
            if (!controller.signal.aborted) {
                console.error('[useRestaurantPageData] Timeslots error:', err);
                setAvailableTimeslots([]);
                setTimeslotsError(true);
                onError?.('Ошибка при загрузке доступного времени');
            }
        } finally {
            if (!controller.signal.aborted) {
                setTimeslotLoading(false);
            }
        }
    }, [auth?.access_token, restaurantId, date.value, onError]);

    // Загружаем начальные данные при смене ресторана
    useEffect(() => {
        loadInitialData();

        // Cleanup при размонтировании
        return () => {
            currentRequestRef.current.events?.abort();
            currentRequestRef.current.days?.abort();
            currentRequestRef.current.timeslots?.abort();
        };
    }, [loadInitialData]);

    // Загружаем таймслоты при смене даты
    useEffect(() => {
        loadTimeslots();
    }, [loadTimeslots]);

    // Вычисляемое состояние начальной загрузки
    const isInitialLoading = eventsLoading && datesLoading;

    return {
        events,
        eventsLoading,
        dates,
        date,
        setDate,
        datesLoading,
        availableTimeslots,
        timeslotLoading,
        timeslotsError,
        currentSelectedTime,
        setCurrentSelectedTime: setCurrentSelectedTimeAtom,
        isInitialLoading,
    };
};

