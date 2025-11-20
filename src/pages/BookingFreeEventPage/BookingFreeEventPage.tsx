import {FC, useEffect, useRef, useState} from 'react';
import css from '@/pages/BookingPage/BookingPage.module.css';

import { Page } from '@/components/Page.tsx';
import { PageContainer } from '@/components/PageContainer/PageContainer.tsx';
import { ContentContainer } from '@/components/ContentContainer/ContentContainer.tsx';
import { CrossIcon } from '@/components/Icons/CrossIcon.tsx';
import { RoundedButton } from '@/components/RoundedButton/RoundedButton.tsx';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import classNames from 'classnames';
import { CalendarIcon } from '@/components/Icons/CalendarIcon.tsx';
import { UsersIcon } from '@/components/Icons/UsersIcon.tsx';
import {
    formatDate,
    formatDateShort,
    getGuestsString,
    getTimeShort,
} from '@/utils.ts';
import { BookingGuestCountSelectorPopup } from '@/components/BookingGuestCountSelectorPopup/BookingGuestCountSelectorPopup.tsx';
import { HeaderContainer } from '@/components/ContentBlock/HeaderContainer/HeaderContainer.tsx';
import { HeaderContent } from '@/components/ContentBlock/HeaderContainer/HeaderContent/HeaderContainer.tsx';
import { TextInput } from '@/components/TextInput/TextInput.tsx';
import {
    getGuestMaxNumber,
    getServiceFeeData,
} from '@/mockData.ts';
import { IConfirmationType } from '@/components/ConfirmationSelect/ConfirmationSelect.types.ts';
import { ConfirmationSelect } from '@/components/ConfirmationSelect/ConfirmationSelect.tsx';
import { ITimeSlot } from '@/pages/BookingPage/BookingPage.types.ts';
import { DateListSelector } from '@/components/DateListSelector/DateListSelector.tsx';
import { PickerValueObj } from '@/lib/react-mobile-picker/components/Picker.tsx';
import {
    APICreateBooking,
    APIGetAvailableDays,
} from '@/api/restaurants.ts';
import { useAtom } from 'jotai';
import { authAtom, userAtom } from '@/atoms/userAtom.ts';
import { commAtom } from '@/atoms/bookingCommAtom.ts';
import { BookingErrorPopup } from '@/components/BookingErrorPopup/BookingErrorPopup.tsx';
import { BottomButtonWrapper } from '@/components/BottomButtonWrapper/BottomButtonWrapper.tsx';
import { DropDownSelect } from '@/components/DropDownSelect/DropDownSelect.tsx';
import { APIGetAvailableEventTimeSlots } from '@/api/events.ts';
import { TimeSlots } from '@/components/TimeSlots/TimeSlots.tsx';
import { useBookingFormValidation } from '@/hooks/useBookingFormValidation.ts';
import { BookingWish } from '@/components/BookingWish/BookingWish.tsx';
import { CertificatesSelector } from '@/components/CertificatesSelector/CertificatesSelector.tsx';
import { mockEventsUsersList } from '@/__mocks__/events.mock.ts';

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

