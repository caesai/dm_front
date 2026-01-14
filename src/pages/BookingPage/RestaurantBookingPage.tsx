/**
 * @fileoverview Страница бронирования столика для конкретного ресторана.
 * 
 * Пользователь попадает на эту страницу со страницы ресторана
 * ({@link RestaurantPage}) после нажатия кнопки "Забронировать".
 * 
 * Страница предоставляет функционал:
 * - Отображение информации о ресторане (название, адрес)
 * - Выбор даты бронирования из доступных дат
 * - Выбор количества гостей и детей
 * - Выбор времени бронирования из доступных слотов
 * - Ввод контактных данных (предзаполнено из данных пользователя)
 * - Дополнительные пожелания к бронированию
 * - Выбор сертификата для применения
 * - Выбор способа подтверждения бронирования
 * - Создание бронирования через API
 * 
 * При успешном бронировании пользователь перенаправляется на
 * страницу деталей бронирования `/myBookings/{booking_id}`.
 * 
 * Отличия от {@link BookingPage} (общей страницы бронирования):
 * - Ресторан предвыбран и не может быть изменён
 * - Поддерживает sharedRestaurant для навигации "назад"
 * - Начальные данные (дата, время, гости) из location.state
 * 
 * Отличия от {@link EventBookingPage}:
 * - Дата не фиксирована, выбирается пользователем
 * - Не передаёт event_id в API
 * - Навигация после бронирования на /myBookings/{id}
 * - Содержит CertificatesSelector
 * 
 * @module pages/BookingPage/RestaurantBookingPage
 * 
 * @see {@link RestaurantPage} - страница ресторана (точка входа)
 * @see {@link BookingPage} - общая страница бронирования
 * @see {@link EventBookingPage} - страница бронирования мероприятия
 * @see {@link useBookingForm} - хук управления формой бронирования
 */

import React, { useRef, useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAtomValue } from 'jotai';
// Components
import { Page } from '@/components/Page.tsx';
import { PageContainer } from '@/components/PageContainer/PageContainer.tsx';
import { ConfirmationSelect } from '@/components/ConfirmationSelect/ConfirmationSelect.tsx';
import { BookingErrorPopup } from '@/components/BookingErrorPopup/BookingErrorPopup.tsx';
import { BottomButtonWrapper } from '@/components/BottomButtonWrapper/BottomButtonWrapper.tsx';
import { BookingWish } from '@/components/BookingWish/BookingWish.tsx';
import { CertificatesSelector } from '@/components/CertificatesSelector/CertificatesSelector.tsx';
import { RestaurantBookingHeader } from '@/pages/BookingPage/blocks/RestaurantBookingHeader.tsx';
import { BookingTimeSlotsBlock } from '@/pages/BookingPage/blocks/BookingTimeSlotsBlock.tsx';
import { BookingContactsBlock } from '@/pages/BookingPage/blocks/BookingContactsBlock.tsx';
// Hooks
import { useNavigationHistory } from '@/hooks/useNavigationHistory.ts';
import { useBookingForm } from '@/hooks/useBookingForm.ts';
// Atoms
import { restaurantsListAtom } from '@/atoms/restaurantsListAtom.ts';
import { CONFIRMATION_OPTIONS } from '@/atoms/bookingFormAtom.ts';

/**
 * Страница бронирования столика для конкретного ресторана.
 * 
 * Использует хук {@link useBookingForm} для управления состоянием формы,
 * валидации и взаимодействия с API.
 * 
 * Ресторан предзаполняется из URL параметра `restaurantId` и не может
 * быть изменён пользователем (в отличие от {@link BookingPage}).
 * 
 * При успешном бронировании выполняется навигация на страницу бронирования:
 * `/myBookings/{booking_id}`
 * 
 * @component
 * @returns {JSX.Element} Страница бронирования ресторана
 * 
 * @example
 * // Роут в App.tsx
 * <Route path="/restaurant/:restaurantId/booking" element={<RestaurantBookingPage />} />
 * 
 * @example
 * // Навигация с RestaurantPage с начальными данными
 * navigate(`/restaurant/${restaurantId}/booking`, {
 *     state: {
 *         bookedDate: selectedDate,
 *         bookedTime: selectedTimeSlot,
 *     }
 * });
 * 
 * @example
 * // Навигация по shared-ссылке
 * navigate(`/restaurant/${restaurantId}/booking`, {
 *     state: { sharedRestaurant: true }
 * });
 */
