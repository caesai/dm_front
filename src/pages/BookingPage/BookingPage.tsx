import {FC, useEffect, useRef, useState} from 'react';
import { useAtom } from 'jotai';
import { authAtom, userAtom } from '@/atoms/userAtom.ts';
import { commAtom } from '@/atoms/bookingCommAtom.ts';
import { APICreateBooking, APIGetAvailableDays, APIGetAvailableTimeSlots } from '@/api/restaurants.ts';
import { formatDate, formatDateShort, getGuestsString, getTimeShort } from '@/utils.ts';
import { getGuestMaxNumber, getServiceFeeData } from '@/mockData.ts';
import { PickerValueObj } from '@/lib/react-mobile-picker/components/Picker.tsx';
import { Page } from '@/components/Page.tsx';
import { PageContainer } from '@/components/PageContainer/PageContainer.tsx';
import { ContentContainer } from '@/components/ContentContainer/ContentContainer.tsx';
import { CrossIcon } from '@/components/Icons/CrossIcon.tsx';
import { RoundedButton } from '@/components/RoundedButton/RoundedButton.tsx';
import { useLocation, useNavigate } from 'react-router-dom';
import { CalendarIcon } from '@/components/Icons/CalendarIcon.tsx';
import { UsersIcon } from '@/components/Icons/UsersIcon.tsx';
import { BookingGuestCountSelectorPopup } from '@/components/BookingGuestCountSelectorPopup/BookingGuestCountSelectorPopup.tsx';
import { HeaderContainer } from '@/components/ContentBlock/HeaderContainer/HeaderContainer.tsx';
import { HeaderContent } from '@/components/ContentBlock/HeaderContainer/HeaderContent/HeaderContainer.tsx';
import { TextInput } from '@/components/TextInput/TextInput.tsx';
import { IConfirmationType } from '@/components/ConfirmationSelect/ConfirmationSelect.types.ts';
import { ConfirmationSelect } from '@/components/ConfirmationSelect/ConfirmationSelect.tsx';
import { ITimeSlot } from '@/pages/BookingPage/BookingPage.types.ts';
import { DateListSelector } from '@/components/DateListSelector/DateListSelector.tsx';
import { BookingErrorPopup } from '@/components/BookingErrorPopup/BookingErrorPopup.tsx';
import { BottomButtonWrapper } from '@/components/BottomButtonWrapper/BottomButtonWrapper.tsx';
import { DropDownSelect } from '@/components/DropDownSelect/DropDownSelect.tsx';
import { KitchenIcon } from '@/components/Icons/KitchenIcon.tsx';
import { RestaurantsListSelector } from '@/components/RestaurantsListSelector/RestaurantsListSelector.tsx';
import { TimeSlots } from '@/components/TimeSlots/TimeSlots.tsx';
import { BookingWish } from '@/components/BookingWish/BookingWish.tsx';
import { useBookingFormValidation } from '@/hooks/useBookingFormValidation.ts';
import { CertificatesSelector } from '@/components/CertificatesSelector/CertificatesSelector.tsx';
import classNames from 'classnames';
import css from './BookingPage.module.css';
import { mockEventsUsersList } from '@/__mocks__/events.mock.ts';
import { useNavigationHistory } from '@/hooks/useNavigationHistory.ts';
import { APIGetCertificates, APIPostCertificateClaim } from '@/api/certificates.api.ts';
import useToastState from '@/hooks/useToastState.ts';
import { certificatesListAtom } from '@/atoms/certificatesListAtom.ts';

const confirmationList: IConfirmationType[] = [
    {
        id: 'telegram',
        text: 'В Telegram',
    },
    {
        id: 'phone',
        text: 'По телефону',
    },
    {
        id: 'none',
        text: 'Без подтверждения',
    },
];

