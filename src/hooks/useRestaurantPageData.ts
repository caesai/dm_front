/**
 * @fileoverview Хук для загрузки данных страницы ресторана.
 * 
 * Загружает только события (мероприятия) ресторана.
 * 
 * Для работы с датами бронирования и таймслотами используйте {@link useBookingForm}.
 * 
 * @module hooks/useRestaurantPageData
 * 
 * @see {@link useBookingForm} - хук для работы с формой бронирования (даты, таймслоты)
 * @see {@link EventsBlock} - компонент, использующий этот хук для отображения мероприятий
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { useAtomValue } from 'jotai';
// API
import { APIGetEventsInRestaurant } from '@/api/restaurants.api.ts';
// Types
import { IEvent } from '@/types/events.types.ts';
// Atoms
import { authAtom } from '@/atoms/userAtom.ts';

/**
 * Опции хука useRestaurantPageData
 * @interface
 */
interface UseRestaurantPageDataOptions {
    /** ID ресторана для загрузки данных */
    restaurantId: string;
    /** Callback при ошибке загрузки */
    onError?: (message: string) => void;
}

/**
 * Возвращаемое значение хука useRestaurantPageData
 * @interface
 */
interface UseRestaurantPageDataReturn {
    /** Список событий ресторана */
    events: IEvent[] | null;
    /** Флаг загрузки событий */
    eventsLoading: boolean;
    /** Флаг ошибки загрузки событий */
    eventsError: boolean;
}

// Глобальное отслеживание инициализированных ресторанов
let globalInitializedRestaurantId: string | null = null;

/**
 * Хук для загрузки данных страницы ресторана.
 * 
 * Загружает только события (мероприятия) ресторана.
 * Для работы с бронированием (даты, таймслоты) используйте {@link useBookingForm}.
 * 
 * Оптимизации:
 * - Предотвращение дублирующих запросов
 * - Отмена запросов при размонтировании
 * - Умная инвалидация при смене ресторана
 * 
 * @param options - Опции хука
 * @param options.restaurantId - ID ресторана
 * @param options.onError - Callback при ошибке
 * 
 * @returns Состояние событий и загрузки
 * 
 * @example
 * // Загрузка событий для EventsBlock
 * const { events, eventsLoading } = useRestaurantPageData({ 
 *     restaurantId: '123' 
 * });
 * 
 * @example
 * // Для работы с бронированием используйте useBookingForm
 * const { form, availableDates, availableTimeslots, handlers } = useBookingForm({
 *     preSelectedRestaurant: { id: '123', title: 'Restaurant' }
 * });
 */
export const useRestaurantPageData = ({
    restaurantId,
    onError,
}: UseRestaurantPageDataOptions): UseRestaurantPageDataReturn => {
    const auth = useAtomValue(authAtom);

    // Состояния событий
    const [events, setEvents] = useState<IEvent[] | null>(null);
    const [eventsLoading, setEventsLoading] = useState(true);
    const [eventsError, setEventsError] = useState(false);

    // Ref для отслеживания текущего запроса
    const abortControllerRef = useRef<AbortController | null>(null);

    /**
     * Загружает события ресторана
     */
    const loadEvents = useCallback(async () => {
        if (!auth?.access_token || !restaurantId) {
            setEventsLoading(false);
            return;
        }

        // Проверяем, нужно ли сбрасывать состояние при смене ресторана
        const isNewRestaurant = globalInitializedRestaurantId !== restaurantId;

        if (isNewRestaurant) {
            // Отменяем предыдущий запрос
            abortControllerRef.current?.abort();

            // Сбрасываем состояние для нового ресторана
            setEvents(null);
            setEventsLoading(true);
            setEventsError(false);
        }

        // Создаем контроллер для отмены запроса
        const controller = new AbortController();
        abortControllerRef.current = controller;

        try {
            const res = await APIGetEventsInRestaurant(restaurantId, auth.access_token);

            if (!controller.signal.aborted) {
                setEvents(res.data);
                setEventsError(false);
            }
        } catch (err) {
            if (!controller.signal.aborted) {
                console.error('[useRestaurantPageData] Events error:', err);
                setEvents([]);
                setEventsError(true);
                onError?.('Ошибка при загрузке мероприятий');
            }
        } finally {
            if (!controller.signal.aborted) {
                setEventsLoading(false);
            }
        }

        if (isNewRestaurant) {
            globalInitializedRestaurantId = restaurantId;
        }
    }, [auth?.access_token, restaurantId, onError]);

    // Загружаем события при смене ресторана
    useEffect(() => {
        loadEvents();

        // Cleanup при размонтировании
        return () => {
            abortControllerRef.current?.abort();
        };
    }, [loadEvents]);

    return {
        events,
        eventsLoading,
        eventsError,
    };
};