export const RestaurantBookingPage: React.FC = (): JSX.Element => {
    /** Хук навигации для перехода после бронирования */
    const navigate = useNavigate();
    /** Получение location.state с начальными данными */
    const location = useLocation();
    /** ID ресторана из URL параметров */
    const { restaurantId } = useParams<{ restaurantId: string }>();
    /** Хук для навигации назад */
    const { goBack } = useNavigationHistory();
    /**
     * State из navigation.
     * Может содержать:
     * - bookedDate: предвыбранная дата
     * - bookedTime: предвыбранный временной слот
     * - sharedRestaurant: флаг перехода по shared-ссылке
     */
    const state = location?.state;
    /** Ref для кнопки бронирования (используется BottomButtonWrapper) */
    const bookingBtn = useRef<HTMLDivElement>(null);

    /** Список всех ресторанов из глобального стейта */
    const restaurants = useAtomValue(restaurantsListAtom);

    /**
     * Выбранный ресторан из списка.
     * Определяется по restaurantId из URL.
     */
    const currentRestaurant = useMemo(() => {
        return restaurants.find((r) => String(r.id) === restaurantId);
    }, [restaurants, restaurantId]);

    /**
     * Хук управления формой бронирования.
     * 
     * Конфигурация для бронирования в конкретном ресторане:
     * - preSelectedRestaurant: данные ресторана (нельзя изменить в форме)
     * - initialBookingData: начальные дата, время и количество гостей из state
     * - isSharedRestaurant: флаг для особой навигации "назад"
     * 
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
        preSelectedRestaurant: currentRestaurant
            ? {
                  id: String(currentRestaurant.id),
                  title: currentRestaurant.title,
                  address: currentRestaurant.address,
              }
            : undefined,
        initialBookingData: state
            ? {
                  bookedDate: state.bookedDate,
                  bookedTime: state.bookedTime,
                  guestCount: state.bookedDate ? 1 : undefined,
                  childrenCount: state.bookedDate ? 0 : undefined,
              }
            : undefined,
        isSharedRestaurant: state?.sharedRestaurant,
    });

    /**
     * Обработчик кнопки "Назад".
     * 
     * При переходе по shared-ссылке (state.sharedRestaurant = true)
     * перенаправляет на главную страницу, иначе возвращает на
     * предыдущую страницу (обычно {@link RestaurantPage}).
     */
    const handleGoBack = () => {
        if (state?.sharedRestaurant) {
            navigate('/');
        } else {
            goBack();
        }
    };

    return (
        <Page back={true}>
            <PageContainer>
                <BookingErrorPopup
                    isOpen={errors.popup}
                    setOpen={setErrorPopup}
                    resId={Number(restaurantId)}
                    count={errors.popupCount}
                    botError={errors.botError}
                />

                {/* Заголовок с информацией о ресторане */}
                <RestaurantBookingHeader
                    restaurantTitle={currentRestaurant?.title || ''}
                    restaurantAddress={currentRestaurant?.address || ''}
                    handleGoBack={handleGoBack}
                    availableDates={availableDates}
                    selectedDate={form.date}
                    selectDate={handlers.selectDate}
                    guestCount={form.guestCount}
                    childrenCount={form.childrenCount}
                    setGuestCount={handlers.setGuestCount}
                    setChildrenCount={handlers.setChildrenCount}
                    restaurantId={Number(restaurantId)}
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
                    isOpened={false}
                    selectedCertificateId={null}
                />

                {/* Пожелания при бронировании */}
                <BookingWish
                    restaurantId={Number(restaurantId)}
                    guestCount={form.guestCount}
                    childrenCount={form.childrenCount}
                    preOrder={form.preOrder}
                    setPreOrder={(preOrder) => handlers.updateField({ preOrder })}
                    restaurant={String(restaurantId)}
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
