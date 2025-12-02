import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAtom } from 'jotai';
import { useGastronomyCart } from '@/hooks/useGastronomyCart.ts';
import { CartItem } from '@/components/CartItem/CartItem.tsx';
import { DateListSelector } from '@/components/DateListSelector/DateListSelector.tsx';
import { PickerValueObj } from '@/lib/react-mobile-picker/components/Picker.tsx';
import emptyBasketIcon from '/img/empty-basket.png';
import { restaurantsListAtom } from '@/atoms/restaurantsListAtom.ts';
import { mockGastronomyListData } from '@/__mocks__/gastronomy.mock.ts';
import { formatDate } from '@/utils.ts';
import useToast from '@/hooks/useToastState.ts';
import Popup from 'reactjs-popup';
import styled from 'styled-components';
import { RoundedButton } from '@/components/RoundedButton/RoundedButton.tsx';
import css from './GastronomyBasketPage.module.css';

const StyledPopup = styled(Popup)`
    &-overlay {
        background: #58585869;
        padding: 0 15px;
    }

    &-content {
        margin: 0;
        padding: 0;
        border-radius: 10px;
        width: calc(100vw - 30px);
        max-width: 345px;
    }
`;

type DeliveryMethod = 'delivery' | 'pickup';

const YANDEX_API_KEY = '8297b306-311a-44c1-88cf-ffe4ee910493';

interface AddressSuggestion {
    value: string;
    displayName: string;
    coordinates?: [number, number];
}

