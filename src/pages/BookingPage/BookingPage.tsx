/**
 * @fileoverview Страница общего бронирования столика для любого ресторана.
 * 
 * Пользователь попадает на эту страницу с главной страницы приложения
 * ({@link IndexPage}) после нажатия кнопки "Забронировать".
 * 
 * Страница предоставляет функционал:
 * - Выбор ресторана из полного списка (RestaurantsListSelector)
 * - Выбор даты бронирования из доступных дат
 * - Выбор количества гостей и детей
 * - Выбор времени бронирования из доступных слотов
 * - Ввод контактных данных (предзаполнено из данных пользователя)
 * - Дополнительные пожелания к бронированию
 * - Выбор/активация подарочного сертификата
 * - Выбор способа подтверждения бронирования
 * - Создание бронирования через API
 * 
 * При успешном бронировании пользователь перенаправляется на
 * страницу деталей бронирования `/myBookings/{booking_id}`.
 * 
 * Отличия от {@link RestaurantBookingPage}:
 * - Ресторан выбирается пользователем (не предзадан в URL)
 * - Использует CommonBookingHeader вместо RestaurantBookingHeader
 * - Поддерживает передачу certificate и certificateId через state
 * - Использует `shared` вместо `sharedRestaurant` для навигации
 * 
 * Отличия от {@link EventBookingPage}:
 * - Не привязан к мероприятию (нет eventData)
 * - Дата не фиксирована, выбирается пользователем
 * - Не передаёт event_id в API
 * - Навигация после бронирования на /myBookings/{id}
 * 
 * @module pages/BookingPage/BookingPage
 * 
 * @see {@link IndexPage} - главная страница (точка входа)
 * @see {@link RestaurantBookingPage} - страница бронирования конкретного ресторана
 * @see {@link EventBookingPage} - страница бронирования мероприятия
 * @see {@link useBookingForm} - хук управления формой бронирования
 */

