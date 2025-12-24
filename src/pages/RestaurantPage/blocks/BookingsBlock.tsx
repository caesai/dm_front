import React, { Dispatch, SetStateAction, useState } from 'react';
import { useAtom } from 'jotai/index';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode } from 'swiper/modules';
import { Calendar } from 'react-iconly';
import { FaAngleRight } from 'react-icons/fa';
import classNames from 'classnames';
import moment from 'moment/moment';
// Types
import { ITimeSlot } from '@/pages/BookingPage/BookingPage.types.ts';
import { IWorkTime } from '@/types/restaurant.types.ts';
// Atoms
import { guestCountAtom } from '@/atoms/bookingInfoAtom.ts';
// Components
import { ContentContainer } from '@/components/ContentContainer/ContentContainer.tsx';
import { DateListSelector } from '@/components/DateListSelector/DateListSelector.tsx';
import { ContentBlock } from '@/components/ContentBlock/ContentBlock.tsx';
import { RestaurantNavigation } from '@/components/RestaurantNavigation/RestaurantNavigation.tsx';
import { PlaceholderBlock } from '@/components/PlaceholderBlock/PlaceholderBlock.tsx';
import { PickerValueObj } from '@/lib/react-mobile-picker/components/Picker.tsx';
// Utils
import { formatDateAlt, getTimeShort } from '@/utils.ts';
// Styles
import css from '@/pages/RestaurantPage/RestaurantPage.module.css';

interface BookingBlockProps {
    currentSelectedTime: ITimeSlot | null;
    workTime: IWorkTime[] | undefined;
    bookingDate: PickerValueObj;
    bookingDates: PickerValueObj[];
    setBookingDate: Dispatch<SetStateAction<PickerValueObj>>;
    timeslotLoading: boolean;
    availableTimeslots: ITimeSlot[];
    setCurrentSelectedTime: (currentSelectedTime: ITimeSlot) => void;
    isEvents: boolean;
    isNavigationLoading: boolean;
    isBanquets: boolean;
    isGastronomy: boolean;
    isMenu: boolean;
}

/**
 * Компонент блока бронирования столика в ресторане
 */
export const BookingBlock: React.FC<BookingBlockProps> = ({
    currentSelectedTime,
    workTime,
    bookingDate,
    setBookingDate,
    bookingDates,
    timeslotLoading,
    availableTimeslots,
    setCurrentSelectedTime,
    isGastronomy,
    isBanquets,
    isEvents,
    isNavigationLoading,
    isMenu,
}) => {
    const [, setGuestCount] = useAtom(guestCountAtom);
    const [isBookingDatePopupOpen, setIsBookingDatePopupOpen] = useState(false);

    /**
     * Вычисляет время закрытия ресторана для выбранной даты
     * @returns {moment.Moment | null} Время закрытия или null если данные недоступны
     */
    const getWorkEndTime = (): moment.Moment | null => {
        if (workTime === undefined) return null;

        const restaurantWorkEndTime = workTime?.find(
            (item) => String(item.weekday).toLowerCase() === String(bookingDate.title).toLowerCase().slice(-2)
        )?.time_end;

        if (!restaurantWorkEndTime) return null;

        let workEndTime = moment(bookingDate.value);
        const [hours, minutes] = restaurantWorkEndTime.split(':').map(Number);
        const isNextDay = hours < 12;

        if (isNextDay) {
            workEndTime = moment(workEndTime.clone().add(1, 'days').startOf('days').format('YYYY-MM-DD'));
        }

        workEndTime.set({ hour: hours, minutes });
        return workEndTime;
    };

    const handleTimeSlotClick = (ts: ITimeSlot) => {
        setCurrentSelectedTime(ts);
        setGuestCount({ title: '1 гость', value: '1' });
    };

    /**
     * Форматирует отображение времени для таймслота
     * @param {ITimeSlot} ts - Таймслот для форматирования
     * @returns {string} Отформатированная строка времени
     */
    const formatTimeDisplay = (ts: ITimeSlot): string => {
        if (currentSelectedTime !== ts) {
            return getTimeShort(ts.start_datetime);
        }

        const workEndTime = getWorkEndTime();
        // если время окончания таймслота меньше времени закрытия ресторана или равно, то используем время окончания таймслота
        // иначе используем время закрытия ресторана
        const endTime =
            workEndTime && (moment(ts.end_datetime).isBefore(workEndTime) || moment(ts.end_datetime).isSame(workEndTime))
                ? getTimeShort(ts.end_datetime)
                : workTime?.find((item) => String(item.weekday) === String(bookingDate.title).slice(-2))?.time_end;
        return `${getTimeShort(ts.start_datetime)} - ${endTime}`;
    };

    return (
        <ContentContainer>
            <DateListSelector
                isOpen={isBookingDatePopupOpen}
                setOpen={setIsBookingDatePopupOpen}
                date={bookingDate}
                setDate={setBookingDate}
                values={bookingDates}
            />

            <ContentBlock id="booking">
                <div className={css.navSliderAndBookingContainer}>
                    <RestaurantNavigation
                        isLoading={isNavigationLoading}
                        isEvents={isEvents}
                        isBanquets={isBanquets}
                        isGastronomy={isGastronomy}
                        isMenu={isMenu}
                    />
                    <div className={css.bookingContaner}>
                        <Swiper
                            slidesPerView="auto"
                            spaceBetween={8}
                            freeMode={true}
                            modules={[FreeMode]}
                            style={{ marginLeft: '0' }}
                        >
                            {/* Дата бронирования */}
                            {bookingDate.value === 'unset' || !bookingDates.length ? (
                                <SwiperSlide style={{ width: 'min-content' }}>
                                    <PlaceholderBlock width="150px" height="41px" rounded="20px" />
                                </SwiperSlide>
                            ) : (
                                <SwiperSlide
                                    style={{ width: 'min-content' }}
                                    onClick={() => setIsBookingDatePopupOpen(true)}
                                >
                                    <div className={css.timeItem}>
                                        <Calendar size={18} />
                                        {formatDateAlt(bookingDate.value)}
                                        <FaAngleRight size={16} />
                                    </div>
                                </SwiperSlide>
                            )}

                            {/* Таймслоты */}
                            {timeslotLoading ? (
                                <>
                                    {[...Array(3)].map((_, i) => (
                                        <SwiperSlide key={i} style={{ width: 'min-content' }}>
                                            <PlaceholderBlock width="68px" height="41px" rounded="20px" />
                                        </SwiperSlide>
                                    ))}
                                </>
                            ) : (
                                availableTimeslots.map((ts, i) => (
                                    <SwiperSlide
                                        key={i}
                                        style={{ width: 'min-content' }}
                                        onClick={() => handleTimeSlotClick(ts)}
                                    >
                                        <div
                                            className={classNames(
                                                css.timeItem,
                                                currentSelectedTime === ts && css.timeItemActive
                                            )}
                                        >
                                            {formatTimeDisplay(ts)}
                                        </div>
                                    </SwiperSlide>
                                ))
                            )}
                        </Swiper>
                    </div>
                </div>
            </ContentBlock>
        </ContentContainer>
    );
};