export const GastronomyBasketPage: React.FC = () => {
    const navigate = useNavigate();
    const { res_id } = useParams();
    const { cart, addToCart, removeFromCart } = useGastronomyCart();
    const [restaurants] = useAtom(restaurantsListAtom);

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
    const [showDeliveryZoneError, setShowDeliveryZoneError] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const addressInputRef = useRef<HTMLInputElement>(null);
    const suggestionsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const { showToast } = useToast();

    console.log('GastronomyBasketPage rendered, deliveryMethod:', deliveryMethod, 'address:', address);

    // Получаем информацию о ресторане
    const restaurant = useMemo(() => {
        if (!res_id) return null;
        return restaurants.find(r => r.id === Number(res_id));
    }, [res_id, restaurants]);

    const restaurantAddress = restaurant?.address || 'Адрес не указан';
    
    // Стоимость доставки: 0 для restaurant_id 11, 1500 для остальных
    const deliveryFee = useMemo(() => {
        if (restaurant?.id === 11) {
            return 0;
        }
        return 1500;
    }, [restaurant?.id]);
    
    // Текст для доставки
    const deliveryText = useMemo(() => {
        if (restaurant?.id === 11) {
            return 'Доставляем заказы только на Петроградской стороне';
        }
        // Проверяем, находится ли ресторан в Питере (по city)
        const cityName = restaurant?.city?.name || '';
        const isPetersburg = cityName.toLowerCase().includes('петербург') || 
                            cityName.toLowerCase().includes('санкт');
        if (isPetersburg) {
            return 'В пределах КАД';
        }
        return 'в пределах МКАД';
    }, [restaurant]);
    
    // Минимальная сумма заказа
    const minOrderAmount = useMemo(() => {
        if (deliveryMethod === 'pickup') {
            return 0;
        }
        // Для доставки
        if (restaurant?.id === 11) {
            return 10000; // Smoke BBQ Лодейнопольская
        }
        // Проверяем, является ли ресторан Smoke BBQ Рубинштейна (нужно проверить по названию или id)
        // Пока предположу, что это можно определить по названию или другому полю
        // Для простоты, если это не id 11, проверяем название
        const isRubinstein = restaurant?.title?.toLowerCase().includes('рубинштейн');
        if (isRubinstein) {
            return 5000;
        }
        return 3000; // Для остальных ресторанов
    }, [deliveryMethod, restaurant]);

    // Генерируем доступные даты (не день в день)
    const availableDates = useMemo(() => {
        const dates: PickerValueObj[] = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Минимальная дата - завтра (не день в день)
        const minDate = new Date(today);
        minDate.setDate(today.getDate() + 1);
        
        // Максимальная дата в зависимости от способа доставки
        const maxDate = deliveryMethod === 'delivery' 
            ? new Date(2025, 11, 30) // 30 декабря для доставки
            : new Date(2025, 11, 31); // 31 декабря для самовывоза
        
        // Начальная дата - максимум из минимальной даты и 25 декабря
        const startDate = new Date(2025, 11, 25);
        const actualStartDate = minDate > startDate ? minDate : startDate;
        
        for (let d = new Date(actualStartDate); d <= maxDate; d.setDate(d.getDate() + 1)) {
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

        // 31 декабря - специальные слоты (только для самовывоза)
        if (day === 31 && month === 11) {
            return ['12:00–14:00', '14:00–17:00'];
        }

        // Для дат 25-30 декабря: слоты от открытия до закрытия ресторана по 3 часа
        // Получаем часы работы ресторана (по умолчанию 20:00-01:00)
        let openHour = 20;
        let closeHour = 1; // 01:00 следующего дня

        // Пытаемся получить часы работы из данных ресторана
        if (restaurant?.worktime && restaurant.worktime.length > 0) {
            // Берем первый рабочий день
            const workTime = restaurant.worktime[0];
            const [openH] = workTime.time_start.split(':').map(Number);
            const [closeH] = workTime.time_end.split(':').map(Number);
            openHour = openH;
            closeHour = closeH;
        }

        const slots: string[] = [];
        let currentHour = openHour;
        const isNextDay = closeHour < openHour; // Закрытие на следующий день

        // Генерируем слоты по 3 часа от открытия до закрытия
        while (true) {
            const nextHour = currentHour + 3;
            
            if (isNextDay) {
                // Закрытие на следующий день (например, 20:00-01:00)
                if (nextHour >= 24) {
                    // Последний слот до закрытия (например, 23:00-01:00)
                    slots.push(
                        `${String(currentHour).padStart(2, '0')}:00–${String(closeHour).padStart(2, '0')}:00`
                    );
                    break;
                }
                // Добавляем обычный слот
                slots.push(
                    `${String(currentHour).padStart(2, '0')}:00–${String(nextHour).padStart(2, '0')}:00`
                );
                currentHour = nextHour;
            } else {
                // Закрытие в тот же день
                if (nextHour > closeHour) {
                    // Последний слот до закрытия
                    if (currentHour < closeHour) {
                        slots.push(
                            `${String(currentHour).padStart(2, '0')}:00–${String(closeHour).padStart(2, '0')}:00`
                        );
                    }
                    break;
                }
                // Добавляем обычный слот
                slots.push(
                    `${String(currentHour).padStart(2, '0')}:00–${String(nextHour).padStart(2, '0')}:00`
                );
                currentHour = nextHour;
            }
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
        if (!query || query.trim().length < 3) {
            setAddressSuggestions([]);
            return;
        }
        
        const trimmedQuery = query.trim();
        
        try {
            // Используем Geocoder API для поиска адресов
            // Добавляем "Москва" для ограничения поиска по городу
            const searchQuery = `Москва, ${trimmedQuery}`;
            const url = `https://geocode-maps.yandex.ru/1.x/?apikey=${YANDEX_API_KEY}&geocode=${encodeURIComponent(searchQuery)}&format=json&results=5&bbox=37.319,55.489~37.967,55.958`;
            
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
                `https://geocode-maps.yandex.ru/1.x/?apikey=${YANDEX_API_KEY}&geocode=${encodeURIComponent(address)}&format=json`
            );
            const data = await response.json();
            
            if (data.response?.GeoObjectCollection?.featureMember?.length > 0) {
                const geoObject = data.response.GeoObjectCollection.featureMember[0].GeoObject;
                const pos = geoObject.Point.pos.split(' ').map(Number);
                return [pos[0], pos[1]]; // [долгота, широта]
            }
            return null;
        } catch (error) {
            console.error('Error geocoding address:', error);
            return null;
        }
    };

    // Проверка, входит ли адрес в зону доставки (в пределах МКАД)
    // Используем упрощенную проверку: координаты должны быть в пределах границ Москвы
    const checkDeliveryZone = async (coordinates: [number, number]): Promise<boolean> => {
        try {
            // Границы МКАД (приблизительно):
            // Север: ~55.958
            // Юг: ~55.489
            // Запад: ~37.319
            // Восток: ~37.967
            const [longitude, latitude] = coordinates;
            
            // Проверяем, что координаты находятся в пределах границ МКАД
            const isWithinBounds = 
                latitude >= 55.489 && latitude <= 55.958 &&
                longitude >= 37.319 && longitude <= 37.967;
            
            return isWithinBounds;
        } catch (error) {
            console.error('Error checking delivery zone:', error);
            return false;
        }
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
        if (!isFormValid()) {
            return;
        }
        
        setIsLoading(true);
        
        try {
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
                    const isInZone = await checkDeliveryZone(coordinates);
                    if (!isInZone) {
                        // Показываем попап с ошибкой зоны доставки
                        setShowDeliveryZoneError(true);
                        setIsLoading(false);
                        return;
                    }
                } else {
                    showToast(
                        'Не удалось определить адрес. Пожалуйста, выберите адрес из списка.',
                        'error'
                    );
                    setIsLoading(false);
                    return;
                }
            }
            
            // Создание заказа
            const orderData = {
                restaurant_id: Number(res_id),
                items: cart.items.map(item => ({
                    id: item.id,
                    title: item.title,
                    quantity: item.quantity,
                    price: item.price,
                })),
                totalAmount: cart.totalAmount,
                deliveryMethod: deliveryMethod,
                deliveryCost: deliveryMethod === 'pickup' ? 0 : deliveryFee,
                ...(deliveryMethod === 'delivery' ? {
                    deliveryAddress: address,
                    deliveryTime: {
                        date: selectedDate.value,
                        time: selectedTime,
                    }
                } : {
                    pickupTime: {
                        date: selectedDate.value,
                        time: selectedTime,
                    }
                }),
            };
            
            // TODO: Отправить заказ на сервер
            console.log('Order data:', orderData);
            
            // Логика оплаты
            // await APICreateOrder(orderData);
            
        } catch (error) {
            console.error('Error creating order:', error);
            showToast('Произошла ошибка при создании заказа', 'error');
        } finally {
            setIsLoading(false);
        }
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
        const isMinAmount = cart.totalAmount >= minOrderAmount;
        
        if (deliveryMethod === 'delivery') {
            return address.length > 0 && isDateSelected && isTimeSelected && isMinAmount;
        }
        return isDateSelected && isTimeSelected && isMinAmount;
    };
    
    const showMinAmountError = cart.totalAmount < minOrderAmount && minOrderAmount > 0;

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
                <div className={`${css.section} ${css.sectionFirst}`}>
                    <h2 className={css.sectionTitle}>Сумма заказа</h2>
                    <div className={css.itemsList}>
                        {cart.items.map((item) => (
                            <CartItem
                                key={item.id}
                                {...item}
                                onAdd={() => {
                                    // Находим оригинальное блюдо из моков для получения полной информации
                                    const originalDish = mockGastronomyListData.find(d => d.id === item.id);
                                    if (originalDish) {
                                        const weightIndex = originalDish.weights.findIndex(w => w === item.weight);
                                        addToCart(originalDish, weightIndex >= 0 ? weightIndex : 0);
                                    } else {
                                        // Fallback если блюдо не найдено
                                        addToCart({
                                            price_msw: [],
                                            id: item.id,
                                            title: item.title,
                                            prices: [item.price],
                                            weights: [item.weight],
                                            image_url: item.image,
                                            description: '',
                                    nutritionPer100g: { calories: '0', proteins: '0', fats: '0', carbs: '0' },
                                    allergens: []
                                        }, 0);
                                    }
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
                                    transition: 'transform 0.3s'
                                }}
                            >
                                <path d="M5 8.5L12 15.5L19 8.5" stroke="#989898" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
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
                            <span className={css.deliveryLabel}>{deliveryText}</span>
                            {deliveryFee > 0 && (
                                <span className={css.deliveryPrice}>{deliveryFee} ₽</span>
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
                                    setTimeout(() => setAddressSuggestions([]), 200);
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
                                    <rect x="3" y="6" width="18" height="15" rx="2" stroke="#545454" strokeWidth="1.5"/>
                                    <path d="M3 10H21" stroke="#545454" strokeWidth="1.5"/>
                                    <path d="M8 3V6" stroke="#545454" strokeWidth="1.5" strokeLinecap="round"/>
                                    <path d="M16 3V6" stroke="#545454" strokeWidth="1.5" strokeLinecap="round"/>
                                </svg>
                                <span className={selectedDate.value !== 'unset' ? css.datePickerTextSelected : css.datePickerTextPlaceholder}>
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
                                <path d="M16 7L10 13L4 7" stroke="#545454" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
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
                {showMinAmountError && (
                    <div className={css.minAmountError}>
                        Минимальная сумма заказа {minOrderAmount} ₽
                    </div>
                )}
                <button
                    className={isFormValid() ? css.primaryButton : css.secondaryButton}
                    onClick={handlePayment}
                    disabled={!isFormValid() || isLoading}
                >
                    {isLoading ? 'Обработка...' : 'К оплате'}
                </button>
            </div>

            {/* Попап ошибки зоны доставки */}
            <StyledPopup 
                open={showDeliveryZoneError} 
                onClose={() => setShowDeliveryZoneError(false)}
            >
                <div className={css.deliveryZoneErrorPopup}>
                    <div className={css.popupCloseButton}>
                        <RoundedButton
                            bgColor="#F4F4F4"
                            radius="44px"
                            icon={
                                <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <rect width="44" height="44" rx="22" fill="#F4F4F4"/>
                                    <path d="M26.3908 17.5918L17.6055 26.3771" stroke="#545454" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M26.3942 26.3824L17.6016 17.5879" stroke="#545454" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            }
                            action={() => setShowDeliveryZoneError(false)}
                        />
                    </div>
                    <div className={css.popupContent}>
                        <p className={css.popupErrorText}>
                            К сожалению, ваш адрес не входит в зону доставки.
                            <br />
                            Вы можете оформить самовывоз.
                        </p>
                        <div className={css.popupButtons}>
                            <button 
                                className={css.popupOkButton}
                                onClick={() => {
                                    setShowDeliveryZoneError(false);
                                    setDeliveryMethod('pickup');
                                }}
                            >
                                Ok
                            </button>
                        </div>
                    </div>
                </div>
            </StyledPopup>
        </div>
    );
};
