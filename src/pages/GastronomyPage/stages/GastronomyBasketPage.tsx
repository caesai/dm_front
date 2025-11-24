import React, { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAtom } from 'jotai';
import { useGastronomyCart } from '@/hooks/useGastronomyCart.ts';
import { CartItem } from '@/components/CartItem/CartItem.tsx';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import emptyBasketIcon from '/img/empty-basket.png';
import { restaurantsListAtom } from '@/atoms/restaurantsListAtom.ts';
import css from './GastronomyBasketPage.module.css';

type DeliveryMethod = 'delivery' | 'pickup';
type CalendarValue = Date | null;

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
    const [calendarDate, setCalendarDate] = useState<CalendarValue>(null);
    const [selectedTime, setSelectedTime] = useState('');
    const [showCalendar, setShowCalendar] = useState(false);
    const [showAddressError, setShowAddressError] = useState(false);

    const deliveryFee = 1000;
    
    // Получаем информацию о ресторане
    const restaurant = useMemo(() => {
        if (!res_id) return null;
        return restaurants.find(r => r.id === Number(res_id));
    }, [res_id, restaurants]);
    
    const restaurantAddress = restaurant?.address || 'Адрес не указан';

    // Временные слоты с 9:00 до 21:00 с шагом 3 часа
    const generateTimeSlots = () => {
        const slots = [];
        for (let hour = 9; hour <= 18; hour += 3) {
            const endHour = hour + 3;
            slots.push(`${String(hour).padStart(2, '0')}:00–${String(endHour).padStart(2, '0')}:00`);
        }
        return slots;
    };

    const timeSlots = generateTimeSlots();

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

    const handleCalendarChange = (value: CalendarValue) => {
        setCalendarDate(value);
        setShowCalendar(false);
    };

    const formatDate = (date: Date | null): string => {
        if (!date) return '';
        const weekdays = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];
        const months = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 
                        'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
        const weekday = weekdays[date.getDay()];
        const day = date.getDate();
        const month = months[date.getMonth()];
        return `${weekday}, ${day} ${month}`;
    };

    const isFormValid = () => {
        if (deliveryMethod === 'delivery') {
            return address.length > 0 && calendarDate !== null && selectedTime.length > 0;
        }
        return calendarDate !== null && selectedTime.length > 0;
    };

    const totalWithDelivery = deliveryMethod === 'delivery' 
        ? cart.totalAmount + deliveryFee 
        : cart.totalAmount;

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
                            Выберите блюда из меню, чтобы оформить заказ.
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
                                onAdd={() => addToCart({ 
                                    id: item.id, 
                                    title: item.title, 
                                    price: item.price, 
                                    defaultWeight: item.weight,
                                    image: item.image,
                                    weights: [item.weight],
                                    composition: [],
                                    nutritionPer100g: { calories: 0, proteins: 0, fats: 0, carbs: 0 },
                                    allergens: []
                                })}
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
                    <div className={css.datePickerWrapper}>
                        <div 
                            className={css.datePicker}
                            onClick={() => setShowCalendar(!showCalendar)}
                        >
                            <div className={css.datePickerContent}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                    <rect x="3" y="6" width="18" height="15" rx="2" stroke="#545454" strokeWidth="1.5"/>
                                    <path d="M3 10H21" stroke="#545454" strokeWidth="1.5"/>
                                    <path d="M8 3V6" stroke="#545454" strokeWidth="1.5" strokeLinecap="round"/>
                                    <path d="M16 3V6" stroke="#545454" strokeWidth="1.5" strokeLinecap="round"/>
                                </svg>
                                <span className={calendarDate ? css.datePickerTextSelected : css.datePickerTextPlaceholder}>
                                    {calendarDate ? formatDate(calendarDate) : 'Выберите дату с 25 по 30 декабря'}
                                </span>
                            </div>
                            <svg 
                                width="20" 
                                height="20" 
                                viewBox="0 0 20 20" 
                                fill="none"
                                style={{
                                    transform: showCalendar ? 'rotate(180deg)' : 'rotate(0)',
                                    transition: 'transform 0.3s'
                                }}
                            >
                                <path d="M16 7L10 13L4 7" stroke="#545454" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                        {showCalendar && (
                            <div className={css.calendarWrapper}>
                                <Calendar
                                    value={calendarDate}
                                    onChange={handleCalendarChange}
                                    minDate={new Date(2025, 11, 25)} // 25 декабря 2025
                                    maxDate={new Date(2025, 11, 30)} // 30 декабря 2025
                                    defaultActiveStartDate={new Date(2025, 11, 25)} // Открывается на декабрь 2025
                                    locale="ru-RU"
                                    formatShortWeekday={(locale, date) => 
                                        ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'][date.getDay()]
                                    }
                                    nextLabel="›"
                                    prevLabel="‹"
                                    next2Label="»"
                                    prev2Label="«"
                                />
                            </div>
                        )}
                    </div>
                    {calendarDate && (
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
                                * обязательно предупредим вас если будем опаздывать,
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
                    Оплатить предзаказ
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
