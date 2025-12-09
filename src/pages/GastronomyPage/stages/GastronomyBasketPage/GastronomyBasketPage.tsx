import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAtom } from 'jotai';
import { PickerValueObj } from '@/lib/react-mobile-picker/components/Picker.tsx';
// APIs
import { APIPostCreateGastronomyPayment, APIPostUserOrder } from '@/api/gastronomy.api.ts';
// Atoms
import { restaurantsListAtom } from '@/atoms/restaurantsListAtom.ts';
import { currentCityAtom } from '@/atoms/currentCityAtom.ts';
import { authAtom, userAtom } from '@/atoms/userAtom.ts';
import { cityListAtom } from '@/atoms/cityListAtom.ts';
// Components
import { CartItem } from '@/components/CartItem/CartItem.tsx';
import { DateListSelector } from '@/components/DateListSelector/DateListSelector.tsx';
import { Loader } from '@/components/AppLoadingScreen/AppLoadingScreen.tsx';
// Hooks
import { useGastronomyCart } from '@/hooks/useGastronomyCart.ts';
import useToast from '@/hooks/useToastState.ts';
// Utils
import { formatDate } from '@/utils.ts';
// Styles
import css from '@/pages/GastronomyPage/stages/GastronomyBasketPage/GastronomyBasketPage.module.css';
// Mocks
import { R } from '@/__mocks__/restaurant.mock.ts';
import { BLACKCHOPS_SPB_FONTANKA_RIVER_ZONE, KAD_COORDS, MKAD_COORDS, PETROGRADKA_ZONE } from '@/__mocks__/gastronomy.mock.ts';
import emptyBasketIcon from '/img/empty-basket.png';

type DeliveryMethod = 'delivery' | 'pickup';

interface AddressSuggestion {
    value: string;
    displayName: string;
    coordinates?: [number, number];
}

const MIN_ADDRESS_QUERY_LENGTH = 3;
const ADDRESS_SUGGESTIONS_BLUR_DELAY = 200;