import React, { useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
// Components
import { Page } from '@/components/Page.tsx';
import { PageContainer } from '@/components/PageContainer/PageContainer.tsx';
import { CommonBookingHeader } from '@/pages/BookingPage/blocks/CommonBookingHeader.tsx';
import { ConfirmationSelect } from '@/components/ConfirmationSelect/ConfirmationSelect.tsx';
import { BookingErrorPopup } from '@/components/BookingErrorPopup/BookingErrorPopup.tsx';
import { BottomButtonWrapper } from '@/components/BottomButtonWrapper/BottomButtonWrapper.tsx';
import { BookingWish } from '@/components/BookingWish/BookingWish.tsx';
import { CertificatesSelector } from '@/components/CertificatesSelector/CertificatesSelector.tsx';
import { BookingContactsBlock } from '@/pages/BookingPage/blocks/BookingContactsBlock.tsx';
import { BookingTimeSlotsBlock } from '@/pages/BookingPage/blocks/BookingTimeSlotsBlock.tsx';
// Hooks
import { useNavigationHistory } from '@/hooks/useNavigationHistory.ts';
import { useBookingForm } from '@/hooks/useBookingForm.ts';
// Atoms
import { CONFIRMATION_OPTIONS } from '@/atoms/bookingFormAtom.ts';
// Mocks
import { getServiceFeeData } from '@/mockData.ts';

/**
 * Страница общего бронирования столика для любого ресторана.
 * 
 * Использует хук {@link useBookingForm} для управления состоянием формы,
 * валидации и взаимодействия с API.
 * 
 * Ресторан выбирается пользователем из списка (в отличие от
 * {@link RestaurantBookingPage}, где ресторан предзадан).
 * 
 * При успешном бронировании выполняется навигация на страницу бронирования:
 * `/myBookings/{booking_id}`
 * 
 * @component
 * @returns {JSX.Element} Страница общего бронирования
 * 
 * @example
 * // Роут в App.tsx
 * <Route path="/booking" element={<BookingPage />} />
 * 
 * @example
 * // Навигация с главной страницы
 * navigate('/booking');
 * 
 * @example
 * // Навигация с сертификатом
 * navigate('/booking', {
 *     state: {
 *         certificate: { recipient_name: 'Имя получателя' },
 *         certificateId: 'cert-123',
 *     }
 * });
 * 
 * @example
 * // Навигация по shared-ссылке
 * navigate('/booking', { state: { shared: true } });
 */
export const BookingPage: React.FC = (): JSX.Element => {
    /** Хук навигации для перехода после бронирования */
    const navigate = useNavigate();
    /** Получение location.state с данными сертификата и shared */
    const location = useLocation();
    /**
     * State из navigation.
     * Может содержать:
     * - certificate: данные сертификата для активации
     * - certificateId: ID сертификата для активации
     * - shared: флаг перехода по shared-ссылке
     */
    const state = location.state;
    /** Ref для кнопки бронирования (используется BottomButtonWrapper) */
    const bookingBtn = useRef<HTMLDivElement>(null);

    /** Хук для навигации назад */
    const { goBack } = useNavigationHistory();

    /**
     * Хук управления формой бронирования.
     * 
     * Конфигурация для общего бронирования:
     * - certificateParams: данные сертификата из state для активации
     * 
     * Ресторан и дата выбираются пользователем в форме.
     * При успешном бронировании переходит на /myBookings/{booking_id}
     */
    const {
        form,
        isFormValid,
        validationDisplay,
        availableDates,
        availableTimeslots,
        canShowTimeSlots,
        loading,
        errors,
        setErrorPopup,
        handlers,
        createBooking,
    } = useBookingForm({
        certificateParams: {
            certificate: state?.certificate,
            certificateId: state?.certificateId,
        },
    });

    /**
     * Обработчик кнопки "Назад".
     * 
     * При переходе по shared-ссылке (state.shared = true)
     * перенаправляет на главную страницу, иначе возвращает на
     * предыдущую страницу (обычно {@link IndexPage}).
     */
    const handleGoBack = () => {
        if (state?.shared) {
            navigate('/');
        } else {
            goBack();
        }
    };

    /**
     * Сообщение о сервисном сборе выбранного ресторана.
     * Зависит от ID ресторана в форме.
     */
    const serviceFeeMessage = getServiceFeeData(String(form.restaurant.value));

    return (
        <Page back={true}>
            <PageContainer>
                <BookingErrorPopup
                    isOpen={errors.popup}
                    setOpen={setErrorPopup}
                    resId={Number(form.restaurant.value)}
                    count={errors.popupCount}
                    botError={errors.botError}
                />

                {/* Заголовок */}
                <CommonBookingHeader
                    handleGoBack={handleGoBack}
                    selectRestaurant={handlers.selectRestaurant}
                    selectDate={handlers.selectDate}
                    selectedDate={form.date}
                    setGuestCount={handlers.setGuestCount}
                    setChildrenCount={handlers.setChildrenCount}
                    serviceFeeMessage={serviceFeeMessage}
                    guestCount={form.guestCount}
                    childrenCount={form.childrenCount}
                    availableDates={availableDates}
                    isRestaurantSelected={form.restaurant.value !== 'unset'}
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

                {/* Сертификаты */}
                <CertificatesSelector
                    setCertificateId={(id) => handlers.updateField({ certificateId: id })}
                    isOpened={state?.certificate}
                    selectedCertificateId={state?.certificateId}
                />

                {/* Пожелания при бронировании */}
                <BookingWish
                    restaurantId={Number(form.restaurant.value)}
                    guestCount={form.guestCount}
                    childrenCount={form.childrenCount}
                    preOrder={form.preOrder}
                    setPreOrder={(preOrder) => handlers.updateField({ preOrder })}
                    restaurant={String(form.restaurant.value)}
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
                    isDisabled={!isFormValid}
                    isLoading={loading.submit}
                    onClick={createBooking}
                />
            </PageContainer>
        </Page>
    );
};
