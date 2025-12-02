import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAtom } from 'jotai';
import { useGastronomyCart } from '@/hooks/useGastronomyCart.ts';
import { CartItem } from '@/components/CartItem/CartItem.tsx';
import { DateListSelector } from '@/components/DateListSelector/DateListSelector.tsx';
import { PickerValueObj } from '@/lib/react-mobile-picker/components/Picker.tsx';
import emptyBasketIcon from '/img/empty-basket.png';
import { restaurantsListAtom } from '@/atoms/restaurantsListAtom.ts';
import {
    KAD_COORDS,
    MKAD_COORDS,
    PETROGRADKA_RESTAURANT_ID,
    PETROGRADKA_ZONE,
} from '@/__mocks__/gastronomy.mock.ts';
import { formatDate } from '@/utils.ts';
import useToast from '@/hooks/useToastState.ts';
import css from './GastronomyBasketPage.module.css';
import { currentCityAtom } from '@/atoms/currentCityAtom.ts';
import { APIPostCreateGastronomyPayment, APIPostUserOrder } from '@/api/gastronomy.api.ts';
import { authAtom } from '@/atoms/userAtom.ts';
import { cityListAtom } from '@/atoms/cityListAtom.ts';

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

    const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('delivery');
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
    const addressInputRef = useRef<HTMLInputElement>(null);
    const suggestionsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const { showToast } = useToast();

    const deliveryFee = 1500;

    // Получаем информацию о ресторане
    const restaurant = useMemo(() => {
        if (!res_id) return null;
        return restaurants.find(r => r.id === Number(res_id));
    }, [res_id, restaurants]);

    const restaurantAddress = restaurant?.address || 'Адрес не указан';

    // Генерируем доступные даты
    const availableDates = useMemo(() => {
        const dates: PickerValueObj[] = [];
        const startDate = new Date(2025, 11, 25); // 25 декабря 2025
        const endDate = deliveryMethod === 'delivery'
            ? new Date(2025, 11, 30) // 30 декабря для доставки
            : new Date(2025, 11, 31); // 31 декабря для самовывоза

        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toISOString().split('T')[0];
            dates.push({
                title: formatDate(dateStr),
                value: dateStr,
            });
        }
        return dates;
    }, [deliveryMethod]);

    // Генерируем временные слоты в зависимости от выбранной даты
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
            // Берем первый рабочий день для примера
            const workTime = restaurant.worktime[0];
            const [openH] = workTime.time_start.split(':').map(Number);
            const [closeH] = workTime.time_end.split(':').map(Number);
            openHour = openH;
            closeHour = closeH;
        }

        const slots: string[] = [];
        let currentHour = openHour;

        // Генерируем слоты по 3 часа от открытия до закрытия
        while (true) {
            const nextHour = currentHour + 3;

            // Если следующий час >= 24, значит переходим на следующий день
            // В этом случае последний слот идет до времени закрытия
            if (nextHour >= 24) {
                // Последний слот до закрытия (например, 23:00-01:00)
                slots.push(
                    `${String(currentHour).padStart(2, '0')}:00–${String(closeHour).padStart(2, '0')}:00`,
                );
                break;
            }

            // Если закрытие на следующий день (closeHour < openHour) и мы еще не достигли перехода через полночь
            // Продолжаем добавлять слоты по 3 часа
            if (closeHour < openHour) {
                // Если следующий час >= 24, значит это последний слот
                if (nextHour >= 24) {
                    slots.push(
                        `${String(currentHour).padStart(2, '0')}:00–${String(closeHour).padStart(2, '0')}:00`,
                    );
                    break;
                }
            } else {
                // Если закрытие в тот же день
                if (nextHour > closeHour) {
                    // Последний слот до закрытия
                    slots.push(
                        `${String(currentHour).padStart(2, '0')}:00–${String(closeHour).padStart(2, '0')}:00`,
                    );
                    break;
                }
            }

            // Добавляем слот на 3 часа
            slots.push(
                `${String(currentHour).padStart(2, '0')}:00–${String(nextHour).padStart(2, '0')}:00`,
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

    const handleGoToMenu = () => {
        navigate(`/gastronomy/${res_id}`);
    };

    // Загрузка подсказок адресов через Яндекс Geocoder API
    const loadAddressSuggestions = useCallback(async (query: string) => {
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
            // TODO:  разобраться с координатами в bbox внутри этого url
            const url = `https://geocode-maps.yandex.ru/1.x/?apikey=${String(import.meta.env.VITE_YANDEX_MAPS_API_KEY)}&geocode=${encodeURIComponent(searchQuery)}&format=json&results=5&bbox=37.319,55.489~37.967,55.958`;

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
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
                const suggestions: AddressSuggestion[] = featureMembers.map((item: any) => {
                    const geoObject = item.GeoObject;
                    const name = geoObject.name || '';
                    const description = geoObject.description || '';
                    const fullAddress = description ? `${name}, ${description}` : name;

                    return {
                        value: fullAddress,
                        displayName: fullAddress,
                        coordinates: undefined,
                    };
                }).filter((s: AddressSuggestion) => s.displayName && s.displayName.length > 0);

                setAddressSuggestions(suggestions);
            } else {
                setAddressSuggestions([]);
            }
        } catch (error) {
            setAddressSuggestions([]);
        }
    }, []);

    // Получение координат адреса через Яндекс Geocoder API
    const geocodeAddress = async (address: string): Promise<[number, number] | null> => {
        try {
            const response = await fetch(
                `https://geocode-maps.yandex.ru/1.x/?apikey=${String(import.meta.env.VITE_YANDEX_MAPS_API_KEY)}&geocode=${encodeURIComponent(address)}&format=json`,
            );
            const data = await response.json();

            if (data.response?.GeoObjectCollection?.featureMember?.length > 0) {
                const geoObject = data.response.GeoObjectCollection.featureMember[0].GeoObject;
                const pos = geoObject.Point.pos.split(' ').map(Number);
                return [pos[1], pos[0]]; // [широта, долгота]
            }
            return null;
        } catch (error) {
            console.error('Error geocoding address:', error);
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
            if (res_id === PETROGRADKA_RESTAURANT_ID) {
                return isPointInPolygon(coords, PETROGRADKA_ZONE);
            }
            return isPointInPolygon(coords, KAD_COORDS);
        }
        return false;
    };

    // Обработка изменения адреса с debounce
    const handleAddressChange = useCallback((value: string) => {
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
    }, [loadAddressSuggestions]);

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
                        'error',
                    );
                    return;
                }
            } else {
                showToast(
                    'Не удалось определить адрес. Пожалуйста, выберите адрес из списка.',
                    'error',
                );
                return;
            }
        }

        if (!auth || !res_id) return;
        APIPostUserOrder({
            items: cart.items,
            restaurant_id: Number(res_id),
            delivery_cost: deliveryFee,
            delivery_method: deliveryMethod,
            total_amount: cart.totalAmount,
            delivery_address: address,
        }, auth.access_token)
            .then((response) => {
                APIPostCreateGastronomyPayment(response.data.order_id, auth.access_token)
                    .then((res) => {
                        window.location.href = res.data.payment_url;
                    })
                    .catch((err) => {
                        showToast(
                            'Не удалось создать платеж. Пожалуйста, попробуйте еще раз или проверьте соединение.',
                        );
                        console.error(err);
                    });
            })
            .catch((err) => console.error(err));
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
        const isMinAmount = cart.totalAmount >= 3000;

        if (deliveryMethod === 'delivery') {
            return address.length > 0 && isDateSelected && isTimeSelected && isMinAmount;
        }
        return isDateSelected && isTimeSelected && isMinAmount;
    };

    // const totalWithDelivery = deliveryMethod === 'delivery'
    //     ? cart.totalAmount + deliveryFee
    //     : cart.totalAmount;

    // Пустая корзина
    if (cart.totalItems === 0) {
        return (
            <div className={css.pageEmpty}>
                <div className={css.emptyState}>
                    <div className={css.emptyIcon}>
                        <img
                            src={emptyBasketIcon}
                            alt="Пустая корзина"
                            width="116"
                            height="124"
                        />
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
                <div className={css.section}>
                    <h2 className={css.sectionTitle}>Сумма заказа</h2>
                    <div className={css.itemsList}>
                        {cart.items.map((item) => (
                            <CartItem
                                key={item.id}
                                {...item}
                                onAdd={() => {
                                    // TODO: Проверить типы IDish ICartItem
                                    addToCart({
                                        id: item.id,
                                        title: item.title,
                                        prices: [item.price],
                                        weights: [item.weight],
                                        image_url: item.image,
                                        description: '',
                                        nutritionPer100g: { calories: '0', proteins: '0', fats: '0', carbs: '0' },
                                        allergens: [],
                                    }, 0);
                                }}
                                onRemove={() => removeFromCart(item.id)}
                            />
                        ))}
                    </div>
                    <div className={css.total}>
                        <span className={css.totalLabel}>Итого</span>
                        <span className={css.totalValue}>{cart.totalAmount} ₽</span>
                    </div>
                </div>

                {/* Способ получения */}
                <div className={css.section}>
                    <h2 className={css.sectionTitle}>Способ получения</h2>
                    <div className={css.deliveryDropdown}>
                        <div
                            className={css.deliveryRow}
                            onClick={handleToggleDropdown}
                        >
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
                                <path d="M5 8.5L12 15.5L19 8.5" stroke="#989898" strokeWidth="1.5" strokeLinecap="round"
                                      strokeLinejoin="round" />
                            </svg>
                        </div>
                        {isDeliveryExpanded && (
                            <div
                                className={css.deliveryOption}
                                onClick={() => handleSelectMethod(deliveryMethod === 'delivery' ? 'pickup' : 'delivery')}
                            >
                                <span className={css.deliveryText}>
                                    {deliveryMethod === 'delivery' ? 'Заберу сам' : 'Доставка'}
                                </span>
                                <div className={css.radioButton}></div>
                            </div>
                        )}
                    </div>
                </div>

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
                            <span
                                className={css.deliveryLabel}>{(currentCity === 'moscow' || currentCity === 'spb') && `в пределах ${currentCity === 'moscow' ? 'МКАД' : 'КАД'}`}</span>
                            <span className={css.deliveryPrice}>{deliveryFee} ₽</span>
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
                            className={css.datePicker}
                            onClick={() => setShowDatePicker(true)}
                        >
                            <div className={css.datePickerContent}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                    <rect x="3" y="6" width="18" height="15" rx="2" stroke="#545454"
                                          strokeWidth="1.5" />
                                    <path d="M3 10H21" stroke="#545454" strokeWidth="1.5" />
                                    <path d="M8 3V6" stroke="#545454" strokeWidth="1.5" strokeLinecap="round" />
                                    <path d="M16 3V6" stroke="#545454" strokeWidth="1.5" strokeLinecap="round" />
                                </svg>
                                <span
                                    className={selectedDate.value !== 'unset' ? css.datePickerTextSelected : css.datePickerTextPlaceholder}>
                                    {selectedDate.value !== 'unset'
                                        ? selectedDate.title
                                        : deliveryMethod === 'delivery'
                                            ? 'Выберите дату с 25 по 30 декабря'
                                            : 'Выберите дату с 25 по 31 декабря'}
                                </span>
                            </div>
                            <svg
                                width="20"
                                height="20"
                                viewBox="0 0 20 20"
                                fill="none"
                            >
                                <path d="M16 7L10 13L4 7" stroke="#545454" strokeWidth="1.5" strokeLinecap="round"
                                      strokeLinejoin="round" />
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
                                            className={selectedTime === slot ? css.timeSlotActive : css.timeSlot}
                                            onClick={() => setSelectedTime(slot)}
                                        >
                                            {slot}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <p className={css.hint}>
                                * обязательно предупредим вас, если будем опаздывать.
                            </p>
                        </>
                    )}
                </div>
            </div>

            {/* Кнопка оплаты */}
            <div className={css.buttonContainer}>
                <button
                    className={isFormValid() ? css.primaryButton : css.secondaryButton}
                    onClick={handlePayment}
                    disabled={!isFormValid()}
                >
                    К оплате
                </button>
            </div>

        </div>
    );
};