export const GastronomyBasketPage: React.FC = () => {
    const navigate = useNavigate();
    const { res_id } = useParams();
    const { cart, addToCart, removeFromCart } = useGastronomyCart();
    const [restaurants] = useAtom(restaurantsListAtom);
    const [currentCity] = useAtom(currentCityAtom);
    const [cityList] = useAtom(cityListAtom);
    const [auth] = useAtom(authAtom);
    const [user] = useAtom(userAtom);

    const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('pickup');
    const [isDeliveryExpanded, setIsDeliveryExpanded] = useState(false);
    const [address, setAddress] = useState('');
    const [addressSuggestions, setAddressSuggestions] = useState<AddressSuggestion[]>([]);
    const [selectedAddressCoordinates, setSelectedAddressCoordinates] = useState<[number, number] | null>(null);
    const [selectedDate, setSelectedDate] = useState<PickerValueObj>({
        title: 'unset',
        value: 'unset',
    });
    const [selectedTime, setSelectedTime] = useState('');
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [loading, setLoading] = useState<boolean>(false);
    const addressInputRef = useRef<HTMLInputElement>(null);
    const suggestionsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const { showToast } = useToast();

    // Получаем информацию о ресторане
    const restaurant = useMemo(() => {
        if (!res_id) return null;
        return restaurants.find((r) => r.id === Number(res_id));
    }, [res_id, restaurants]);

    const restaurantAddress = restaurant?.address || 'Адрес не указан';

    /**
     * Стоимость доставки:
     *
     * - Smoke Лодейнопольская — 0 ₽
     * - Smoke Трубная — 1 000 ₽
     * - Smoke Рубинштейна — 1 000 ₽
     * - Poly — 1 000 ₽
     * - Pame — 1 000 ₽
     * - Trappist — 1 000 ₽
     * - BlackChops — 1000 ₽
     * - Для остальных доставка не предусмотрена (null)
     */
    const deliveryFee = useMemo(() => {
        if (deliveryMethod === 'delivery') {
            switch (String(res_id)) {
                case R.SMOKE_BBQ_SPB_LODEYNOPOLSKAYA_ID:
                    return 0;

                case R.SMOKE_BBQ_MSC_TRUBNAYA_ID:
                    return 1000;

                case R.SMOKE_BBQ_SPB_RUBINSHTEINA_ID:
                    return 1000;

                case R.POLY_SPB_BELINSKOGO_ID:
                    return 1000;

                case R.PAME_SPB_MOIKA_RIVER_ID:
                    return 1000;

                case R.TRAPPIST_SPB_RADISHEVA_ID:
                    return 1000;

                case R.BLACKCHOPS_SPB_FONTANKA_RIVER_ID:
                    return 1000;

                default:
                    return null;
            }
        } else {
            return 0;
        }
    }, [res_id, deliveryMethod]);

    // Текст для доставки
    const deliveryText = useMemo(() => {
        if (String(restaurant?.id) === R.SMOKE_BBQ_SPB_LODEYNOPOLSKAYA_ID) {
            return 'Доставляем заказы только на Петроградской стороне';
        }
        // Проверяем, находится ли ресторан в Питере (по city)
        const cityName = restaurant?.city?.name || '';
        const isPetersburg = cityName.toLowerCase().includes('петербург') || cityName.toLowerCase().includes('санкт');
        if (isPetersburg) {
            return 'В пределах КАД';
        }
        return 'в пределах МКАД';
    }, [restaurant]);

    /**
     * Минимальная сумма заказа
     *
     * - Самовывоз:
     *   - Smoke Rubinsteina — 3000 ₽
     *   - Остальные — 0 ₽
     *
     * - Доставка:
     *   - Smoke Lodeynopolskaya — 10 000 ₽
     *   - Smoke Rubinsteina — 5 000 ₽
     *   - Остальные — 3 000 ₽
     *   - BlackChops — 10 000 ₽
     */
    const minOrderAmount = useMemo(() => {
        // Если выбран самовывоз
        if (deliveryMethod === 'pickup') {
            switch (String(res_id)) {
                case R.SMOKE_BBQ_SPB_RUBINSHTEINA_ID:
                    return 3000;

                default:
                    return 0;
            }
        }

        // Если выбрана доставка
        switch (String(res_id)) {
            case R.SMOKE_BBQ_SPB_LODEYNOPOLSKAYA_ID:
                return 10000;

            case R.SMOKE_BBQ_SPB_RUBINSHTEINA_ID:
                return 5000;

            case R.BLACKCHOPS_SPB_FONTANKA_RIVER_ID:
                return 10000;

            default:
                return 3000;
        }
    }, [deliveryMethod, res_id]);

    /**
     * Генерирует список доступных дат для получения заказа.
     *
     * @remarks
     * Логика формирования дат:
     * 1. **Целевой период**: Декабрь 2025 года.
     * 2. **Диапазон дат по умолчанию**:
     *    - Для доставки (`delivery`): с 25 по 30 декабря.
     *    - Для самовывоза (`pickup`): с 25 по 31 декабря.
     * 3. **Ограничение "не день в день"**:
     *    - Доступные даты начинаются со следующего дня (`currentDay + 1`).
     * 4. Особые условия по ресторанам:
     *    - Smoke Лодейнопольская: доставка 25 - 31 декабря, самовывоз - 30, 31 декабря;
     *    - Smoke Рубинштейна: доставка - 30, 31 декабря
     *    - Smoke Трубная: доставка - 31 декабря;
     *    - BlackChops: самовывоз 25 - 31 декабря, доставки 30 - 31 декабря;
     *    - Poly: самовывоз 25-31, доставка 31;
     *    - Pame: самовывоз 25-31, доставка 31;
     *    - Trappist: самовывоз 25-31, доставка 31;
     *
     * @returns {PickerValueObj[]} Массив объектов дат для выбора, где `value` - строка формата YYYY-MM-DD.
     */
    const availableDates = useMemo((): PickerValueObj[] => {
        const dates: PickerValueObj[] = [];

        // По умолчанию: 25-30 декабря для доставки, 25-31 для самовывоза
        let baseStartDay = 25;
        let endDay = deliveryMethod === 'delivery' ? 30 : 31;

        // Особые условия для некоторых ресторанов
        switch (String(res_id)) {
            // Smoke Лодейнопольская доставка 25 - 31 декабря, самовывоз 30, 31 декабря
            case R.SMOKE_BBQ_SPB_LODEYNOPOLSKAYA_ID:
                if (deliveryMethod === 'delivery') {
                    baseStartDay = 25;
                    endDay = 31;
                } else {
                    baseStartDay = 30;
                    endDay = 31;
                }
                break;

            // Smoke Рубинштейна доставка 30, 31 декабря
            case R.SMOKE_BBQ_SPB_RUBINSHTEINA_ID:
                if (deliveryMethod === 'delivery') {
                    baseStartDay = 30;
                    endDay = 31;
                }
                break;

            // Smoke Трубная доставка только 31 декабря
            case R.SMOKE_BBQ_MSC_TRUBNAYA_ID:
                if (deliveryMethod === 'delivery') {
                    baseStartDay = 31;
                    endDay = 31;
                }
                break;

            // BlackChops самовывоз только 25 - 31 декабря, доставки 30 - 31 декабря
            case R.BLACKCHOPS_SPB_FONTANKA_RIVER_ID:
                if (deliveryMethod === 'pickup') {
                    baseStartDay = 25;
                    endDay = 31;
                } else {
                    // Доставка 30 - 31 декабря
                    baseStartDay = 30;
                    endDay = 31;
                }
                break;

            // Poly самовывоз 25-31, доставка только 31 декабря
            case R.POLY_SPB_BELINSKOGO_ID:
                if (deliveryMethod === 'pickup') {
                    baseStartDay = 25;
                    endDay = 31;
                } else {
                    baseStartDay = 31;
                    endDay = 31;
                }
                break;

            // Pame самовывоз 25-31, доставка только 31 декабря
            case R.PAME_SPB_MOIKA_RIVER_ID:
                if (deliveryMethod === 'pickup') {
                    baseStartDay = 25;
                    endDay = 31;
                } else {
                    baseStartDay = 31;
                    endDay = 31;
                }
                break;

            // Trappist самовывоз 25-31, доставка только 31 декабря
            case R.TRAPPIST_SPB_RADISHEVA_ID:
                if (deliveryMethod === 'pickup') {
                    baseStartDay = 25;
                    endDay = 31;
                } else {
                    baseStartDay = 31;
                    endDay = 31;
                }
                break;
        }

        let actualStartDay = baseStartDay;

        // Если текущая дата совпадает с целевым периодом (Декабрь 2025)
        const targetYear = 2025;
        const targetMonth = 11; // Декабрь (0-indexed)
        const today = new Date();
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth();
        const currentDay = today.getDate();
        if (currentYear === targetYear && currentMonth === targetMonth) {
            // Начинаем как минимум с завтрашнего дня
            actualStartDay = Math.max(baseStartDay, currentDay + 1);
        }

        // Генерируем даты
        for (let day = actualStartDay; day <= endDay; day++) {
            const dateStr = `${targetYear}-${String(targetMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            dates.push({
                title: formatDate(dateStr),
                value: dateStr,
            });
        }

        return dates;
    }, [deliveryMethod, res_id]);

    /**
     * Генерирует список доступных временных слотов для получения заказа.
     *
     * @remarks
     * Логика формирования слотов:
     * 1. **Специальный график 31 декабря**:
     *    - Фиксированные слоты: `12:00–14:00` и `14:00–17:00`.
     * 2. **Обычные дни (25-30 декабря)**:
     *    - Слоты формируются на основе времени работы ресторана.
     *    - Шаг слота: 3 часа.
     *    - Если время работы не найдено, используются дефолтные часы: `20:00 - 01:00`.
     *    - Учитывается переход времени работы через полночь (например, до 01:00 следующего дня).
     *
     * @returns {string[]} Массив строк с временными интервалами в формате `HH:00–HH:00`
     */
    const timeSlots = useMemo(() => {
        if (!selectedDate || selectedDate.value === 'unset') {
            return [];
        }

        const selectedDateObj = new Date(selectedDate.value);
        const day = selectedDateObj.getDate();
        const month = selectedDateObj.getMonth();

        // 31 декабря - специальные слоты
        if (day === 31 && month === 11) {
            return ['12:00–14:00', '14:00–17:00'];
        }

        // Для дат 25-30 декабря: слоты от открытия до закрытия ресторана по 3 часа
        // Получаем часы работы ресторана (по умолчанию 20:00-01:00)
        let openHour = 20;
        let closeHour = 1; // 01:00 следующего дня

        // Пытаемся получить часы работы из данных ресторана
        if (restaurant?.worktime && restaurant.worktime.length > 0) {
            // Получаем день недели выбранной даты (0 - воскресенье, 1 - понедельник, и т.д.)
            const dayOfWeek = selectedDateObj.getDay();

            // Маппинг номера дня недели на русское название (в НИЖНЕМ РЕГИСТРЕ, как в API)
            const weekdayNames = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];
            const weekdayName = weekdayNames[dayOfWeek];

            // Ищем расписание для этого дня недели
            const workTime = restaurant.worktime.find((wt) => wt.weekday === weekdayName);

            if (workTime) {
                const [openH] = workTime.time_start.split(':').map(Number);
                const [closeH] = workTime.time_end.split(':').map(Number);
                openHour = openH;
                closeHour = closeH;
            } else {
                // Если не найден конкретный день, берем первый доступный
                const workTime = restaurant.worktime[0];
                const [openH] = workTime.time_start.split(':').map(Number);
                const [closeH] = workTime.time_end.split(':').map(Number);
                openHour = openH;
                closeHour = closeH;
            }
        }

        const slots: string[] = [];
        let currentHour = openHour;

        // Определяем конечный час работы с учетом перехода через полночь
        // Если закрытие раньше открытия (например, 20:00-01:00), добавляем 24 часа к времени закрытия
        const closeHourAdjusted = closeHour < openHour ? closeHour + 24 : closeHour;

        // Генерируем слоты по 3 часа от открытия до закрытия
        while (currentHour < closeHourAdjusted) {
            let nextHour = currentHour + 3;

            // Если следующий час выходит за время закрытия, ограничиваем его временем закрытия
            if (nextHour > closeHourAdjusted) {
                nextHour = closeHourAdjusted;
            }

            // Форматируем часы для отображения (приводим к диапазону 0-23)
            const displayCurrentHour = currentHour >= 24 ? currentHour - 24 : currentHour;
            const displayNextHour = nextHour >= 24 ? nextHour - 24 : nextHour;

            slots.push(
                `${String(displayCurrentHour).padStart(2, '0')}:00–${String(displayNextHour).padStart(2, '0')}:00`
            );

            currentHour = nextHour;
        }

        return slots;
    }, [selectedDate, restaurant]);

    // Сбрасываем выбранное время при смене даты
    useEffect(() => {
        setSelectedTime('');
    }, [selectedDate]);

    // Сбрасываем выбранную дату и время при смене способа доставки
    useEffect(() => {
        setSelectedDate({ title: 'unset', value: 'unset' });
        setSelectedTime('');
    }, [deliveryMethod]);

    // Очистка таймаута при размонтировании
    useEffect(() => {
        return () => {
            if (suggestionsTimeoutRef.current) {
                clearTimeout(suggestionsTimeoutRef.current);
            }
        };
    }, []);

    // У ресторанов Smoke Trubnaya, Pame, Trappist, Poly доставка только 31ого
    useEffect(() => {
        if (
            deliveryMethod === 'delivery' &&
            [
                R.SMOKE_BBQ_MSC_TRUBNAYA_ID,
                R.PAME_SPB_MOIKA_RIVER_ID,
                R.POLY_SPB_BELINSKOGO_ID,
                R.TRAPPIST_SPB_RADISHEVA_ID,
            ].includes(res_id as string)
        ) {
            const newYearDateValue = '2025-12-31';
            setSelectedDate({ title: formatDate(newYearDateValue), value: newYearDateValue });
        } else {
            setSelectedDate({ title: 'unset', value: 'unset' });
        }
    }, [res_id, deliveryMethod]);

    const handleGoToMenu = () => {
        navigate(`/gastronomy/${res_id}`);
    };

    // Загрузка подсказок адресов через Яндекс Geocoder API
    const loadAddressSuggestions = useCallback(
        async (query: string) => {
            if (!query || query.trim().length < MIN_ADDRESS_QUERY_LENGTH) {
                setAddressSuggestions([]);
                return;
            }

            const trimmedQuery = query.trim();

            try {
                // Используем Geocoder API для поиска адресов
                // Определяем город
                const cityName = cityList.find((city) => city.name_english === currentCity)?.name || 'Москва';
                const searchQuery = `${cityName}, ${trimmedQuery}`;

                // Разные bbox для разных городов
                let bbox = '';
                if (currentCity === 'moscow') {
                    bbox = '&bbox=37.319,55.489~37.967,55.958'; // Москва
                } else if (currentCity === 'spb') {
                    bbox = '&bbox=30.1,59.8~30.6,60.1'; // Санкт-Петербург
                }

                const url = `https://geocode-maps.yandex.ru/1.x/?apikey=${String(import.meta.env.VITE_YANDEX_MAPS_API_KEY)}&geocode=${encodeURIComponent(searchQuery)}&format=json&results=5${bbox}`;

                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        Accept: 'application/json',
                    },
                });

                if (!response.ok) {
                    setAddressSuggestions([]);
                    return;
                }

                const data = await response.json();

                // Обрабатываем ответ от Geocoder API
                const featureMembers = data.response?.GeoObjectCollection?.featureMember || [];

                if (featureMembers.length > 0) {
                    const suggestions: AddressSuggestion[] = featureMembers
                        .map((item: any) => {
                            const geoObject = item.GeoObject;
                            const name = geoObject.name || '';
                            const description = geoObject.description || '';
                            const fullAddress = description ? `${name}, ${description}` : name;

                            return {
                                value: fullAddress,
                                displayName: fullAddress,
                                coordinates: undefined,
                            };
                        })
                        .filter((s: AddressSuggestion) => s.displayName && s.displayName.length > 0);

                    setAddressSuggestions(suggestions);
                } else {
                    setAddressSuggestions([]);
                }
            } catch (error) {
                setAddressSuggestions([]);
            }
        },
        [cityList, currentCity]
    );

    // Получение координат адреса через Яндекс Geocoder API
    const geocodeAddress = async (address: string): Promise<[number, number] | null> => {
        try {
            const url = `https://geocode-maps.yandex.ru/1.x/?apikey=${String(import.meta.env.VITE_YANDEX_MAPS_API_KEY)}&geocode=${encodeURIComponent(address)}&format=json`;

            const response = await fetch(url);
            const data = await response.json();

            if (data.response?.GeoObjectCollection?.featureMember?.length > 0) {
                const geoObject = data.response.GeoObjectCollection.featureMember[0].GeoObject;
                const pos = geoObject.Point.pos.split(' ').map(Number);
                const coords: [number, number] = [pos[1], pos[0]]; // [широта, долгота]
                return coords;
            }

            return null;
        } catch (error) {
            return null;
        }
    };

    // Проверка, входит ли адрес в зону доставки
    const isPointInPolygon = (point: [number, number], polygon: [number, number][]): boolean => {
        const [lat, lon] = point;
        let inside = false;

        for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
            const [lati, loni] = polygon[i];
            const [latj, lonj] = polygon[j];

            const intersect = loni > lon !== lonj > lon && lat < ((latj - lati) * (lon - loni)) / (lonj - loni) + lati;
            if (intersect) inside = !inside;
        }

        return inside;
    };

    const checkDeliveryZone = (coords: [number, number]): boolean => {
        if (currentCity === 'moscow') {
            return isPointInPolygon(coords, MKAD_COORDS);
        } else if (currentCity === 'spb') {
            // Для ресторана Smoke BBQ Санкт-Петербург (Лодейнопольская улица, ID 11) требуется особая зона доставки,
            // так как он находится вне стандартной зоны КАД. Используем PETROGRADKA_ZONE для проверки доставки.
            if (String(res_id) === String(R.SMOKE_BBQ_SPB_LODEYNOPOLSKAYA_ID)) {
                return isPointInPolygon(coords, PETROGRADKA_ZONE);
            }
            // Для ресторана BlackChops Санкт-Петербург (Фонтанка, ID 12) требуется особая зона доставки,
            // так как он находится вне стандартной зоны КАД. Используем BLACKCHOPS_SPB_FONTANKA_RIVER_ZONE для проверки доставки.
            if (String(res_id) === String(R.BLACKCHOPS_SPB_FONTANKA_RIVER_ID)) {
                return isPointInPolygon(coords, BLACKCHOPS_SPB_FONTANKA_RIVER_ZONE);
            }
            return isPointInPolygon(coords, KAD_COORDS);
        }

        return false;
    };

    // Обработка изменения адреса с debounce
    const handleAddressChange = useCallback(
        (value: string) => {
            setAddress(value);
            setSelectedAddressCoordinates(null);

            // Очищаем предыдущий таймаут
            if (suggestionsTimeoutRef.current) {
                clearTimeout(suggestionsTimeoutRef.current);
            }

            // Если текст слишком короткий, очищаем подсказки
            if (!value || value.trim().length < 3) {
                setAddressSuggestions([]);
                return;
            }

            // Устанавливаем новый таймаут для загрузки подсказок
            suggestionsTimeoutRef.current = setTimeout(() => {
                loadAddressSuggestions(value);
            }, 300);
        },
        [loadAddressSuggestions]
    );

    // Обработка выбора адреса из подсказок
    const handleSelectAddress = async (suggestion: AddressSuggestion) => {
        setAddress(suggestion.displayName);
        setAddressSuggestions([]);

        // Получаем координаты выбранного адреса
        const coords = await geocodeAddress(suggestion.displayName);
        if (coords) {
            setSelectedAddressCoordinates(coords);
        }
    };

    const handlePayment = async () => {
        if (!user?.complete_onboarding) {
            navigate('/onboarding/3', { state: { id: res_id, sharedGastronomy: true } });
            return;
        }
        if (deliveryMethod === 'delivery' && address) {
            // Проверяем зону доставки
            let coordinates = selectedAddressCoordinates;

            // Если координаты не были получены ранее, получаем их сейчас
            if (!coordinates) {
                coordinates = await geocodeAddress(address);
                if (coordinates) {
                    setSelectedAddressCoordinates(coordinates);
                }
            }

            if (coordinates) {
                const isInZone = checkDeliveryZone(coordinates);
                if (!isInZone) {
                    showToast(
                        'К сожалению, ваш адрес не входит в зону доставки. Вы можете оформить самовывоз.',
                        'error'
                    );
                    return;
                }
            } else {
                showToast('Не удалось определить адрес. Пожалуйста, выберите адрес из списка.', 'error');
                return;
            }
        }

        if (!auth || !res_id) return;
        setLoading(true);

        APIPostUserOrder(
            {
                items: cart.items,
                restaurant_id: Number(res_id),
                delivery_cost: deliveryMethod === 'pickup' ? 0 : Number(deliveryFee),
                delivery_method: deliveryMethod,
                total_amount: cart.totalAmount,
                delivery_address: deliveryMethod === 'delivery' ? address : undefined,
                pickup_time:
                    deliveryMethod === 'pickup'
                        ? {
                              date: selectedDate.value,
                              time: selectedTime,
                          }
                        : undefined,
                delivery_time:
                    deliveryMethod === 'delivery'
                        ? {
                              date: selectedDate.value,
                              time: selectedTime,
                          }
                        : undefined,
            },
            auth.access_token
        )
            .then((response) => {
                APIPostCreateGastronomyPayment(response.data.order_id, auth.access_token)
                    .then((res) => {
                        window.location.href = res.data.payment_url;
                    })
                    .catch(() => {
                        showToast(
                            'Не удалось создать платеж. Пожалуйста, попробуйте еще раз или проверьте соединение.'
                        );
                    });
            })
            .catch((err) => {
                console.log(err);
                setLoading(false);
                showToast('Не удалось создать заказ. Пожалуйста, попробуйте еще раз или проверьте соединение.');
            });
    };

    const handleToggleDropdown = () => {
        setIsDeliveryExpanded(!isDeliveryExpanded);
    };

    const handleSelectMethod = (method: DeliveryMethod) => {
        setDeliveryMethod(method);
        setIsDeliveryExpanded(false);
    };

    const isFormValid = () => {
        const isDateSelected = selectedDate && selectedDate.value !== 'unset';
        const isTimeSelected = selectedTime.length > 0;
        const isMinAmountValid = cart.totalAmount >= minOrderAmount;

        if (deliveryMethod === 'delivery') {
            return address.length > 0 && isDateSelected && isTimeSelected && isMinAmountValid;
        }
        return isDateSelected && isTimeSelected && isMinAmountValid;
    };

    const showMinAmountError = cart.totalAmount < minOrderAmount && minOrderAmount > 0;

    const handleDatePickerClick = () => {
        setShowDatePicker(true);
        if (
            deliveryMethod === 'delivery' &&
            [
                R.SMOKE_BBQ_MSC_TRUBNAYA_ID,
                R.PAME_SPB_MOIKA_RIVER_ID,
                R.POLY_SPB_BELINSKOGO_ID,
                R.TRAPPIST_SPB_RADISHEVA_ID,
            ].includes(res_id as string)
        ) {
            return;
        }
    };

    if (loading) {
        return (
            <div className={css.loader}>
                <Loader />
            </div>
        );
    }

    // Пустая корзина
    if (cart.totalItems === 0) {
        return (
            <div className={css.pageEmpty}>
                <div className={css.emptyState}>
                    <div className={css.emptyIcon}>
                        <img src={emptyBasketIcon} alt="Пустая корзина" width="116" height="124" />
                    </div>
                    <div className={css.emptyText}>
                        <span className={css.emptyTitle}>Корзина пуста</span>
                        <span className={css.emptySubtitle}>
                            В корзине пока пусто. Самое время выбрать что-нибудь вкусное
                        </span>
                    </div>
                </div>
                <div className={css.buttonContainer}>
                    <button className={css.primaryButton} onClick={handleGoToMenu}>
                        Перейти к выбору блюд
                    </button>
                </div>
            </div>
        );
    }

    // Корзина с товарами
    return (
        <div className={css.page}>
            <div className={css.content}>
                {/* Сумма заказа */}
                <div className={`${css.section} ${css.sectionFirst}`}>
                    <h2 className={css.sectionTitle}>Сумма заказа</h2>
                    <div className={css.itemsList}>
                        {cart.items.map((item) => (
                            <CartItem
                                key={item.id}
                                {...item}
                                onAdd={() => {
                                    addToCart(
                                        {
                                            id: item.id,
                                            title: item.title,
                                            prices: [item.price],
                                            weights: [item.weight],
                                            weight_value: item.weight_value,
                                            image_url: item.image,
                                            description: '',
                                            allergens: [],
                                            restaurant_id: restaurant?.id || 0,
                                        },
                                        0
                                    );
                                }}
                                onRemove={() => removeFromCart(item.id)}
                            />
                        ))}
                    </div>
                    {deliveryMethod === 'delivery' && (
                        <div className={css.delivery}>
                            <span className={css.deliveryLabel}>Доставка</span>
                            <span className={css.deliveryValue} data-testid="delivery-fee">
                                {deliveryFee === 0 ? 'Бесплатно' : `${Number(deliveryFee)} ₽`}
                            </span>
                        </div>
                    )}
                    <div className={css.total}>
                        <span className={css.totalLabel}>Итого</span>
                        <span className={css.totalValue} data-testid="total-amount">
                            {deliveryFee !== null ? cart.totalAmount + Number(deliveryFee) : cart.totalAmount} ₽
                        </span>
                    </div>
                </div>

                {/* Способ получения. Если доставки нет (deliveryFee === null), то не отображаем блок этот блок */}
                {deliveryFee !== null && (
                    <div className={css.section}>
                        <h2 className={css.sectionTitle}>Способ получения</h2>
                        <div className={css.deliveryDropdown}>
                            <div className={css.deliveryRow} onClick={handleToggleDropdown} data-testid="delivery-method-toggle">
                                <span className={css.deliveryText}>
                                    {deliveryMethod === 'delivery' ? 'Доставка' : 'Заберу сам'}
                                </span>
                                <svg
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    className={css.dropdownArrow}
                                    style={{
                                        transform: isDeliveryExpanded ? 'rotate(180deg)' : 'rotate(0)',
                                        transition: 'transform 0.3s',
                                    }}
                                >
                                    <path
                                        d="M5 8.5L12 15.5L19 8.5"
                                        stroke="#989898"
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </div>
                            {isDeliveryExpanded && (
                                <div
                                    className={css.deliveryOption}
                                    onClick={() =>
                                        handleSelectMethod(deliveryMethod === 'delivery' ? 'pickup' : 'delivery')
                                    }
                                >
                                    <span className={css.deliveryText}>
                                        {deliveryMethod === 'delivery' ? 'Заберу сам' : 'Доставка'}
                                    </span>
                                    <div className={css.radioButton}></div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Заказ можно забрать по адресу (только для самовывоза) */}
                {deliveryMethod === 'pickup' && (
                    <div className={css.section}>
                        <h2 className={css.sectionTitle}>Заказ можно забрать по адресу</h2>
                        <p className={css.pickupFullAddress}>{restaurantAddress}</p>
                    </div>
                )}

                {/* Адрес доставки (только для доставки) */}
                {deliveryMethod === 'delivery' && (
                    <div className={css.section}>
                        <h2 className={css.sectionTitle}>Адрес доставки</h2>
                        <div className={css.deliveryInfo}>
                            {restaurant?.id === 11 ? (
                                <span className={css.deliveryLabelFull}>{deliveryText}</span>
                            ) : (
                                <>
                                    <span className={css.deliveryLabel}>{deliveryText}</span>
                                    <span className={css.deliveryPrice}>{deliveryFee} ₽</span>
                                </>
                            )}
                        </div>
                        <div className={css.inputWrapper}>
                            <input
                                ref={addressInputRef}
                                type="text"
                                className={address ? css.inputFilled : css.input}
                                placeholder="Адрес"
                                value={address}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    handleAddressChange(value);
                                }}
                                onInput={(e) => {
                                    const value = (e.target as HTMLInputElement).value;
                                    handleAddressChange(value);
                                }}
                                onBlur={() => {
                                    // Закрываем подсказки с небольшой задержкой, чтобы клик по подсказке успел сработать
                                    setTimeout(() => setAddressSuggestions([]), ADDRESS_SUGGESTIONS_BLUR_DELAY);
                                }}
                            />
                            {addressSuggestions.length > 0 && (
                                <div className={css.suggestions}>
                                    {addressSuggestions.map((suggestion, idx) => (
                                        <div
                                            key={idx}
                                            className={css.suggestion}
                                            onClick={() => handleSelectAddress(suggestion)}
                                        >
                                            {suggestion.displayName}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Выбор даты и времени */}
                <div className={css.section}>
                    <h2 className={css.sectionTitle}>Выбор даты и времени</h2>
                    <DateListSelector
                        isOpen={showDatePicker}
                        setOpen={setShowDatePicker}
                        date={selectedDate}
                        setDate={setSelectedDate}
                        values={availableDates}
                    />
                    <div className={css.datePickerWrapper}>
                        <div
                            data-testid="date-picker"
                            className={css.datePicker}
                            onClick={handleDatePickerClick}
                        >
                            <div className={css.datePickerContent}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                    <rect
                                        x="3"
                                        y="6"
                                        width="18"
                                        height="15"
                                        rx="2"
                                        stroke="#545454"
                                        strokeWidth="1.5"
                                    />
                                    <path d="M3 10H21" stroke="#545454" strokeWidth="1.5" />
                                    <path d="M8 3V6" stroke="#545454" strokeWidth="1.5" strokeLinecap="round" />
                                    <path d="M16 3V6" stroke="#545454" strokeWidth="1.5" strokeLinecap="round" />
                                </svg>
                                {deliveryMethod === 'delivery' &&
                                [
                                    R.SMOKE_BBQ_MSC_TRUBNAYA_ID,
                                    R.PAME_SPB_MOIKA_RIVER_ID,
                                    R.POLY_SPB_BELINSKOGO_ID,
                                    R.TRAPPIST_SPB_RADISHEVA_ID,
                                ].includes(res_id as string) ? (
                                    <span className={css.datePickerTextSelected}>31 декабря</span>
                                ) : (
                                    <span
                                        className={
                                            selectedDate.value !== 'unset'
                                                ? css.datePickerTextSelected
                                                : css.datePickerTextPlaceholder
                                        }
                                    >
                                        {selectedDate.value !== 'unset' ? selectedDate.title : 'Выберите дату'}
                                    </span>
                                )}
                            </div>
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                <path
                                    d="M16 7L10 13L4 7"
                                    stroke="#545454"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </div>
                    </div>
                    {selectedDate.value !== 'unset' && (
                        <>
                            <div className={css.timeSlotsWrapper}>
                                <div className={css.timeSlots}>
                                    {timeSlots.map((slot) => (
                                        <button
                                            key={slot}
                                            data-testid="time-slot"
                                            className={selectedTime === slot ? css.timeSlotActive : css.timeSlot}
                                            onClick={() => setSelectedTime(slot)}
                                        >
                                            {slot}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <p className={css.hint}>* обязательно предупредим вас, если будем опаздывать.</p>
                        </>
                    )}
                </div>
            </div>

            {/* Кнопка оплаты */}
            <div className={css.buttonContainer}>
                {showMinAmountError && (
                    <p className={css.minAmountError}>Заказ от {minOrderAmount}₽ - без учета доставки</p>
                )}
                <button
                    className={isFormValid() ? css.primaryButton : css.secondaryButton}
                    onClick={handlePayment}
                    disabled={!isFormValid()}
                    data-testid="pay-button"
                >
                    {loading ? <Loader /> : 'К оплате'}
                </button>
            </div>
        </div>
    );
};
