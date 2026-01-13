/**
 * @fileoverview Страница бронирования столика для бесплатного мероприятия.
 * 
 * Пользователь попадает на эту страницу со страницы деталей мероприятия
 * ({@link EventDetailsPage}) после нажатия кнопки "Забронировать".
 * 
 * Страница предоставляет функционал:
 * - Отображение информации о мероприятии (название, дата)
 * - Выбор количества гостей и детей (предзаполнено из {@link guestCountAtom})
 * - Выбор времени бронирования из доступных слотов
 * - Ввод контактных данных (предзаполнено из данных пользователя)
 * - Дополнительные пожелания к бронированию
 * - Выбор способа подтверждения бронирования
 * - Создание бронирования через API с event_id
 * 
 * При успешном бронировании бэкенд возвращает ticket_id,
 * и пользователь перенаправляется на страницу билета `/tickets/{ticket_id}`.
 * 
 * @module pages/BookingPage/EventBookingPage
 * 
 * @see {@link EventDetailsPage} - страница деталей мероприятия (точка входа)
 * @see {@link useBookingForm} - хук управления формой бронирования
 * @see {@link EventBookingHeader} - компонент заголовка страницы
 */

import React, { useMemo, useRef } from 'react';
// Components
import { Page } from '@/components/Page.tsx';
import { PageContainer } from '@/components/PageContainer/PageContainer';
import { BottomButtonWrapper } from '@/components/BottomButtonWrapper/BottomButtonWrapper';
import { BookingTimeSlotsBlock } from './blocks/BookingTimeSlotsBlock';
import { BookingContactsBlock } from './blocks/BookingContactsBlock';
import { EventBookingHeader } from './blocks/EventBookingHeader';
import { BookingWish } from '@/components/BookingWish/BookingWish';
import { ConfirmationSelect } from '@/components/ConfirmationSelect/ConfirmationSelect';
import { BookingErrorPopup } from '@/components/BookingErrorPopup/BookingErrorPopup';
// Hooks
import { useNavigationHistory } from '@/hooks/useNavigationHistory.ts';
import { useBookingForm } from '@/hooks/useBookingForm';
import { useParams } from 'react-router-dom';
import { useAtomValue } from 'jotai';
// Atoms
import { eventsListAtom, guestCountAtom, childrenCountAtom } from '@/atoms/eventListAtom';
import { CONFIRMATION_OPTIONS } from '@/atoms/bookingFormAtom';
// Utils
import { getServiceFeeData } from '@/mockData';

/**
 * Страница бронирования столика для бесплатного мероприятия.
 * 
 * Использует хук {@link useBookingForm} для управления состоянием формы,
 * валидации и взаимодействия с API.
 * 
 * Количество гостей предзаполняется из атомов {@link guestCountAtom} и
 * {@link childrenCountAtom}, которые устанавливаются на странице
 * {@link EventDetailsPage}.
 * 
 * При успешном бронировании выполняется навигация на страницу билета:
 * `/tickets/{ticket_id}`
 * 
 * @component
 * @returns {JSX.Element} Страница бронирования мероприятия
 * 
 * @example
 * // Роут в App.tsx
 * <Route path="/events/:eventId/booking" element={<EventBookingPage />} />
 * 
 * @example
 * // Навигация с EventDetailsPage
 * navigate(`/events/${event.id}/booking`);
 */
