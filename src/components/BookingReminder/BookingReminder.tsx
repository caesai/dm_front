import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
// Types
import { IBookingInfo } from '@/types/restaurant.types.ts';
// Components
import { PlaceholderBlock } from '@/components/PlaceholderBlock/PlaceholderBlock.tsx';
// Icons
import { TimeCircle } from '@/components/Icons/TimeCircle.tsx';
import { CalendarIcon } from '@/components/Icons/CalendarIcon.tsx';
import { UsersIcon } from '@/components/Icons/UsersIcon.tsx';
import { ChildrenIcon } from '@/components/Icons/ChildrenIcon.tsx';
import { TicketIcon } from '@/components/Icons/TicketIcon.tsx';
// Utils
import { weekdaysMap } from '@/utils.ts';
// Styles
import css from '@/components/BookingReminder/BookingReminder.module.css';
import { StarPrivilegeIcon } from '../Icons/StarPrivilege';

/**
 * Пропсы компонента BookingReminder.
 */
interface IBookingReminderProps {
    /** Список бронирований пользователя. Если null — отображается плейсхолдер загрузки */
    bookings: IBookingInfo[] | null;
}

/**
 * Форматирует дату в человекочитаемый формат.
 *
 * @param dateStr - Строка с датой в формате ISO
 * @returns Отформатированная дата (например, "25 декабря")
 *
 * @example
 * formatDate('2025-12-25') // "25 декабря"
 */
const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
    });
};

/**
 * Компонент напоминания о предстоящих бронированиях.
 *
 * Отображает список активных бронирований пользователя (столики и мероприятия),
 * фильтруя только те, дата которых ещё не прошла.
 * При клике на карточку выполняется навигация на страницу детальной информации.
 *
 * @param props - Пропсы компонента
 * @param props.bookings - Список бронирований или null для отображения плейсхолдера
 *
 * @example
 * <BookingReminder bookings={userBookings} />
 */
export const BookingReminder: React.FC<IBookingReminderProps> = ({ bookings }) => {
    const navigate = useNavigate();
    const navigateToBooking = useCallback(
        (id: number, booking_type: string) => {
            if (booking_type === 'event') {
                navigate(`/tickets/${id}`);
            } else {
                navigate(`/myBookings/${id}`);
            }
        },
        [navigate]
    );
    
    if (!bookings) {
        return (
            <div style={{ marginRight: '15px' }}>
                <PlaceholderBlock width={'100%'} height={'108px'} rounded={'16px'} />
            </div>
        );
    }
    return bookings
        .filter((book) => {
            return new Date(new Date().setUTCHours(0, 0, 0, 0)).getTime() <= new Date(book.booking_date).getTime();
        })
        .map((booking) => (
            <div
                key={booking.id}
                className={css.bookingReminder}
                onClick={() => navigateToBooking(booking.id, booking.booking_type ?? '')}
            >
                <div className={css.inner}>
                    <span className={css.title}>
                        {booking.booking_type === 'event' ? booking.event_title : booking.restaurant.title}
                    </span>
                    {booking.booking_type === 'event' ? <span className={css.subText}>{booking.restaurant.title}</span> : null}
                    <span className={css.subText}>{booking.restaurant.address}</span>
                    <div className={css.sub}>
                        <div className={css.subItem}>
                            <TimeCircle size={16} color={'var(--dark-grey)'}></TimeCircle>
                            <span className={css.subText}>{booking.time}</span>
                        </div>
                        <div className={css.subItem}>
                            <CalendarIcon size={16} color={'var(--dark-grey)'}></CalendarIcon>
                            <span className={css.subText}>
                                {formatDate(booking.booking_date)},{' '}
                                {weekdaysMap[new Date(booking.booking_date).getDay()]}
                            </span>
                        </div>
                        <div className={css.subItem}>
                            {booking.booking_type === 'event' ? (
                                <TicketIcon size={16} />
                            ) : (
                                <UsersIcon size={16} color={'var(--dark-grey)'} />
                            )}
                            <span className={css.subText}>{booking.guests_count}</span>
                            {!!booking.children_count && (
                                <>
                                    <ChildrenIcon size={16} />
                                    <span className={css.subText}>{booking.children_count}</span>
                                </>
                            )}
                            {booking.features.includes('hospitality_heroes') && (
                                <>
                                    <StarPrivilegeIcon size={16} />
                                    <span className={css.subText}>Скидка 40%</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        ));
};
