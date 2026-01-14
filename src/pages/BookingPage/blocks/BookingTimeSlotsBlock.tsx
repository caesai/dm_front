import React from "react";
// Components
import { ContentBlock } from "@/components/ContentBlock/ContentBlock";
import { ContentContainer } from "@/components/ContentContainer/ContentContainer";
import { TimeSlots } from "@/components/TimeSlots/TimeSlots";
// Types
import { ITimeSlot } from "@/pages/BookingPage/BookingPage.types";
// Styles
import css from "@/pages/BookingPage/BookingPage.module.css";

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
export const BookingTimeSlotsBlock: React.FC<IBookingTimeSlotsBlockProps> = ({ canShowTimeSlots, loading, availableTimeslots, selectedTimeSlot, selectTimeSlot, isError }: IBookingTimeSlotsBlockProps): JSX.Element => {
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
        </ContentContainer>
    );
};