export const BookingFreeEventPage: FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { id } = useParams();
    const state = location?.state;
    const { eventId, eventName } = state;
    // Global state atoms
    const [auth] = useAtom(authAtom);
    const [user] = useAtom(userAtom);
    const [comms] = useAtom(commAtom)
    const [guestCount, setGuestCount] = useState(0);
    const [childrenCount, setChildrenCount] = useState(0);
    const [date, setDate] = useState<PickerValueObj>({
        title: 'unset',
        value: 'unset',
    });
    const [currentSelectedTime, setCurrentSelectedTime] = useState<ITimeSlot | null>(null);

    const [userName, setUserName] = useState<string>(user?.first_name ? user.first_name : '');
    const [userPhone, setUserPhone] = useState<string>(user?.phone_number ? user.phone_number : '');
    const [userEmail] = useState<string>(user?.email ? user.email : '');
    const [commentary, setCommentary] = useState('');
    const [confirmation, setConfirmation] = useState<IConfirmationType>(confirmationList[0]);
    const [availableTimeslots, setAvailableTimeslots] = useState<ITimeSlot[]>([]);
    const [availableDates, setAvailableDates] = useState<PickerValueObj[]>([]);
    const [guestCountPopup, setGuestCountPopup] = useState(false);
    const [bookingDatePopup, setBookingDatePopup] = useState(false);
    const [timeslotsLoading, setTimeslotsLoading] = useState(true);
    const [requestLoading, setRequestLoading] = useState(false);
    const [errorPopup, setErrorPopup] = useState(false);
    const [botError, setBotError] = useState(false);
    const [errorPopupCount, setErrorPopupCount] = useState(0);
    const [preOrder, setPreOrder] = useState(false);
    const [certificate_id, setCertificateId] = useState<string | null>(null);
    const bookingBtn = useRef<HTMLDivElement>(null);

    // Update bookingDates when guestCount changes
    useEffect(() => {
        auth?.access_token
            ? APIGetAvailableDays(auth?.access_token, Number(id), 1).then(
                (res) =>
                    setAvailableDates(
                        res.data.map((v) => ({
                            title: formatDate(v),
                            value: v,
                        }))
                    )
            )
            : null;
    }, [guestCount, id]);

    // Update availableTimeslots when bookingDate or guestCount changes
    useEffect(() => {
        if (
            !auth?.access_token ||
            date.value === 'unset' ||
            !guestCount
        ) {
            return;
        }
        setTimeslotsLoading(true);
            APIGetAvailableEventTimeSlots(
                auth.access_token,
                Number(id),
                guestCount,
                Number(eventId)
            )
                .then((res) => setAvailableTimeslots(res.data.timeslots))
                .finally(() => setTimeslotsLoading(false));
    }, [date, guestCount]);


    useEffect(() => {
        if (state) {
            const { eventDate, eventTime } = state;
            setDate(eventDate);
            setCurrentSelectedTime(eventTime);
        }
    },[state]);

    // Validation methods
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
            navigate('/onboarding/3', { state: { id, date, time: currentSelectedTime, sharedRestaurant: true } });
            return;
        }
        if (validateForm() && auth?.access_token && currentSelectedTime) {
            setRequestLoading(true);
            APICreateBooking(
                auth.access_token,
                Number(id),
                date.value,
                getTimeShort(currentSelectedTime.start_datetime),
                guestCount,
                childrenCount,
                userName,
                userPhone,
                userEmail,
                commentary,
                comms,
                confirmation.text,
                (guestCount + childrenCount) < 8 ? false : preOrder,
                Number(eventId),
                certificate_id
            )
                .then((res) => {
                    if (res.data?.error) {
                        setErrorPopup(true);
                        setBotError(true);
                        return;
                    }
                    navigate('/tickets/' + res.data?.ticket_id);
                })
                .catch((err) => {
                    console.error('err: ', err);
                    setErrorPopup(true);
                    setErrorPopupCount((prev) => prev + 1);
                })
                .finally(() => setRequestLoading(false));
        }
    };

    const tg_id = window.Telegram.WebApp.initDataUnsafe.user.id;

    return (
        <Page back={true}>
            <BookingErrorPopup isOpen={errorPopup} setOpen={setErrorPopup} resId={Number(id)} count={errorPopupCount} botError={botError}/>
            <BookingGuestCountSelectorPopup
                guestCount={guestCount}
                childrenCount={childrenCount}
                setGuestCount={setGuestCount}
                setChildrenCount={setChildrenCount}
                isOpen={guestCountPopup}
                setOpen={setGuestCountPopup}
                maxGuestsNumber={getGuestMaxNumber(String(id))}
                serviceFeeMessage={getServiceFeeData(String(id))}
            />
            <DateListSelector
                isOpen={bookingDatePopup}
                setOpen={setBookingDatePopup}
                date={date}
                setDate={setDate}
                values={availableDates}
            />
            <div className={css.page}>
                <PageContainer>
                    <ContentContainer>
                        <div className={css.headerContainer}>
                            <div className={css.headerNav}>
                                <div style={{ width: '44px' }}></div>
                                <div className={css.headerInfo}>
                                    <h3 className={css.headerInfo__title}>
                                        {eventName}
                                    </h3>

                                </div>
                                <div>
                                    <RoundedButton
                                        icon={<CrossIcon size={44} />}
                                        action={() => {
                                            if (state.sharedEvent) {
                                                navigate('/');
                                            } else {
                                                navigate(-1);
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                            <div className={css.header_bottom}>
                                <div className={classNames(css.header__selector)}>
                                    <DropDownSelect
                                        title={date.value !== 'unset' ? formatDateShort(
                                            date.value
                                        ) : 'Дата'}
                                        isValid={dateValidatedDisplay}
                                        icon={<CalendarIcon size={24}/>}
                                        // onClick={() =>
                                        //     !isFreeEventBooking && setBookingDatePopup(true)
                                        // }
                                    />
                                    <DropDownSelect
                                        title={guestCount ? getGuestsString(guestCount + childrenCount) : 'Гости'}
                                        isValid={guestsValidatedDisplay}
                                        icon={<UsersIcon size={24}/>}
                                        onClick={() =>
                                            setGuestCountPopup(!guestCountPopup)
                                        }
                                    />
                                </div>
                            </div>
                        </div>
                    </ContentContainer>
                    {!guestCount ||
                    date.value === 'unset' ? (
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
                    {tg_id && mockEventsUsersList.includes(tg_id) && <CertificatesSelector isOpened={state?.certificate} setCertificateId={setCertificateId} selectedCertificateId={null} />}
                    <BookingWish
                        guestCount={guestCount}
                        childrenCount={childrenCount}
                        preOrder={preOrder}
                        setPreOrder={setPreOrder}
                        restaurant={String(id)}
                        commentary={commentary}
                        setCommentary={setCommentary}
                    />
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
                        <ConfirmationSelect
                            options={confirmationList}
                            currentValue={confirmation}
                            onChange={setConfirmation}
                        />
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
