import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
// Types
import { IBookingInfo } from '@/types/restaurant.types.ts';
// Components
import { PlaceholderBlock } from '@/components/PlaceholderBlock/PlaceholderBlock.tsx';
// Icons
import { TimeCircle } from '@/components/Icons/TimeCircle.tsx';
import { UsersIcon } from '@/components/Icons/UsersIcon.tsx';
import { ChildrenIcon } from '@/components/Icons/ChildrenIcon.tsx';
import { TicketIcon } from '@/components/Icons/TicketIcon.tsx';
import { StarPrivilegeIcon } from '@/components/Icons/StarPrivilege.tsx';
// Styles
import css from '@/components/BookingReminder/BookingReminder.module.css';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode } from 'swiper/modules';
import { ContentBlock } from '@/components/ContentBlock/ContentBlock.tsx';

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
export const BookingReminder: React.FC<IBookingReminderProps> = ({ bookings }): JSX.Element[] => {
    const navigate = useNavigate();
    const navigateToBooking = useCallback(
        (id: string, booking_type: string) => {
            if (booking_type === 'event') {
                navigate(`/tickets/${id}`);
            } else {
                navigate(`/myBookings/${id}`);
            }
        },
        [navigate]
    );
    
    /**
     * Если список бронирований не найден, то возвращаем плейсхолдер загрузки.
     * Skeleton соответствует размерам и стилям реальной карточки бронирования.
     */
    if (!bookings) {
        return [
            <div key="booking-skeleton" className={css.bookingReminder} style={{ pointerEvents: 'none' }}>
                <div className={css.inner}>
                    {/* Название ресторана */}
                    <PlaceholderBlock width="160px" height="20px" rounded="8px" />
                    {/* Адрес */}
                    <PlaceholderBlock width="200px" height="14px" rounded="6px" />
                    {/* Время, дата, гости */}
                    <div className={css.sub}>
                        <PlaceholderBlock width="50px" height="14px" rounded="6px" />
                        <PlaceholderBlock width="100px" height="14px" rounded="6px" />
                        <PlaceholderBlock width="30px" height="14px" rounded="6px" />
                    </div>
                </div>
            </div>
        ] as JSX.Element[];
    }

    /**
     * Возвращаем список бронирований.
     */
    return [
        <ContentBlock className={css.swiper}>
            <Swiper slidesPerView="auto" modules={[FreeMode]} freeMode={true} spaceBetween={8}>
                {bookings
                    .filter((book) => {
                        return new Date(new Date().setUTCHours(0, 0, 0, 0)).getTime() <= new Date(book.booking_date).getTime();
                    })
                    .map((booking) => (
                        <SwiperSlide
                            key={booking.id}
                            style={{ width: 'max-content' }}
                        >
                            <div
                                className={css.bookingReminder}
                                onClick={() => navigateToBooking(booking.id, booking.booking_type ?? '')}
                            >
                                <div className={css.inner}>
                                <span className={css.title}>
                                    {booking.booking_type === 'event' ? booking.event_title : `${booking.restaurant.title}, ${booking.restaurant.address}`}
                                </span>
                                    {booking.booking_type === 'event' ?
                                        <span className={css.subText}>{booking.restaurant.title}</span> : null}
                                    <div className={css.sub}>
                                        <div className={css.subItem}>
                                            <TimeCircle size={16} color={'var(--dark-grey)'}></TimeCircle>
                                            <span className={css.subText}>
                                                {formatDate(booking.booking_date)},
                                            </span>
                                            <span className={css.subText}>{booking.time}</span>
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
                        </SwiperSlide>
                    ))}
            </Swiper>
        </ContentBlock>
    ]
};
