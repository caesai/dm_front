import React, { useCallback, useMemo, useState } from 'react';
import { useAtomValue, useSetAtom } from 'jotai/index';
import { Calendar } from 'react-iconly';
import { FaAngleRight } from 'react-icons/fa';
// Types
import { ITimeSlot } from '@/pages/BookingPage/BookingPage.types.ts';
// Atoms
import { guestCountAtom } from '@/atoms/bookingInfoAtom.ts';
import { headerScrolledAtom } from '@/atoms/restaurantPageAtom.ts';
// Components
import { ContentContainer } from '@/components/ContentContainer/ContentContainer.tsx';
import { PlaceholderBlock } from '@/components/PlaceholderBlock/PlaceholderBlock.tsx';
import { TimeSlots } from '@/components/TimeSlots/TimeSlots.tsx';
import { RestaurantNavigation } from '@/components/RestaurantNavigation/RestaurantNavigation.tsx';
// Utils
import { formatDateAlt } from '@/utils.ts';
// Styles
import css from '@/pages/RestaurantPage/RestaurantPage.module.css';
// Hooks
import { useRestaurantPageData } from '@/hooks/useRestaurantPageData.ts';
import { WheelPicker } from '@/components/WheelPicker/WheelPicker';

/**
 * Пропсы компонента BookingBlock.
 *
 * @interface IBookingBlockProps
 */
interface IBookingBlockProps {
    /** ID ресторана */
    restaurantId: string;
}

/**
 * Компонент блока бронирования столика в ресторане.
 *
 * Особенности:
 * - Отображает навигацию по ресторану
 * - Позволяет выбрать дату бронирования
 * - Использует компонент TimeSlots для выбора времени
 * - Автоматически устанавливает количество гостей при выборе времени
 *
 * @component
 * @param {IBookingBlockProps} props - Пропсы компонента
 * @returns {JSX.Element} Компонент блока бронирования
 *
 * @example
 * <BookingBlock restaurantId="123" />
 */
export const BookingBlock: React.FC<IBookingBlockProps> = ({ restaurantId }): JSX.Element => {
    /** Состояние скролла страницы */
    const headerScrolled = useAtomValue(headerScrolledAtom);

    /** Устанавливает количество гостей */
    const setGuestCount = useSetAtom(guestCountAtom);

    /** Данные бронирования из хука */
    const {
        date,
        currentSelectedTime,
        setCurrentSelectedTime,
        dates,
        timeslotLoading,
        availableTimeslots,
        timeslotsError,
        setDate,
    } = useRestaurantPageData({ restaurantId });

    /** Состояние открытия popup с датой бронирования */
    const [isPickerOpen, setIsPickerOpen] = useState(false);

    /**
     * Обработчик выбора таймслота.
     * Устанавливает выбранное время и дефолтное количество гостей.
     */
    const handleTimeSlotSelect = useCallback(
        (slot: ITimeSlot | null) => {
            setCurrentSelectedTime(slot);
            if (slot) {
                setGuestCount({ title: '1 гость', value: '1' });
            }
        },
        [setCurrentSelectedTime, setGuestCount]
    );

    /** Флаг загрузки даты */
    const isDateLoading = date.value === 'unset' || !dates.length;

    /** Открывает popup выбора даты */
    const openDatePopup = useCallback(() => setIsPickerOpen(true), []);

    /** Элемент селектора даты для отображения в начале списка (мемоизирован) */
    const dateElement = useMemo(() => {
        if (isDateLoading) {
            return <PlaceholderBlock width="150px" height="41px" rounded="20px" />;
        }
        return (
            <div className={css.timeItem} onClick={openDatePopup}>
                <Calendar size={18} />
                {formatDateAlt(date.value.toString())}
                <FaAngleRight size={16} />
            </div>
        );
    }, [isDateLoading, date.value, openDatePopup]);

    /** Стили для TimeSlots (мемоизированы) */
    const timeSlotsStyle = useMemo(() => ({ gap: 0 }), []);

    return (
        <ContentContainer id="booking" className={css.navSliderAndBookingContainer}>
            <WheelPicker
                value={date}
                onChange={setDate}
                items={dates}
                isOpen={isPickerOpen}
                setOpen={setIsPickerOpen}
                title={'Выберите дату'}
            />

            {/* Навигация по странице ресторана (скрывается при скролле и переходит в хедер) */}
            {!headerScrolled && <RestaurantNavigation restaurantId={restaurantId} />}

            {/* Компонент выбора даты и времени (в один ряд) */}
            <TimeSlots
                loading={timeslotLoading}
                availableTimeslots={availableTimeslots}
                currentSelectedTime={currentSelectedTime}
                setCurrentSelectedTime={handleTimeSlotSelect}
                showDayPartSelector={false}
                startElement={dateElement}
                style={timeSlotsStyle}
            />

            {timeslotsError && (
                <p className={css.timeslotsError} role="alert" data-testid="timeslots-error">
                    Не удалось загрузить доступное время. Попробуйте обновить страницу или выбрать другую дату.
                </p>
            )}
        </ContentContainer>
    );
};

BookingBlock.displayName = 'BookingBlock';
