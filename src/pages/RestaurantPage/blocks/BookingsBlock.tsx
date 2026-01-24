/**
 * @fileoverview Блок бронирования столика в ресторане.
 *
 * Особенности:
 * - Отображает навигацию по ресторану
 * - Позволяет выбрать дату бронирования
 * - Использует компонент TimeSlots для выбора времени
 * - Использует {@link useBookingForm} для управления датами и таймслотами
 * - Показывает модальное окно для депозитных дат
 *
 * ## Разделение состояния
 *
 * Использует `formType: 'restaurant'` для изолированного атома {@link restaurantBookingFormAtom},
 * что обеспечивает согласованность состояния с {@link RestaurantBookingPage}.
 *
 * ## Сброс при смене ресторана
 *
 * При переходе на другой ресторан форма автоматически сбрасывается благодаря
 * явной передаче `restaurantId` в {@link useBookingForm}.
 *
 * @component
 * @param {IBookingBlockProps} props - Пропсы компонента
 * @returns {JSX.Element} Компонент блока бронирования
 *
 * @example
 * <BookingBlock restaurantId="123" />
 *
 * @see {@link useBookingForm} - хук для управления формой бронирования
 * @see {@link restaurantBookingFormAtom} - изолированный атом состояния формы
 * @see {@link DepositInfoModal} - модальное окно информации о депозите
 */
import React, { useCallback, useMemo, useState } from 'react';
import { useAtomValue } from 'jotai';
import { Calendar } from 'react-iconly';
import { FaAngleRight } from 'react-icons/fa';
// Types
import { ITimeSlot } from '@/pages/BookingPage/BookingPage.types.ts';
import { PickerValue } from '@/lib/react-mobile-picker/components/Picker.tsx';
// Atoms
import { headerScrolledAtom } from '@/atoms/restaurantPageAtom.ts';
import { useGetRestaurantById } from '@/atoms/restaurantsListAtom.ts';
// Components
import { ContentContainer } from '@/components/ContentContainer/ContentContainer.tsx';
import { PlaceholderBlock } from '@/components/PlaceholderBlock/PlaceholderBlock.tsx';
import { TimeSlots } from '@/components/TimeSlots/TimeSlots.tsx';
import { RestaurantNavigation } from '@/components/RestaurantNavigation/RestaurantNavigation.tsx';
import { WheelPicker } from '@/components/WheelPicker/WheelPicker';
import { DepositInfoModal } from '@/components/DepositInfoModal/DepositInfoModal.tsx';
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
     *
     * restaurantId передаётся явно для надежного сброса формы при смене ресторана,
     * даже если currentRestaurant ещё не загружен.
     */
    const { form, availableDates, availableTimeslots, loading, errors, handlers } = useBookingForm({
        formType: 'restaurant',
        restaurantId, // Явно передаём для надежного сброса при смене ресторана
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
    /** Состояние для ожидающей подтверждения даты (депозит) */
    const [pendingDate, setPendingDate] = useState<PickerValue | null>(null);
    /** Состояние открытия модального окна депозита */
    const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);

    /**
     * Обработчик выбора таймслота.
     */
    const handleTimeSlotSelect = useCallback(
        (slot: ITimeSlot | null) => {
            handlers.selectTimeSlot(slot);
        },
        [handlers]
    );

    /**
     * Обработчик выбора даты при нажатии "Сохранить" в пикере.
     * Проверяет, требуется ли депозит для выбранной даты.
     */
    const handleDateSave = useCallback(
        (date: PickerValue) => {
            // Находим полный объект из списка дат, чтобы получить все атрибуты
            const fullDate = availableDates?.find((d) => d.value === date.value) ?? date;

            if (fullDate.attributes?.includes('requires_deposit')) {
                setPendingDate(fullDate);
                setIsDepositModalOpen(true);
            } else {
                handlers.selectDate(fullDate);
            }
        },
        [availableDates, handlers]
    );

    /**
     * Подтверждение депозита — применяет выбранную дату.
     */
    const handleDepositConfirm = useCallback(() => {
        if (pendingDate) {
            handlers.selectDate(pendingDate);
        }
        setPendingDate(null);
        setIsDepositModalOpen(false);
    }, [pendingDate, handlers]);

    /**
     * Отмена депозита — сбрасывает ожидающую дату.
     */
    const handleDepositCancel = useCallback(() => {
        setPendingDate(null);
        setIsDepositModalOpen(false);
    }, []);

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
            <DepositInfoModal
                isOpen={isDepositModalOpen}
                depositPerPerson={pendingDate?.deposit_per_person ?? 0}
                onConfirm={handleDepositConfirm}
                onCancel={handleDepositCancel}
            />
            <WheelPicker
                value={pendingDate ?? form.date}
                onChange={setPendingDate}
                onSave={handleDateSave}
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
