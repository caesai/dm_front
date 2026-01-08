import React, { useRef, useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAtomValue } from 'jotai';
import classNames from 'classnames';
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
import { TimeSlots } from '@/components/TimeSlots/TimeSlots.tsx';
import { BookingWish } from '@/components/BookingWish/BookingWish.tsx';
import { CertificatesSelector } from '@/components/CertificatesSelector/CertificatesSelector.tsx';
import { ContentBlock } from '@/components/ContentBlock/ContentBlock.tsx';
// Hooks
import { useNavigationHistory } from '@/hooks/useNavigationHistory.ts';
import { useBookingForm } from '@/hooks/useBookingForm.ts';
// Atoms
import { restaurantsListAtom } from '@/atoms/restaurantsListAtom.ts';
import { CONFIRMATION_OPTIONS } from '@/atoms/bookingFormAtom.ts';
// Styles
import css from '@/pages/BookingPage/BookingPage.module.css';
// Mocks
import { getServiceFeeData } from '@/mockData.ts';

/**
 * Страница бронирования для конкретного ресторана
 * Пользователь попадает сюда со страницы ресторана
 * @returns {JSX.Element}
 */
export const BookingRestaurantPage: React.FC = (): JSX.Element => {
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
                <ContentContainer>
                    <div className={css.headerContainer}>
                        <div className={css.headerNav}>
                            <div style={{ width: '44px' }} />
                            <div className={css.headerInfo}>
                                <h3 className={css.headerInfo__title}>Бронирование</h3>
                                {currentRestaurant && (
                                    <>
                                        <h3 className={css.headerInfo__title}>
                                            <b>{currentRestaurant.title}</b>
                                        </h3>
                                        <h4 className={css.headerInfo__subtitle}>{currentRestaurant.address}</h4>
                                    </>
                                )}
                            </div>
                            <RoundedButton icon={<CrossIcon size={44} />} action={handleGoBack} />
                        </div>

                        {/* Дата и количество гостей */}
                        <div className={css.header_bottom}>
                            <ContentBlock className={classNames(css.header__selector)}>
                                {/* Селекторы даты и гостей (скрытые popup) */}
                                <DateListSelector datesList={availableDates} onSelect={handlers.selectDate} />
                                <GuestCountSelector
                                    guestCount={form.guestCount}
                                    childrenCount={form.childrenCount}
                                    setGuestCount={handlers.setGuestCount}
                                    setChildrenCount={handlers.setChildrenCount}
                                    serviceFeeMessage={getServiceFeeData(String(restaurantId))}
                                />
                            </ContentBlock>
                        </div>
                    </div>
                </ContentContainer>

                {/* Время бронирования */}
                <ContentContainer>
                    {!canShowTimeSlots ? (
                        <ContentBlock className={css.timeOfDayContainer}>
                            <span className={css.noTimeSlotsText}>Выберите дату и количество гостей</span>
                        </ContentBlock>
                    ) : errors.timeslots ? (
                        <p className={css.timeslotsError} role="alert" data-testid="timeslots-error">
                            Не удалось загрузить доступное время. Попробуйте обновить страницу или выбрать другую дату.
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
