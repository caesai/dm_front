import React, { useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
// Components
import { Page } from '@/components/Page.tsx';
import { PageContainer } from '@/components/PageContainer/PageContainer.tsx';
import { ContentContainer } from '@/components/ContentContainer/ContentContainer.tsx';
import { CrossIcon } from '@/components/Icons/CrossIcon.tsx';
import { RoundedButton } from '@/components/RoundedButton/RoundedButton.tsx';
import { GuestCountSelector } from '@/components/GuestCountSelector/GuestCountSelector.tsx';
import { HeaderContainer } from '@/components/ContentBlock/HeaderContainer/HeaderContainer.tsx';
import { HeaderContent } from '@/components/ContentBlock/HeaderContainer/HeaderContent/HeaderContainer.tsx';
import { TextInput } from '@/components/TextInput/TextInput.tsx';
import { ConfirmationSelect } from '@/components/ConfirmationSelect/ConfirmationSelect.tsx';
import { DateListSelector } from '@/components/DateListSelector/DateListSelector.tsx';
import { BookingErrorPopup } from '@/components/BookingErrorPopup/BookingErrorPopup.tsx';
import { BottomButtonWrapper } from '@/components/BottomButtonWrapper/BottomButtonWrapper.tsx';
import { RestaurantsListSelector } from '@/components/RestaurantsListSelector/RestaurantsListSelector.tsx';
import { TimeSlots } from '@/components/TimeSlots/TimeSlots.tsx';
import { BookingWish } from '@/components/BookingWish/BookingWish.tsx';
import { CertificatesSelector } from '@/components/CertificatesSelector/CertificatesSelector.tsx';
import { ContentBlock } from '@/components/ContentBlock/ContentBlock.tsx';
// Hooks
import { useNavigationHistory } from '@/hooks/useNavigationHistory.ts';
import { useBookingForm } from '@/hooks/useBookingForm.ts';
// Atoms
import { CONFIRMATION_OPTIONS } from '@/atoms/bookingFormAtom.ts';
// Styles
import css from '@/pages/BookingPage/BookingPage.module.css';
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

    // Navigation
    const { goBack } = useNavigationHistory();

    // Booking form hook with all state and API calls
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
                <ContentContainer className={css.header}>
                    <ContentBlock className={css.nav}>
                        <div className={css.separator} />
                        <HeaderContent className={css.headerTitle} title="Бронирование" />
                        <RoundedButton icon={<CrossIcon size={44} />} action={handleGoBack} />
                    </ContentBlock>

                    {/* Ресторан, дата и количество гостей */}
                    <ContentBlock className={css.selectors}>
                        <RestaurantsListSelector onSelect={handlers.selectRestaurant} />
                        <ContentBlock className={css.selectorsRow}>
                            <DateListSelector 
                                datesList={availableDates} 
                                onSelect={handlers.selectDate} 
                            />
                            <GuestCountSelector
                                guestCount={form.guestCount}
                                childrenCount={form.childrenCount}
                                setGuestCount={handlers.setGuestCount}
                                setChildrenCount={handlers.setChildrenCount}
                                serviceFeeMessage={getServiceFeeData(String(form.restaurant.value))}
                            />
                        </ContentBlock>
                    </ContentBlock>
                </ContentContainer>

                {/* Время бронирования */}
                <ContentContainer>
                    {!canShowTimeSlots ? (
                        <ContentBlock className={css.timeOfDayContainer}>
                            <span className={css.noTimeSlotsText}>
                                Выберите дату и количество гостей
                            </span>
                        </ContentBlock>
                    ) : errors.timeslots ? (
                        <p className={css.timeslotsError}>
                            Не удалось загрузить доступное время. Попробуйте обновить страницу или
                            выбрать другую дату.
                        </p>
                    ) : (
                        <TimeSlots
                            loading={loading.timeslots}
                            availableTimeslots={availableTimeslots}
                            currentSelectedTime={form.selectedTimeSlot}
                            setCurrentSelectedTime={handlers.selectTimeSlot}
                        />
                    )}
                </ContentContainer>

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
                <ContentContainer>
                    <HeaderContainer>
                        <HeaderContent title="Контакты" />
                    </HeaderContainer>
                    <ContentBlock className={css.form}>
                        <TextInput
                            value={form.userName}
                            onChange={(value) => handlers.updateField({ userName: value })}
                            placeholder="Имя"
                            validation_failed={!validationDisplay.nameValid}
                        />
                        <TextInput
                            value={form.userPhone}
                            onChange={(value) => handlers.updateField({ userPhone: value })}
                            placeholder="Телефон"
                            validation_failed={!validationDisplay.phoneValid}
                            type="tel"
                        />
                    </ContentBlock>
                </ContentContainer>

                {/* Способ подтверждения */}
                <ContentContainer>
                    <HeaderContainer>
                        <HeaderContent title="Способ подтверждения" />
                    </HeaderContainer>
                    <ConfirmationSelect
                        options={CONFIRMATION_OPTIONS}
                        currentValue={form.confirmation}
                        onChange={handlers.setConfirmation}
                    />
                </ContentContainer>

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
