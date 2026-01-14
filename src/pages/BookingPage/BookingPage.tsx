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
 * Страница общего бронирования для всех ресторанов
 * @returns {JSX.Element}
 */
export const BookingPage: React.FC = (): JSX.Element => {
    const navigate = useNavigate();
    const location = useLocation();
    const state = location.state;
    const bookingBtn = useRef<HTMLDivElement>(null);

    // Хук для навигации
    const { goBack } = useNavigationHistory();

    // Хук для формы бронирования
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
     * Обработка кнопки "Назад"
     */
    const handleGoBack = () => {
        if (state?.shared) {
            navigate('/');
        } else {
            goBack();
        }
    };
    // Получаем сообщение о сервисном сборе
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
