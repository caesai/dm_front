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
 * ## Синхронизация состояния
 * 
 * Начальные данные (дата, время, количество гостей) берутся из {@link previewBookingFormAtom},
 * который заполняется в {@link BookingsBlock} на странице ресторана.
 * Это обеспечивает согласованность данных без использования location.state.
 * 
 * Отличия от {@link BookingPage} (общей страницы бронирования):
 * - Ресторан предвыбран и не может быть изменён
 * - Поддерживает sharedRestaurant для навигации "назад"
 * - Начальные данные из {@link previewBookingFormAtom}
 * 
 * Отличия от {@link EventBookingPage}:
 * - Дата не фиксирована, выбирается пользователем
 * - Не передаёт event_id в API
 * - Навигация после бронирования на /myBookings/{id}
 * - Содержит CertificatesSelector
 * 
 * ## Разделение состояния
 * 
 * Использует `formType: 'restaurant'` для изолированного атома {@link restaurantBookingFormAtom},
 * что предотвращает конфликты с другими страницами бронирования.
 * 
 * @module pages/BookingPage/RestaurantBookingPage
 * 
 * @see {@link RestaurantPage} - страница ресторана (точка входа)
 * @see {@link previewBookingFormAtom} - атом с данными превью бронирования
 * @see {@link BookingPage} - общая страница бронирования
 * @see {@link EventBookingPage} - страница бронирования мероприятия
 * @see {@link useBookingForm} - хук управления формой бронирования
 * @see {@link restaurantBookingFormAtom} - изолированный атом состояния формы
 */

import React, { useRef } from 'react';
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
import { useBookingForm } from '@/hooks/useBookingForm.ts';
// Atoms
import { useGetRestaurantById } from '@/atoms/restaurantsListAtom.ts';
import { CONFIRMATION_OPTIONS, previewBookingFormAtom } from '@/atoms/bookingFormAtom.ts';

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
 * // Навигация с RestaurantPage (данные берутся из previewBookingFormAtom)
 * navigate(`/restaurant/${restaurantId}/booking`);
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
    /** Получение location.state для проверки shared-ссылки */
    const location = useLocation();
    /** ID ресторана из URL параметров */
    const { restaurantId } = useParams<{ restaurantId: string }>();
    /**
     * State из navigation.
     * Может содержать только sharedRestaurant для обработки shared-ссылок.
     */
    const state = location?.state;
    /** Ref для кнопки бронирования (используется BottomButtonWrapper) */
    const bookingBtn = useRef<HTMLDivElement>(null);

    /**
     * Выбранный ресторан из списка.
     * Определяется по restaurantId из URL.
     */
    const currentRestaurant = useGetRestaurantById(restaurantId || '');

    /**
     * Данные из превью бронирования на странице ресторана.
     * Используется для инициализации формы с выбранными датой и временем.
     * @see {@link previewBookingFormAtom}
     * @see {@link BookingsBlock}
     */
    const previewForm = useAtomValue(previewBookingFormAtom);

    /**
     * Хук управления формой бронирования.
     * 
     * Конфигурация для бронирования в конкретном ресторане:
     * - preSelectedRestaurant: данные ресторана (нельзя изменить в форме)
     * - initialBookingData: начальные данные из {@link previewBookingFormAtom}
     * - isSharedRestaurant: флаг для особой навигации "назад"
     * - resetOnMount: false - сохраняем данные из previewBookingFormAtom
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
        formType: 'restaurant',
        preSelectedRestaurant: currentRestaurant
            ? {
                  id: String(currentRestaurant.id),
                  title: currentRestaurant.title,
                  address: currentRestaurant.address,
              }
            : undefined,
        // Начальные данные берутся из previewBookingFormAtom (выбраны на странице ресторана)
        initialBookingData: {
            guestCount: previewForm.guestCount > 0 ? previewForm.guestCount : 1,
            childrenCount: previewForm.childrenCount,
            bookedDate: previewForm.date?.value !== 'unset' ? previewForm.date : undefined,
            bookedTime: previewForm.selectedTimeSlot ?? undefined,
        },
        isShared: state?.sharedRestaurant,
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
            navigate('/restaurant/' + restaurantId);
        }
    };

    return (
        <Page back={!state?.sharedRestaurant}>
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