export const EventBookingPage: React.FC = (): JSX.Element => {
    /** ID мероприятия из URL параметров */
    const { eventId } = useParams();
    /** Список всех мероприятий из глобального стейта */
    const events = useAtomValue(eventsListAtom);
    /** Хук для навигации назад */
    const { goBack } = useNavigationHistory();
    /** Ref для кнопки бронирования (используется BottomButtonWrapper) */
    const bookingBtn = useRef<HTMLDivElement>(null);

    /**
     * Начальное количество гостей из атома.
     * Устанавливается на странице {@link EventDetailsPage}.
     */
    const initialGuestCount = useAtomValue(guestCountAtom);
    
    /**
     * Начальное количество детей из атома.
     * Устанавливается на странице {@link EventDetailsPage}.
     */
    const initialChildrenCount = useAtomValue(childrenCountAtom);

    /**
     * Выбранное мероприятие из списка событий.
     * Определяется по eventId из URL.
     */
    const selectedEvent = useMemo(() => {
        return events?.find((event) => event.id === Number(eventId));
    }, [events, eventId]);

    /**
     * Сообщение о сервисном сборе ресторана.
     * Зависит от ID ресторана мероприятия.
     */
    const serviceFeeMessage = useMemo(
        () => getServiceFeeData(String(selectedEvent?.restaurant.id)),
        [selectedEvent?.restaurant.id]
    );

    /**
     * Хук управления формой бронирования.
     * 
     * Конфигурация для бронирования на мероприятие:
     * - eventData: данные мероприятия (ресторан и дата автоматически устанавливаются)
     * - initialBookingData: начальное количество гостей из атомов
     * 
     * При успешном бронировании переходит на /tickets/{ticket_id}
     */
    const {
        form,
        isFormValid,
        validationDisplay,
        availableTimeslots,
        canShowTimeSlots,
        loading,
        errors,
        setErrorPopup,
        handlers,
        createBooking,
    } = useBookingForm({
        eventData: selectedEvent
            ? {
                  id: selectedEvent.id,
                  name: selectedEvent.name,
                  dateStart: selectedEvent.date_start,
                  dateEnd: selectedEvent.date_end,
                  restaurantId: String(selectedEvent.restaurant.id),
                  restaurantTitle: selectedEvent.restaurant.title,
                  restaurantAddress: selectedEvent.restaurant.address,
              }
            : undefined,
        initialBookingData: {
            guestCount: initialGuestCount > 0 ? initialGuestCount : undefined,
            childrenCount: initialChildrenCount > 0 ? initialChildrenCount : undefined,
        },
    });

    /**
     * Обработчик кнопки "Назад".
     * Возвращает пользователя на предыдущую страницу (EventDetailsPage).
     */
    const handleGoBack = () => {
        goBack();
    };

    return (
        <Page back={true}>
            <PageContainer>
                <BookingErrorPopup
                    isOpen={errors.popup}
                    setOpen={setErrorPopup}
                    resId={Number(selectedEvent?.restaurant.id)}
                    count={errors.popupCount}
                    botError={errors.botError}
                />

                {/* Заголовок с информацией о мероприятии */}
                <EventBookingHeader
                    eventName={selectedEvent?.name || ''}
                    guestCount={form.guestCount}
                    childrenCount={form.childrenCount}
                    setGuestCount={handlers.setGuestCount}
                    setChildrenCount={handlers.setChildrenCount}
                    serviceFeeMessage={serviceFeeMessage}
                    handleGoBack={handleGoBack}
                    dateStart={selectedEvent?.date_start || ''}
                />

                {/* Время бронирования */}
                <BookingTimeSlotsBlock
                    canShowTimeSlots={canShowTimeSlots}
                    loading={loading.timeslots}
                    availableTimeslots={availableTimeslots}
                    selectedTimeSlot={form.selectedTimeSlot}
                    selectTimeSlot={handlers.selectTimeSlot}
                    isError={errors.timeslots}
                />

                {/* Пожелания при бронировании */}
                <BookingWish
                    restaurantId={Number(selectedEvent?.restaurant.id)}
                    guestCount={form.guestCount}
                    childrenCount={form.childrenCount}
                    preOrder={form.preOrder}
                    setPreOrder={(preOrder) => handlers.updateField({ preOrder })}
                    restaurant={String(selectedEvent?.restaurant.id)}
                    commentary={form.commentary}
                    setCommentary={(commentary) => handlers.updateField({ commentary })}
                />

                {/* Контактная информация */}
                <BookingContactsBlock
                    userName={form.userName}
                    userPhone={form.userPhone}
                    updateFieldName={handlers.updateField}
                    updateFieldPhone={handlers.updateField}
                    validationNameValid={validationDisplay.nameValid}
                    validationPhoneValid={validationDisplay.phoneValid}
                />

                {/* Способ подтверждения */}
                <ConfirmationSelect
                    options={CONFIRMATION_OPTIONS}
                    currentValue={form.confirmation}
                    onChange={handlers.setConfirmation}
                />

                {/* Кнопка бронирования */}
                <BottomButtonWrapper
                    forwardedRef={bookingBtn}
                    content="Забронировать стол"
                    isDisabled={!isFormValid}
                    isLoading={loading.submit}
                    onClick={createBooking}
                />
            </PageContainer>
        </Page>
    );
};
