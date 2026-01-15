/**
 * @fileoverview Компонент блока времени бронирования
 * @module pages/BookingPage/blocks/BookingTimeSlotsBlock
 * @exports BookingTimeSlotsBlock
 * @see {@link BookingPage} - страница бронирования
 * @see {@link RestaurantBookingPage} - страница бронирования для конкретного ресторана
 * @see {@link EventBookingPage} - страница бронирования для мероприятия
 * @see {@link RestaurantPage} - страница ресторана
 */
import React from 'react';
// Components
import { ContentBlock } from '@/components/ContentBlock/ContentBlock';
import { ContentContainer } from '@/components/ContentContainer/ContentContainer';
import { TimeSlots } from '@/components/TimeSlots/TimeSlots';
// Types
import { ITimeSlot } from '@/pages/BookingPage/BookingPage.types';
// Styles
import css from '@/pages/BookingPage/BookingPage.module.css';
import { useAtomValue } from 'jotai';
import { permissionsAtom } from '@/atoms/userAtom';

interface IBookingTimeSlotsBlockProps {
    canShowTimeSlots: boolean;
    loading: boolean;
    availableTimeslots: ITimeSlot[];
    selectedTimeSlot: ITimeSlot | null;
    selectTimeSlot: (slot: ITimeSlot | null) => void;
    isError: boolean;
}

/**
 * Компонент блока времени бронирования
 * @param {IBookingTimeSlotsBlockProps} props
 * @returns {JSX.Element}
 */
export const BookingTimeSlotsBlock: React.FC<IBookingTimeSlotsBlockProps> = ({
    canShowTimeSlots,
    loading,
    availableTimeslots,
    selectedTimeSlot,
    selectTimeSlot,
    isError,
}: IBookingTimeSlotsBlockProps): JSX.Element => {
    const permissions = useAtomValue(permissionsAtom);
    /** Флаг наличия скидки для Hospitality Heroes */
    const isHospitalityHeroesDiscount = permissions.includes('hospitality_heroes') && availableTimeslots.some(slot => slot.is_hh_slot);
    return (
        <ContentContainer>
            {!canShowTimeSlots ? (
                <ContentBlock className={css.timeOfDayContainer}>
                    <span className={css.noTimeSlotsText}>Выберите дату и количество гостей</span>
                </ContentBlock>
            ) : isError ? (
                <p className={css.timeslotsError}>
                    Не удалось загрузить доступное время. Попробуйте обновить страницу или выбрать другую дату.
                </p>
            ) : (
                <TimeSlots
                    loading={loading}
                    availableTimeslots={availableTimeslots}
                    currentSelectedTime={selectedTimeSlot}
                    setCurrentSelectedTime={selectTimeSlot}
                />
            )}
            {isHospitalityHeroesDiscount && (
                <p className={css.hospitalityHeroesDiscount}>
                    Вам доступна скидка 40% на бронирования с 15:00 до 19:00
                </p>
            )}
        </ContentContainer>
    );
};
