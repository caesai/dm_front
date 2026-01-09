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
 * Страница бронирования для конкретного ресторана
 * Пользователь попадает сюда со страницы ресторана
 * @returns {JSX.Element}
 */
export const RestaurantBookingPage: React.FC = (): JSX.Element => {
    const navigate = useNavigate();
    const location = useLocation();
    const { restaurantId } = useParams<{ restaurantId: string }>();
    const { goBack } = useNavigationHistory();
    const state = location?.state;
    const bookingBtn = useRef<HTMLDivElement>(null);

    // Получаем данные о ресторанах для отображения
    const restaurants = useAtomValue(restaurantsListAtom);

    // Находим текущий ресторан
    const currentRestaurant = useMemo(() => {
        return restaurants.find((r) => String(r.id) === restaurantId);
    }, [restaurants, restaurantId]);

    // Booking form hook с предвыбранным рестораном
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
     * Обработка кнопки "Назад"
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