export const BookingPage: FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { showToast } = useToastState();

    const { goBack } = useNavigationHistory();

    const [auth] = useAtom(authAtom);
    const [user] = useAtom(userAtom);
    const [comms] = useAtom(commAtom);

    const [guestCount, setGuestCount] = useState(0);
    const [childrenCount, setChildrenCount] = useState(0);
    const [date, setDate] = useState<PickerValueObj>({
        title: 'unset',
        value: 'unset',
    });

    const [currentSelectedTime, setCurrentSelectedTime] = useState<ITimeSlot | null>(null);
    const [restaurant, setRestaurant] = useState<PickerValueObj>({
        title: 'unset',
        value: 'unset',
    });
    const [certificates, setCertificates] = useAtom(certificatesListAtom);

    const [userName, setUserName] = useState<string>(user?.first_name ? user.first_name : '');
    const [userPhone, setUserPhone] = useState<string>(user?.phone_number ? user.phone_number : '');
    const [userEmail] = useState<string>(user?.email ? user.email : '');
    const [commentary, setCommentary] = useState('');
    const [confirmation, setConfirmation] = useState<IConfirmationType>(confirmationList[0]);
    const [availableTimeslots, setAvailableTimeslots] = useState<ITimeSlot[]>([]);
    const [availableDates, setAvailableDates] = useState<PickerValueObj[]>([]);
    const [guestCountPopup, setGuestCountPopup] = useState(false);
    const [bookingDatePopup, setBookingDatePopup] = useState(false);
    const [bookingRestaurantPopup, setBookingRestaurantPopup] = useState(false);
    const [timeslotsLoading, setTimeslotsLoading] = useState(true);
    const [requestLoading, setRequestLoading] = useState(false);
    const [errorPopup, setErrorPopup] = useState(false);
    const [botError, setBotError] = useState(false);
    const [errorPopupCount, setErrorPopupCount] = useState(0);
    const [preOrder, setPreOrder] = useState(false);
    const [certificate_id, setCertificateId] = useState<string | null>(null);
    const bookingBtn = useRef<HTMLDivElement>(null);

    const tg_id = window.Telegram.WebApp.initDataUnsafe.user.id;
    const state = location.state;

    useEffect(() => {
        auth?.access_token && restaurant.value !== 'unset'
            ? APIGetAvailableDays(auth?.access_token, parseInt(String(restaurant.value)), 1).then(
                  (res) =>
                      setAvailableDates(
                          res.data.map((v) => ({
                              title: formatDate(v),
                              value: v,
                          }))
                      )
              )
            : null;
    }, [guestCount, restaurant]);

    // 2. States specifically for controlling the temporary *error display* in the UI (start as true/validated)
    const [nameValidatedDisplay, setNameValidated] = useState(true);
    const [phoneValidatedDisplay, setPhoneValidated] = useState(true);
    const [dateValidatedDisplay, setDateValidated] = useState(true);
    const [, setSelectedTimeValidated] = useState(true);
    const [guestsValidatedDisplay, setGuestsValidated] = useState(true);
    const { isFormValid, validateForm  } = useBookingFormValidation(
        // Pass the raw values
        { userName, userPhone, currentSelectedTime, guestCount, date },
        // Pass the setters for the *display* states
        { setNameValidated, setPhoneValidated, setDateValidated, setGuestsValidated, setSelectedTimeValidated }
    );

    const createBooking = () => {
        if (!user?.complete_onboarding) {
            navigate('/onboarding/3', { state: { id: Number(restaurant.value), date, time: currentSelectedTime, sharedRestaurant: true } });
            return;
        }
        if (validateForm() && auth?.access_token && currentSelectedTime) {
            setRequestLoading(true);
            APICreateBooking(auth.access_token, Number(restaurant.value), date.value, getTimeShort(currentSelectedTime.start_datetime), guestCount,
                childrenCount,
                userName,
                userPhone,
                userEmail,
                commentary,
                comms,
                confirmation.text,
                (guestCount + childrenCount) < 8 ? false : preOrder,
                null,
                certificate_id
            )
                .then((res) => {
                    if (res.data?.error) {
                        setErrorPopup(true);
                        setBotError(true);
                        return;
                    }
                    navigate(`/myBookings/${res.data.id}`);
                })
                .catch((err) => {
                    console.error('err: ', err);
                    setErrorPopup(true);
                    setErrorPopupCount((prev) => prev + 1);
                })
                .finally(() => setRequestLoading(false));
        }
    };

    useEffect(() => {
        if (restaurant.value === 'unset' || !auth?.access_token || date.value === 'unset' || !guestCount) return;
        setTimeslotsLoading(true);
        APIGetAvailableTimeSlots(
            auth.access_token,
            parseInt(String(restaurant.value)),
            date.value,
            guestCount,
        )
            .then((res) => setAvailableTimeslots(res.data))
            .finally(() => setTimeslotsLoading(false));
    }, [date, guestCount, restaurant]);


    useEffect(() => {
        // Если certificates.length === 0, но у нас есть state?.certificate && state?.certificateId
        // предполагаем, что юзер прошел онбординг и попал сразу на страницу бронирования
        // нужно сделать клейм сертификата и обновить список
        if (auth?.access_token && state?.certificate && state?.certificateId && certificates.length === 0) {
            APIPostCertificateClaim(
                String(auth?.access_token),
                Number(user?.id),
                state?.certificateId,
                state?.certificate.recipient_name,
            )
                .then(() => {
                    // Обновляем список сертификатов в приложении
                    APIGetCertificates(auth?.access_token, Number(user?.id))
                        .then(response => setCertificates(response.data));
                })
                .catch(err => {
                    console.log(err);
                    showToast('Произошла ошибка. Не удалось получить сертификат.');
                });
        }
    }, [
        state?.certificate,
        state?.certificateId,
        auth?.access_token,
        certificates.length,
        user?.id,
        showToast,
        setCertificates
    ]);

    return (
        <Page back={true}>
            <BookingErrorPopup isOpen={errorPopup} setOpen={setErrorPopup} resId={Number(restaurant.value)} count={errorPopupCount} botError={botError}/>
            <BookingGuestCountSelectorPopup
                guestCount={guestCount}
                childrenCount={childrenCount}
                setGuestCount={setGuestCount}
                setChildrenCount={setChildrenCount}
                isOpen={guestCountPopup}
                setOpen={setGuestCountPopup}
                maxGuestsNumber={getGuestMaxNumber(String(restaurant.value))}
                serviceFeeMessage={getServiceFeeData(String(restaurant.value))}
            />
            <DateListSelector
                isOpen={bookingDatePopup}
                setOpen={setBookingDatePopup}
                date={date}
                setDate={setDate}
                values={availableDates}
            />
            <RestaurantsListSelector
                isOpen={bookingRestaurantPopup}
                setOpen={setBookingRestaurantPopup}
                restaurant={restaurant}
                selectRestaurant={setRestaurant}
            />
            <div className={css.page}>
                <PageContainer>
                    <ContentContainer>
                        <div className={css.headerContainer}>
                            <div className={css.headerNav}>
                                <div style={{ width: '44px' }}></div>
                                <div className={css.headerInfo}>
                                    <h3 className={css.headerInfo__title}>
                                        {'Бронирование'}
                                    </h3>
                                </div>
                                <div>
                                    <RoundedButton
                                        icon={<CrossIcon size={44} />}
                                        action={goBack}
                                    />
                                </div>
                            </div>
                            <div className={css.header_bottom}>
                                <DropDownSelect
                                    title={restaurant.value !== 'unset'? restaurant?.title : 'Ресторан'}
                                    isValid={dateValidatedDisplay}
                                    icon={<KitchenIcon size={24}/>}
                                    onClick={() => setBookingRestaurantPopup(true)}
                                />
                                <div className={classNames(css.header__selector)}>
                                    <DropDownSelect
                                        title={date.value !== 'unset' ? formatDateShort(date.value) : 'Дата'}
                                        isValid={dateValidatedDisplay}

                                        icon={<CalendarIcon size={24}/>}
                                        onClick={() =>setBookingDatePopup(true)}
                                    />
                                    <DropDownSelect
                                        title={guestCount ? getGuestsString(guestCount + childrenCount) : 'Гости'}
                                        isValid={guestsValidatedDisplay}
                                        icon={<UsersIcon size={24}/>}
                                        onClick={() => setGuestCountPopup(!guestCountPopup)}
                                    />
                                </div>
                            </div>
                        </div>
                    </ContentContainer>
                    {!guestCount || date.value === 'unset' ? (
                        <ContentContainer>
                            <div className={css.timeOfDayContainer}>
                                <span className={css.noTimeSlotsText}>
                                    Выберите дату и количество гостей
                                </span>
                            </div>
                        </ContentContainer>
                    ) : (
                        <TimeSlots loading={timeslotsLoading} availableTimeslots={availableTimeslots} currentSelectedTime={currentSelectedTime} setCurrentSelectedTime={setCurrentSelectedTime} />
                    )}
                    {tg_id && mockEventsUsersList.includes(tg_id) && <CertificatesSelector setCertificateId={setCertificateId} isOpened={state?.certificate} selectedCertificateId={state?.certificateId}/>}
                    <BookingWish guestCount={guestCount} childrenCount={childrenCount} preOrder={preOrder} setPreOrder={setPreOrder} restaurant={restaurant.value} commentary={commentary} setCommentary={setCommentary} />
                    <ContentContainer>
                        <HeaderContainer>
                            <HeaderContent title={'Контакты'} />
                        </HeaderContainer>
                        <div className={css.form}>
                            <TextInput
                                value={userName}
                                onChange={setUserName}
                                placeholder={'Имя'}
                                validation_failed={!nameValidatedDisplay}
                            />
                            <TextInput
                                value={userPhone}
                                onChange={setUserPhone}
                                placeholder={'Телефон'}
                                validation_failed={!phoneValidatedDisplay}
                            />
                        </div>
                    </ContentContainer>
                    <ContentContainer>
                        <HeaderContainer>
                            <HeaderContent title={'Способ подтверждения'} />
                        </HeaderContainer>
                        <ConfirmationSelect options={confirmationList} currentValue={confirmation} onChange={setConfirmation}/>
                    </ContentContainer>
                </PageContainer>
            </div>
            <BottomButtonWrapper
                forwardedRef={bookingBtn}
                isDisabled={isFormValid}
                isLoading={requestLoading}
                onClick={createBooking}
            />
        </Page>
    );
};
