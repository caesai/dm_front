import React, { useState, useMemo, useEffect } from 'react';
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
import css from './GastronomyBasketPage.module.css';

type DeliveryMethod = 'delivery' | 'pickup';

export const GastronomyBasketPage: React.FC = () => {
    const navigate = useNavigate();
    const { res_id } = useParams();
    const { cart, addToCart, removeFromCart } = useGastronomyCart();
    const [restaurants] = useAtom(restaurantsListAtom);

    const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('delivery');
    const [isDeliveryExpanded, setIsDeliveryExpanded] = useState(false);
    const [address, setAddress] = useState('');
    const [addressSuggestions] = useState([
        'Москва, Большая Грузинская ул., 76, стр. 2',
        'Москва, Большая Грузинская ул., 76',
        'Москва, Большая Грузинская ул., 75',
    ]);
    const [selectedDate, setSelectedDate] = useState<PickerValueObj>({
        title: 'unset',
        value: 'unset',
    });
    const [selectedTime, setSelectedTime] = useState('');
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showAddressError, setShowAddressError] = useState(false);

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
                    `${String(currentHour).padStart(2, '0')}:00–${String(closeHour).padStart(2, '0')}:00`
                );
                break;
            }
            
            // Если закрытие на следующий день (closeHour < openHour) и мы еще не достигли перехода через полночь
            // Продолжаем добавлять слоты по 3 часа
            if (closeHour < openHour) {
                // Если следующий час >= 24, значит это последний слот
                if (nextHour >= 24) {
                    slots.push(
                        `${String(currentHour).padStart(2, '0')}:00–${String(closeHour).padStart(2, '0')}:00`
                    );
                    break;
                }
            } else {
                // Если закрытие в тот же день
                if (nextHour > closeHour) {
                    // Последний слот до закрытия
                    slots.push(
                        `${String(currentHour).padStart(2, '0')}:00–${String(closeHour).padStart(2, '0')}:00`
                    );
                    break;
                }
            }

            // Добавляем слот на 3 часа
            slots.push(
                `${String(currentHour).padStart(2, '0')}:00–${String(nextHour).padStart(2, '0')}:00`
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

    const handleGoToMenu = () => {
        navigate(`/gastronomy/${res_id}`);
    };

    const handlePayment = () => {
        // Логика оплаты
        console.log('Payment processing...');
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
                            В корзине пока пусто. Самое время выбрать что нибудь вкусное
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
                                    // Находим оригинальное блюдо из моков для получения полной информации
                                    const originalDish = mockGastronomyListData.find(d => d.id === item.id);
                                    if (originalDish) {
                                        const weightIndex = originalDish.weights.findIndex(w => w === item.weight);
                                        addToCart(originalDish, weightIndex >= 0 ? weightIndex : 0);
                                    } else {
                                        // Fallback если блюдо не найдено
                                        addToCart({
                                            id: item.id,
                                            title: item.title,
                                            prices: [item.price],
                                            weights: [item.weight],
                                            image: item.image,
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
                            <span className={css.deliveryLabel}>в пределах МКАД</span>
                            <span className={css.deliveryPrice}>{deliveryFee} ₽</span>
                        </div>
                        <div className={css.inputWrapper}>
                            <input
                                type="text"
                                className={address ? css.inputFilled : css.input}
                                placeholder="Адрес"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                            />
                            {address && addressSuggestions.filter(s =>
                                s.toLowerCase().includes(address.toLowerCase())
                            ).length > 0 && (
                                <div className={css.suggestions}>
                                    {addressSuggestions
                                        .filter(s => s.toLowerCase().includes(address.toLowerCase()))
                                        .map((suggestion, idx) => (
                                            <div
                                                key={idx}
                                                className={css.suggestion}
                                                onClick={() => setAddress(suggestion)}
                                            >
                                                {suggestion}
                                            </div>
                                        ))
                                    }
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
                <button
                    className={isFormValid() ? css.primaryButton : css.secondaryButton}
                    onClick={handlePayment}
                    disabled={!isFormValid()}
                >
                    К оплате
                </button>
            </div>

            {/* Попап ошибки адреса */}
            {showAddressError && (
                <div className={css.overlay} onClick={() => setShowAddressError(false)}>
                    <div className={css.popup} onClick={(e) => e.stopPropagation()}>
                        <div className={css.popupIcon}>
                            <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
                                <circle cx="22" cy="22" r="22" fill="#F4F4F4"/>
                                <path d="M26.59 17.59L22 13L17.41 17.59" stroke="#545454" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                        <div className={css.popupContent}>
                            <p className={css.popupText}>
                                К сожалению, ваш адрес не входит в зону доставки.
                                Вы можете оформить самовывоз.
                            </p>
                            <button className={css.secondaryButton} onClick={() => {
                                setShowAddressError(false);
                                setDeliveryMethod('pickup');
                            }}>
                                Ok
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
