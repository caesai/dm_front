import React, { useCallback, useMemo, useState } from 'react';
import { useAtomValue } from 'jotai';
import { Calendar } from 'react-iconly';
import { FaAngleRight } from 'react-icons/fa';
// Types
import { ITimeSlot } from '@/pages/BookingPage/BookingPage.types.ts';
// Atoms
import { headerScrolledAtom } from '@/atoms/restaurantPageAtom.ts';
import { useGetRestaurantById } from '@/atoms/restaurantsListAtom.ts';
// Components
import { ContentContainer } from '@/components/ContentContainer/ContentContainer.tsx';
import { PlaceholderBlock } from '@/components/PlaceholderBlock/PlaceholderBlock.tsx';
import { TimeSlots } from '@/components/TimeSlots/TimeSlots.tsx';
import { RestaurantNavigation } from '@/components/RestaurantNavigation/RestaurantNavigation.tsx';
import { WheelPicker } from '@/components/WheelPicker/WheelPicker';
// Utils
import { formatDateAlt } from '@/utils.ts';
// Styles
import css from '@/pages/RestaurantPage/RestaurantPage.module.css';
// Hooks
import { useBookingForm } from '@/hooks/useBookingForm.ts';

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
 * - Использует {@link useBookingForm} для управления датами и таймслотами
 *
 * @component
 * @param {IBookingBlockProps} props - Пропсы компонента
 * @returns {JSX.Element} Компонент блока бронирования
 *
 * @example
 * <BookingBlock restaurantId="123" />
 * 
 * @see {@link useBookingForm} - хук для управления формой бронирования
 */
export const BookingBlock: React.FC<IBookingBlockProps> = ({ restaurantId }: IBookingBlockProps): JSX.Element => {
    /** Состояние скролла страницы */
    const headerScrolled = useAtomValue(headerScrolledAtom);

    /** Текущий ресторан по ID */
    const currentRestaurant = useGetRestaurantById(restaurantId);

    /**
     * Данные бронирования из хука useBookingForm.
     * Используем preSelectedRestaurant для загрузки дат и таймслотов.
     * Устанавливаем начальное количество гостей = 1 для загрузки таймслотов.
     */
    const {
        form,
        availableDates,
        availableTimeslots,
        loading,
        errors,
        handlers,
    } = useBookingForm({
        preSelectedRestaurant: currentRestaurant
            ? {
                  id: String(currentRestaurant.id),
                  title: currentRestaurant.title,
                  address: currentRestaurant.address,
              }
            : undefined,
        initialBookingData: {
            guestCount: 1,
            childrenCount: 0,
        },
    });

    /** Состояние открытия popup с датой бронирования */
    const [isPickerOpen, setIsPickerOpen] = useState(false);

    /**
     * Обработчик выбора таймслота.
     */
    const handleTimeSlotSelect = useCallback(
        (slot: ITimeSlot | null) => {
            handlers.selectTimeSlot(slot);
        },
        [handlers]
    );

    /** Флаг загрузки даты */
    const isDateLoading = form.date?.value === 'unset' || !availableDates.length;
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
                {formatDateAlt(form.date.value.toString())}
                <FaAngleRight size={16} />
            </div>
        );
    }, [isDateLoading, form.date?.value, openDatePopup]);

    /** Стили для TimeSlots (мемоизированы) */
    const timeSlotsStyle = useMemo(() => ({ gap: 0 }), []);

    return (
        <ContentContainer id="booking" className={css.navSliderAndBookingContainer}>
            <WheelPicker
                value={form.date}
                onChange={handlers.selectDate}
                items={availableDates}
                isOpen={isPickerOpen}
                setOpen={setIsPickerOpen}
                title={'Выберите дату'}
            />

            {/* Навигация по странице ресторана (скрывается при скролле и переходит в хедер) */}
            {!headerScrolled && <RestaurantNavigation restaurantId={restaurantId} />}

            {/* Компонент выбора даты и времени (в один ряд) */}
            <TimeSlots
                loading={loading.timeslots}
                availableTimeslots={availableTimeslots}
                currentSelectedTime={form.selectedTimeSlot}
                setCurrentSelectedTime={handleTimeSlotSelect}
                showDayPartSelector={false}
                startElement={dateElement}
                style={timeSlotsStyle}
            />

            {errors.timeslots && (
                <p className={css.timeslotsError} role="alert" data-testid="timeslots-error">
                    Не удалось загрузить доступное время. Попробуйте обновить страницу или выбрать другую дату.
                </p>
            )}
        </ContentContainer>
    );
};
