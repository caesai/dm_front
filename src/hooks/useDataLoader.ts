import { useCallback, useRef, useEffect } from 'react';
import { useAtom } from 'jotai';
// API
import { APIGetCityList } from '@/api/city.api.ts';
import { APIGetRestaurantsList } from '@/api/restaurants.api.ts';
import { APIGetCertificates } from '@/api/certificates.api.ts';
import { APIGetGastronomyDishesList } from '@/api/gastronomy.api.ts';
import { APIGetEventsList } from '@/api/events.api.ts';
// Atoms
import { authAtom, userAtom } from '@/atoms/userAtom.ts';
import { cityListAtom } from '@/atoms/cityListAtom.ts';
import { restaurantsListAtom } from '@/atoms/restaurantsListAtom.ts';
import { certificatesListAtom } from '@/atoms/certificatesListAtom.ts';
import { allGastronomyDishesListAtom } from '@/atoms/dishesListAtom.ts';
import { eventsListAtom } from '@/atoms/eventListAtom.ts';
// Types
import { IRestaurant } from '@/types/restaurant.types.ts';
import { ICity } from '@/atoms/cityListAtom.ts';
// Utils
import { getCachedData, setCachedData } from '@/hooks/useCachedData.ts';
import { R } from '@/__mocks__/restaurant.mock';

const CACHE_KEYS = {
    cities: 'app_cities',
    restaurants: 'app_restaurants',
} as const;

/**
 * Хук для умной загрузки данных приложения.
 *
 * Реализует:
 * - Приоритизацию загрузки (критичные данные сначала)
 * - Кэширование с stale-while-revalidate
 * - Ленивую загрузку некритичных данных
 */
export const useDataLoader = () => {
    const [auth] = useAtom(authAtom);
    const [user] = useAtom(userAtom);
    const [, setCitiesList] = useAtom(cityListAtom);
    const [, setRestaurantsList] = useAtom(restaurantsListAtom);
    const [, setCertificatesList] = useAtom(certificatesListAtom);
    const [, setAllGastronomyDishesList] = useAtom(allGastronomyDishesListAtom);
    const [, setEventsList] = useAtom(eventsListAtom);

    // Флаги для предотвращения повторной загрузки
    const loadedRef = useRef({
        critical: false,
        events: false,
        certificates: false,
        gastronomy: false,
    });

    /**
     * Загружает критичные данные для отображения IndexPage.
     * Использует кэширование для мгновенного отображения.
     *
     * @returns Promise, который разрешается когда критичные данные загружены
     */
    const loadCriticalData = useCallback(async (): Promise<boolean> => {
        if (!auth?.access_token || loadedRef.current.critical) {
            return true;
        }

        loadedRef.current.critical = true;

        // Сразу показываем кэшированные данные
        const cachedCities = getCachedData<ICity[]>(CACHE_KEYS.cities);
        const cachedRestaurants = getCachedData<IRestaurant[]>(CACHE_KEYS.restaurants);

        if (cachedCities) {
            setCitiesList(cachedCities);
        }
        if (cachedRestaurants) {
            setRestaurantsList(cachedRestaurants);
        }

        // Если есть кэш - сразу считаем загрузку завершенной
        const hasCachedData = !!(cachedCities && cachedRestaurants);

        // Загружаем свежие данные
        const [citiesResult, restaurantsResult] = await Promise.allSettled([
            APIGetCityList(),
            APIGetRestaurantsList(auth.access_token),
        ]);

        // Обновляем данные из API
        if (citiesResult.status === 'fulfilled') {
            setCitiesList(citiesResult.value.data);
            setCachedData(CACHE_KEYS.cities, citiesResult.value.data);
        }

        if (restaurantsResult.status === 'fulfilled') {
            setRestaurantsList(restaurantsResult.value.data);
            setCachedData(CACHE_KEYS.restaurants, restaurantsResult.value.data);
        }

        return Boolean(
            hasCachedData || citiesResult.status === 'fulfilled' || restaurantsResult.status === 'fulfilled'
        );
    }, [auth?.access_token, setCitiesList, setRestaurantsList]);

    /**
     * Загружает события (фоновая загрузка)
     */
    const loadEvents = useCallback(async (): Promise<void> => {
        if (!auth?.access_token || loadedRef.current.events) {
            return;
        }

        loadedRef.current.events = true;

        try {
            const response = await APIGetEventsList(auth.access_token);
            setEventsList(response.data);
        } catch (error) {
            console.error('[useDataLoader] Failed to load events:', error);
            loadedRef.current.events = false; // Позволяем повторную попытку
        }
    }, [auth?.access_token, setEventsList]);

    /**
     * Загружает сертификаты пользователя (ленивая загрузка)
     */
    const loadCertificates = useCallback(async (): Promise<void> => {
        if (!auth?.access_token || !user?.id || loadedRef.current.certificates) {
            return;
        }

        loadedRef.current.certificates = true;

        try {
            const response = await APIGetCertificates(auth.access_token, Number(user.id));
            setCertificatesList(response.data);
        } catch (error) {
            console.error('[useDataLoader] Failed to load certificates:', error);
            loadedRef.current.certificates = false;
        }
    }, [auth?.access_token, user?.id, setCertificatesList]);

    /**
     * Загружает блюда гастрономии (ленивая загрузка)
     */
    const loadGastronomyDishes = useCallback(async (): Promise<void> => {
        if (!auth?.access_token || loadedRef.current.gastronomy) {
            return;
        }

        loadedRef.current.gastronomy = true;

        try {
            const response = await APIGetGastronomyDishesList(auth.access_token);
            setAllGastronomyDishesList(
                // TODO: Выключаем кулинарию для списка ресторанов
                response.data.filter(
                    (dish) =>
                        dish.restaurant_id !== Number(R.SMOKE_BBQ_SPB_LODEYNOPOLSKAYA_ID) &&
                        dish.restaurant_id !== Number(R.SMOKE_BBQ_SPB_RUBINSHTEINA_ID) &&
                        dish.restaurant_id !== Number(R.BLACKCHOPS_SPB_FONTANKA_RIVER_ID) &&
                        dish.restaurant_id !== Number(R.TRAPPIST_SPB_RADISHEVA_ID) &&
                        dish.restaurant_id !== Number(R.SMOKE_BBQ_MSC_TRUBNAYA_ID)
                )
            );
        } catch (error) {
            console.error('[useDataLoader] Failed to load gastronomy dishes:', error);
            loadedRef.current.gastronomy = false;
        }
    }, [auth?.access_token, setAllGastronomyDishesList]);

    /**
     * Загружает все фоновые данные
     */
    const loadBackgroundData = useCallback((): void => {
        // Загружаем в фоне с небольшой задержкой для приоритизации рендера
        setTimeout(() => {
            loadEvents();
        }, 100);
    }, [loadEvents]);

    /**
     * Сброс флагов загрузки (для повторной загрузки при смене пользователя)
     */
    const resetLoadFlags = useCallback((): void => {
        loadedRef.current = {
            critical: false,
            events: false,
            certificates: false,
            gastronomy: false,
        };
    }, []);

    return {
        loadCriticalData,
        loadEvents,
        loadCertificates,
        loadGastronomyDishes,
        loadBackgroundData,
        resetLoadFlags,
    };
};

/**
 * Хук для ленивой загрузки данных при первом монтировании компонента
 */
export const useLazyLoad = (loadFn: () => Promise<void>, deps: unknown[] = []) => {
    const loadedRef = useRef(false);

    useEffect(() => {
        if (!loadedRef.current) {
            loadedRef.current = true;
            loadFn();
        }
    }, deps);
};
