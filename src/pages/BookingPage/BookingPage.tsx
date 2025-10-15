import {FC, useEffect, useMemo, useRef, useState} from 'react';
import css from './BookingPage.module.css';

import { Page } from '@/components/Page.tsx';
import { PageContainer } from '@/components/PageContainer/PageContainer.tsx';
import { ContentContainer } from '@/components/ContentContainer/ContentContainer.tsx';
import { CrossIcon } from '@/components/Icons/CrossIcon.tsx';
import { RoundedButton } from '@/components/RoundedButton/RoundedButton.tsx';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import classNames from 'classnames';
import { CalendarIcon } from '@/components/Icons/CalendarIcon.tsx';
import { UsersIcon } from '@/components/Icons/UsersIcon.tsx';
import {
    formatDate,
    formatDateShort,
    // getDataFromLocalStorage,
    getGuestsString,
    getTimeShort,
    // removeDataFromLocalStorage,
} from '@/utils.ts';
import { BookingGuestCountSelectorPopup } from '@/components/BookingGuestCountSelectorPopup/BookingGuestCountSelectorPopup.tsx';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode } from 'swiper/modules';
import { HeaderContainer } from '@/components/ContentBlock/HeaderContainer/HeaderContainer.tsx';
import { HeaderContent } from '@/components/ContentBlock/HeaderContainer/HeaderContent/HeaderContainer.tsx';
import { TextInput } from '@/components/TextInput/TextInput.tsx';
import { CommentaryOptionButton } from '@/components/CommentaryOptionButton/CommentaryOptionButton.tsx';
import {
    getBookingCommentMock,
    getGuestMaxNumber,
    getServiceFeeData,
} from '@/mockData.ts';
import { IConfirmationType } from '@/components/ConfirmationSelect/ConfirmationSelect.types.ts';
import { ConfirmationSelect } from '@/components/ConfirmationSelect/ConfirmationSelect.tsx';
import { ITimeSlot } from '@/pages/BookingPage/BookingPage.types.ts';
import { BookingDateSelectorPopup } from '@/components/BookingDateSelectorPopup/BookingDateSelectorPopup.tsx';
import { PickerValueObj } from '@/lib/react-mobile-picker/components/Picker.tsx';
import {
    APICreateBooking,
    APIGetAvailableDays,
    APIGetAvailableTimeSlots,
} from '@/api/restaurants.ts';
import { useAtom } from 'jotai';
import { authAtom, userAtom } from '@/atoms/userAtom.ts';
import { commAtom } from '@/atoms/bookingCommAtom.ts';
import {
    bookingDateAtom,
    // guestCountAtom,
    timeslotAtom,
} from '@/atoms/bookingInfoAtom.ts';
import { PlaceholderBlock } from '@/components/PlaceholderBlock/PlaceholderBlock.tsx';
import {BASE_BOT} from "@/api/base.ts";
import {UniversalButton} from "@/components/Buttons/UniversalButton/UniversalButton.tsx";
import { childrenCountAtom, guestCountAtom} from "@/atoms/eventBookingAtom.ts";
import { BookingErrorPopup } from '@/components/BookingErrorPopup/BookingErrorPopup.tsx';
// import { BookingSpecialPopup } from '@/components/BookingSpecialPopup/BookingSpecialPopup.tsx';

import { MenuPopup } from '@/components/MenuPopup/MenuPopup.tsx';

import specialMenu from '/img/specialMenu.jpg';
import specialMenu2 from '/img/specialMenu2.jpg';
import { BottomButtonWrapper } from '@/components/BottomButtonWrapper/BottomButtonWrapper.tsx';
import { DropDownSelect } from '@/components/DropDownSelect/DropDownSelect.tsx';
import { KitchenIcon } from '@/components/Icons/KitchenIcon.tsx';
import { bookingRestaurantAtom, restaurantsListAtom } from '@/atoms/restaurantsListAtom.ts';
import {
    BookingRestaurantsSelectorPopup
} from '@/components/BookingRestaurantsSelectorPopup/BookingRestaurantsSelectorPopup.tsx';
import { CheckBoxInput } from '@/components/CheckBoxInput/CheckBoxInput.tsx';
import { InfoIcon } from '@/components/Icons/InfoIcon.tsx';
import { BookingInfoPopup } from '@/components/BookingInfoPopup/BookingInfoPopup.tsx';
import moment from 'moment/moment';
import { APIGetAvailableEventTimeSlots } from '@/api/events.ts';
// import { Share } from '@/components/Icons/Share.tsx';

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
    const [params] = useSearchParams();
    const idFromParams = params.get('id');
    const isFreeEventBooking = params.get('free_event');
    const freeEventid = params.get('event_id');
    const location = useLocation();
    const state = location?.state;
    // Global state atoms
    const [auth] = useAtom(authAtom);
    const [user] = useAtom(userAtom);
    const [comms] = useAtom(commAtom);
    const [guestCount, setGuestCount] = useAtom(guestCountAtom);
    const [childrenCount, setChildrenCount] = useAtom(childrenCountAtom);
    const [bookingDate, setBookingDate] = useAtom(bookingDateAtom);
    const [currentSelectedTime, setCurrentSelectedTime] = useAtom<ITimeSlot | null>(timeslotAtom);
    const [bookingRestaurant, setBookingRestaurant] = useAtom(bookingRestaurantAtom);
    const [restaurants] = useAtom(restaurantsListAtom);

    // Local state
    const [guestCountPopup, setGuestCountPopup] = useState(false);
    const [bookingDatePopup, setBookingDatePopup] = useState(false);
    const [bookingRestaurantPopup, setBookingRestaurantPopup] = useState(false);
    const [timeslotsLoading, setTimeslotsLoading] = useState(true);
    const [userName, setUserName] = useState<string>(user?.first_name ? user.first_name : '');
    const [userPhone, setUserPhone] = useState<string>(user?.phone_number ? user.phone_number : '');
    const [userEmail] = useState<string>(user?.email ? user.email : '');
    const [commentary, setCommentary] = useState('');
    const [confirmation, setConfirmation] = useState<IConfirmationType>({
        id: 'telegram',
        text: 'В Telegram',
    });
    const [availableTimeslots, setAvailableTimeslots] = useState<ITimeSlot[]>([]);
    const [currentPartOfDay, setCurrentPartOfDay] = useState<'morning' | 'day' | 'evening' | null>(null);
    const [bookingDates, setBookingDates] = useState<PickerValueObj[]>([]);
    const [bookingRestaurants, setBookingRestaurants] = useState<PickerValueObj[]>([]);

    const [phoneValidated, setPhoneValidated] = useState(true);
    const [nameValidated, setNameValidated] = useState(true);
    const [dateValidated, setDateValidated] = useState(true);
    const [guestsValidated, setGuestsValidated] = useState(true);
    const [requestLoading, setRequestLoading] = useState(false);
    const [errorPopup, setErrorPopup] = useState(false);
    const [botError, setBotError] = useState(false);
    const [errorPopupCount, setErrorPopupCount] = useState(0);
    // const [specPopup, setSpecPopup] = useState(false);
    const [menuPopupOpen, setMenuPopupOpen] = useState(false);
    const [preOrder, setPreOrder] = useState(false);
    const [infoPopup, setInfoPopup] = useState(false);

    const bookingBtn = useRef<HTMLDivElement>(null);

    // Update bookingDates when guestCount changes
    useEffect(() => {
        auth?.access_token && bookingRestaurant.value !== 'unset'
            ? APIGetAvailableDays(auth?.access_token, parseInt(String(bookingRestaurant.value)), 1).then(
                  (res) =>
                      setBookingDates(
                          res.data.map((v) => ({
                              title: formatDate(v),
                              value: v,
                          }))
                      )
              )
            : null;
    }, [guestCount, bookingRestaurant]);

    // useEffect(() => {
    //     console.log(currentSelectedTime);
    // }, [currentSelectedTime]);

    // Update availableTimeslots when bookingDate or guestCount changes
    useEffect(() => {
        if (
            bookingRestaurant.value === 'unset' ||
            !auth?.access_token ||
            bookingDate.value === 'unset' ||
            !guestCount
        ) {
            return;
        }
        setTimeslotsLoading(true);
        if (isFreeEventBooking) {
            APIGetAvailableEventTimeSlots(
                auth.access_token,
                parseInt(String(bookingRestaurant.value)),
                guestCount,
                Number(freeEventid)
            )
                .then((res) => setAvailableTimeslots(res.data.timeslots))
                .finally(() => setTimeslotsLoading(false));

        } else {
            APIGetAvailableTimeSlots(
                auth.access_token,
                parseInt(String(bookingRestaurant.value)),
                bookingDate.value,
                guestCount,
            )
                .then((res) => setAvailableTimeslots(res.data))
                .finally(() => setTimeslotsLoading(false));
        }
    }, [bookingDate, guestCount, bookingRestaurant]);

    const morningTimeslots = useMemo(
        () =>
            availableTimeslots.filter((v) => {
                const h = new Date(v.start_datetime).getHours();
                return h >= 8 && h < 12;
            }),
        [availableTimeslots]
    );
    const dayTimeslots = useMemo(
        () =>
            availableTimeslots.filter((v) => {
                const h = new Date(v.start_datetime).getHours();
                return h >= 12 && h < 18;
            }),
        [availableTimeslots]
    );
    const eveningTimeslots = useMemo(
        () =>
            availableTimeslots.filter((v) => {
                const h = new Date(v.start_datetime).getHours();
                return h >= 18 && h <= 23 || h == 0;
            }),
        [availableTimeslots]
    );

    useEffect(() => {
        if (state) {
            const { date, time } = state;
            setBookingDate(date);
            setCurrentSelectedTime(time);
        }
    },[state])

    // Find the first part of the day with available timeslots and update currentPartOfDay
    // useEffect(() => {
    //     if (morningTimeslots.length > 0) setCurrentPartOfDay('morning');
    //     else if (dayTimeslots.length > 0) setCurrentPartOfDay('day');
    //     else if (eveningTimeslots.length > 0) setCurrentPartOfDay('evening');
    //     else setCurrentPartOfDay(null); // Нет слотов вовсе
    //     // console.log('??')
    // }, [morningTimeslots, dayTimeslots, eveningTimeslots]);

    // Update currentPartOfDay when currentSelectedTime changes
    useEffect(() => {
        if (currentSelectedTime) {
            const part = findPartOfDay(
                new Date(currentSelectedTime.start_datetime)
            );
            setCurrentPartOfDay(part);
        }
    }, [currentSelectedTime, guestCount]);

    // Set currentPartOfDay based on available timeslots if currentSelectedTime is not set
    useEffect(() => {
        if (!currentSelectedTime) {
            if (morningTimeslots.length > 0) setCurrentPartOfDay('morning');
            else if (dayTimeslots.length > 0) setCurrentPartOfDay('day');
            else if (eveningTimeslots.length > 0)
                setCurrentPartOfDay('evening');
            else setCurrentPartOfDay(null);
        }
    }, [
        availableTimeslots,
        morningTimeslots,
        dayTimeslots,
        eveningTimeslots,
        currentSelectedTime,
    ]);

    useEffect(() => {
        const restaurantList = restaurants.map((v) => {
            return {
                title: v.title,
                address: v.address,
                value: String(v.id),
            };
        });
        if (idFromParams) {
        //     setBookingRestaurant(restaurantList[0]);
            const restaurant = restaurantList.find(item => item.value === idFromParams);
            restaurant !== undefined && setBookingRestaurant(restaurant);
        } else {
            setBookingRestaurants(restaurantList);
        }
    }, [restaurants]);

    // Create filtered timeslots
    const filteredTimeslots = useMemo(() => {
        if (currentPartOfDay === 'morning') return morningTimeslots;
        if (currentPartOfDay === 'day') return dayTimeslots;
        if (currentPartOfDay === 'evening') return eveningTimeslots;
        return [];
    }, [currentPartOfDay, morningTimeslots, dayTimeslots, eveningTimeslots]);

    // Function to find part of the day based on the time
    const findPartOfDay = (dt: Date): 'morning' | 'day' | 'evening' => {
        const hours = dt.getHours();
        if (hours >= 8 && hours < 12) {
            return 'morning';
        }
        if (hours >= 12 && hours < 18) {
            return 'day';
        }
        if (hours >= 18 && hours <= 23 || hours == 0) {
            return 'evening';
        }
        return 'day';
    };

    // Validation methods
    const nameValidate = useMemo(() => {
        return Boolean(userName?.trim().length);
    }, [userName]);

    const phoneValidate = useMemo(() => {
        return Boolean(
            userPhone
                .trim()
                .match('^\\+?[78][-\\(]?\\d{3}\\)?-?\\d{3}-?\\d{2}-?\\d{2}$')
        );
    }, [userPhone]);

    const timeslotValidate = useMemo(() => {
        return !!currentSelectedTime;
    }, [currentSelectedTime]);

    const guestsValidate = useMemo(() => {
        return !!guestCount;
    }, [guestCount]);

    const validateFormMemo = useMemo(() => {
        return [
            nameValidate,
            phoneValidate,
            // emailValidate,
            currentSelectedTime,
            guestCount,
        ].every(Boolean);
    }, [
        nameValidate,
        phoneValidate,
        // emailValidate,
        currentSelectedTime,
        guestCount,
    ]);

    const validateForm = () => {
        if (!nameValidate) {
            setNameValidated(false);
            setTimeout(() => {
                setNameValidated(true);
            }, 5000);
        }
        if (!phoneValidate) {
            setPhoneValidated(false);
            setTimeout(() => {
                setPhoneValidated(true);
            }, 5000);
        }
        // if (!emailValidate) {
        //     setEmailValidated(false);
        //     setTimeout(() => {
        //         setEmailValidated(true);
        //     }, 5000);
        // }
        if (!timeslotValidate) {
            setDateValidated(false);
            setTimeout(() => {
                setDateValidated(true);
            }, 5000);
        }
        if (!guestsValidate) {
            setGuestsValidated(false);
            setTimeout(() => {
                setGuestsValidated(true);
            }, 5000);
        }
        return validateFormMemo;
    };

    const hideApp = () => {
        // window.location.href = "tg:resolve";
        if (window.Telegram.WebApp) {
            window.location.href = `https://t.me/${BASE_BOT}?start=find_table-${Number(bookingRestaurant.value)}`
            window.Telegram.WebApp.close();
        } else {
            window.location.href = `https://t.me/${BASE_BOT}?start=find_table-${Number(bookingRestaurant.value)}`
        }
    }

    const createBooking = () => {
        if (validateForm() && auth?.access_token && currentSelectedTime) {
            setRequestLoading(true);
            APICreateBooking(
                auth.access_token,
                Number(bookingRestaurant.value),
                bookingDate.value,
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
                // tg_id: user.
                isFreeEventBooking ? Number(freeEventid) : null
            )
                .then((res) => {
                    if (res.data?.error) {
                        setErrorPopup(true);
                        setBotError(true);
                        return;
                    }
                    if (isFreeEventBooking) {
                        navigate('/tickets/' + res.data?.ticket_id);
                    } else {
                        navigate(`/myBookings/${res.data.id}`);
                    }
                })
                .catch((err) => {
                    console.error('err: ', err);
                    setErrorPopup(true);
                    setErrorPopupCount((prev) => prev + 1);
                })
                .finally(() => setRequestLoading(false));
        }
    };
    // const isSpecialPopup = new Date(bookingDate.value).getTime() && new Date('2025-07-30').getTime() && currentPartOfDay === 'evening' && bookingRestaurant.value == '1';
    const openMenu = (isOpen: boolean) => {
        if (isOpen) {
            setErrorPopup(false);
            setMenuPopupOpen(true);
        } else {
            setErrorPopup(true);
            setMenuPopupOpen(false);
        }
    }
    // const shareBooking = () => {
    //     if (bookingRestaurant.value !== 'unset') {
    //         const url = encodeURI(
    //             `https://t.me/${BASE_BOT}?startapp=bookingId_${bookingRestaurant.value}`
    //         );
    //         const title = encodeURI(String(bookingRestaurant.title));
    //         const shareData = {
    //             title,
    //             url,
    //         }
    //         try {
    //             if (navigator && navigator.canShare(shareData)) {
    //                 navigator.share(shareData).then().catch((err) => {
    //                     alert(JSON.stringify(err));
    //                 });
    //             }
    //         } catch (e) {
    //             window.open(`https://t.me/share/url?url=${url}&text=${title}`, "_blank");
    //         }
    //     }
    // }
    // TODO: make proper utils function to calculate work end time
    const restaurantWorkEndTime = restaurants
        .find((item) => item.id === Number(bookingRestaurant.value))?.worktime
        .find((item) => String(item.weekday) === String(bookingDate.title).slice(-2))?.time_end;

    let workEndTime = moment(bookingDate.value);
    if (restaurantWorkEndTime !== undefined) {
        const endOfDay = Number(String(restaurantWorkEndTime).split(':')[0].replace(new RegExp('00', 'g'), '0')) < 12;
        if (endOfDay) {
            workEndTime = moment(workEndTime.clone().add(1, 'days').startOf('days').format('YYYY-MM-DD'));
        }
        workEndTime.set({
            hour: Number(String(restaurantWorkEndTime).split(':')[0].replace(new RegExp('00', 'g'), '0')),
            minutes: Number(String(restaurantWorkEndTime).split(':')[1].replace(new RegExp('00', 'g'), '0'))
        })
    }
    return (
        <Page back={true}>
            <MenuPopup
                isOpen={menuPopupOpen}
                setOpen={openMenu}
                menuItems={[specialMenu, specialMenu2]}
            />
            <BookingErrorPopup isOpen={errorPopup} setOpen={setErrorPopup} resId={Number(bookingRestaurant.value)} count={errorPopupCount} botError={botError}/>
            {/*<BookingSpecialPopup isOpen={specPopup} setOpen={setSpecPopup} createBooking={createBooking} resId={Number(bookingRestaurant.value)} setMenuPopupOpen={openMenu}/>*/}
            <BookingInfoPopup isOpen={infoPopup} setOpen={setInfoPopup} />
            <BookingGuestCountSelectorPopup
                guestCount={guestCount}
                childrenCount={childrenCount}
                setGuestCount={setGuestCount}
                setChildrenCount={setChildrenCount}
                isOpen={guestCountPopup}
                setOpen={setGuestCountPopup}
                maxGuestsNumber={getGuestMaxNumber(String(bookingRestaurant.value))}
                serviceFeeMessage={getServiceFeeData(String(bookingRestaurant.value))}
            />
            <BookingDateSelectorPopup
                isOpen={bookingDatePopup}
                setOpen={setBookingDatePopup}
                bookingDate={bookingDate}
                setBookingDate={setBookingDate}
                values={bookingDates}
            />
            {/*restaurants*/}
            <BookingRestaurantsSelectorPopup
                isOpen={bookingRestaurantPopup}
                setOpen={setBookingRestaurantPopup}
                bookingRestaurant={bookingRestaurant}
                setBookingRestaurant={setBookingRestaurant}
                values={bookingRestaurants}
            />
            <div className={css.page}>
                <PageContainer>
                    <ContentContainer>
                        <div className={css.headerContainer}>
                            <div className={css.headerNav}>
                                <div style={{ width: '44px' }}></div>
                                <div className={css.headerInfo}>
                                    <h3 className={css.headerInfo__title}>
                                        {isFreeEventBooking ? isFreeEventBooking : 'Бронирование'}
                                    </h3>
                                    {idFromParams && (
                                        <>
                                            <h3 className={css.headerInfo__title}>
                                                <b>{String(bookingRestaurant.title)}</b>
                                            </h3>
                                            <h4 className={css.headerInfo__subtitle}>{String(bookingRestaurant.address)}</h4>
                                        </>
                                    )}
                                </div>
                                <div>
                                    <RoundedButton
                                        icon={<CrossIcon size={44} />}
                                        // isBack={true}
                                        action={() => {
                                            console.log('params.get(\'shared\'): ', params.get('shared'))
                                            if (params.get('shared')) {
                                                navigate('/')
                                            } else {
                                                navigate(-1)
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                            <div className={css.header_bottom}>
                                {!idFromParams && <DropDownSelect
                                    title={bookingRestaurant.value !== 'unset'? String(bookingRestaurants.find((item) => item.value === bookingRestaurant.value)?.title) : 'Ресторан'}
                                    isValid={dateValidated}
                                    icon={<KitchenIcon size={24}/>}
                                    onClick={() => {
                                        setBookingRestaurantPopup(true);
                                    }}
                                />}
                                <div className={classNames(css.header__selector)}>
                                    <DropDownSelect
                                        title={bookingDate.value !== 'unset' ? formatDateShort(
                                            bookingDate.value
                                        ) : 'Дата'}
                                        isValid={dateValidated}

                                        icon={<CalendarIcon size={24}/>}
                                        onClick={() =>
                                            !isFreeEventBooking && setBookingDatePopup(true)
                                        }
                                    />
                                    <DropDownSelect
                                        title={guestCount ? getGuestsString(guestCount + childrenCount) : 'Гости'}
                                        isValid={guestsValidated}
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
                        bookingDate.value === 'unset' ? (
                        <ContentContainer>
                            <div className={css.timeOfDayContainer}>
                                <span className={css.noTimeSlotsText}>
                                    Выберите дату и количество гостей
                                </span>
                                {/*<Link*/}
                                {/*    style={{ fontSize: 12, color: "gray", textDecoration: 'underline', fontFamily: 'Mont'}}*/}
                                {/*    // target={'_blank'}*/}
                                {/*    to={`https://t.me/${BASE_BOT}?start=find_table-${Number(id)}`}*/}
                                {/*>*/}
                                {/*<UniversalButton*/}
                                {/*    action={hideApp}*/}
                                {/*    width={'full'}*/}
                                {/*    title={'Не нашли стол на желаемую дату и время?'}*/}
                                {/*    style={{ fontSize: 12, color: "gray", textDecoration: 'underline', fontFamily: 'Mont'}} />*/}
                                    {/*<span>Не нашли стол на желаемую дату и время?</span>*/}
                                {/*</Link>*/}
                            </div>
                        </ContentContainer>
                    ) : timeslotsLoading ? (
                        <PlaceholderBlock
                            width={'100%'}
                            height={'115px'}
                            rounded={'20px'}
                        />
                    ) : (
                        <ContentContainer>
                            <div className={css.timeOfDayContainer}>
                                {!availableTimeslots.length ? (
                                    <span className={css.noTimeSlotsText}>
                                        К сожалению, свободных столов не
                                        осталось
                                    </span>
                                ) : (
                                    <>
                                        <div className={css.select_timeOfDay}>
                                            {morningTimeslots.length > 0 && (
                                                <div
                                                    className={classNames(
                                                        css.timeOfDay,
                                                        currentPartOfDay ===
                                                            'morning' &&
                                                            css.timeOfDay__active
                                                    )}
                                                    onClick={() =>
                                                        setCurrentPartOfDay(
                                                            'morning'
                                                        )
                                                    }
                                                >
                                                    <span>Утро</span>
                                                </div>
                                            )}
                                            {dayTimeslots.length > 0 && (
                                                <div
                                                    className={classNames(
                                                        css.timeOfDay,
                                                        currentPartOfDay ===
                                                            'day' &&
                                                            css.timeOfDay__active
                                                    )}
                                                    onClick={() =>
                                                        setCurrentPartOfDay(
                                                            'day'
                                                        )
                                                    }
                                                >
                                                    <span>День</span>
                                                </div>
                                            )}
                                            {eveningTimeslots.length > 0 && (
                                                <div
                                                    className={classNames(
                                                        css.timeOfDay,
                                                        currentPartOfDay ===
                                                            'evening' &&
                                                            css.timeOfDay__active
                                                    )}
                                                    onClick={() =>
                                                        setCurrentPartOfDay(
                                                            'evening'
                                                        )
                                                    }
                                                >
                                                    <span>Вечер</span>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}

                                {availableTimeslots.length ? (
                                    <div className={css.timeList}>
                                        {filteredTimeslots.length ? (
                                            <Swiper
                                                slidesPerView="auto"
                                                modules={[FreeMode]}
                                                freeMode={true}
                                                spaceBetween={8}
                                                style={{
                                                    width: '100%',
                                                }}
                                                initialSlide={filteredTimeslots.findIndex(item => item.start_datetime === currentSelectedTime?.start_datetime)}
                                            >
                                                {filteredTimeslots.map((v) => (
                                                    <SwiperSlide
                                                        key={`time_${v.start_datetime}`}
                                                        style={{
                                                            width: 'max-content',
                                                        }}
                                                    >
                                                        <div
                                                            className={classNames(
                                                                css.timeList_button,
                                                                currentSelectedTime?.start_datetime ==
                                                                    v.start_datetime
                                                                    ? css.timeList_button__active
                                                                    : null
                                                            )}
                                                            onClick={() => {
                                                                setCurrentSelectedTime(
                                                                    v,
                                                                );
                                                            }}
                                                        >
                                                            <span>
                                                                {currentSelectedTime?.start_datetime ==
                                                                    v.start_datetime
                                                                        ? `${getTimeShort(
                                                                              v.start_datetime
                                                                          )} - ${moment(v.end_datetime).isBefore(workEndTime) ? 
                                                                        getTimeShort(
                                                                              v.end_datetime
                                                                          ) : restaurantWorkEndTime == undefined ? getTimeShort(
                                                                            v.end_datetime
                                                                        ) : restaurantWorkEndTime}`
                                                                        : getTimeShort(
                                                                              v.start_datetime
                                                                          )}
                                                            </span>
                                                        </div>
                                                    </SwiperSlide>
                                                ))}
                                            </Swiper>
                                        ) : (
                                            <span
                                                className={css.noTimeSlotsText}
                                            >
                                                К сожалению, доступных столов на
                                                выбранную часть дня не осталось
                                            </span>
                                        )}
                                    </div>
                                ) : null}
                                {!isFreeEventBooking && <UniversalButton
                                    action={hideApp}
                                    width={'full'}
                                    title={'Не нашли стол на желаемую дату и время?'}
                                    style={{ fontSize: 12, color: "gray", textDecoration: 'underline', fontFamily: 'Mont'}} />}
                            </div>
                        </ContentContainer>
                    )}

                    {/*<ContentContainer>*/}
                    {/*    <div className={css.timeOfDayContainer}>*/}
                    {/*        <div className={css.timeList}>*/}
                    {/*            <span*/}
                    {/*                className={css.noTimeSlotsText}*/}
                    {/*            >*/}
                    {/*                            К сожалению, доступных столов на*/}
                    {/*                            выбранную часть дня не осталось*/}
                    {/*            </span></div>*/}
                    {/*    </div>*/}
                    {/*</ContentContainer>*/}

                    {!isFreeEventBooking && <ContentContainer>
                        <HeaderContainer>
                            <HeaderContent title={'Пожелания к брони'} />
                        </HeaderContainer>
                        {(guestCount + childrenCount) >= 8 && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 5}}>
                                <CheckBoxInput
                                    checked={preOrder}
                                    toggle={() => setPreOrder(!preOrder)}
                                    label={'Оформить предзаказ блюд и напитков'} />
                                <span onClick={() => setInfoPopup(true)}>
                                    <InfoIcon size={14}/>
                                </span>
                            </div>
                        )}
                        <TextInput
                            value={commentary}
                            onFocus={() => {
                                if(bookingBtn.current) {
                                    bookingBtn.current.style.position = 'relative';
                                }
                            }}
                            onBlur={() => {
                                if(bookingBtn.current) {
                                    bookingBtn.current.style.position = 'fixed';
                                }
                            }}
                            onChange={(e) => {
                                setCommentary(e);
                            }}
                            placeholder={'Комментарий к брони'}
                        />
                        <div className={css.commentary_options}>
                            <Swiper
                                slidesPerView="auto"
                                modules={[FreeMode]}
                                freeMode={true}
                                spaceBetween={8}
                            >
                                {bookingRestaurant.value !== 'unset' &&
                                    getBookingCommentMock(String(bookingRestaurant.value)).map((obj) => (
                                        <SwiperSlide
                                            key={obj.text}
                                            style={{ width: 'max-content' }}
                                        >
                                            <CommentaryOptionButton
                                                text={obj.text}
                                                icon={obj.emoji}
                                            />
                                        </SwiperSlide>
                                    ))}
                            </Swiper>
                        </div>
                    </ContentContainer>}
                    <ContentContainer>
                        <HeaderContainer>
                            <HeaderContent title={'Контакты'} />
                        </HeaderContainer>
                        <div className={css.form}>
                            <TextInput
                                value={userName}
                                onChange={setUserName}
                                placeholder={'Имя'}
                                validation_failed={!nameValidated}
                            />
                            <TextInput
                                value={userPhone}
                                onChange={setUserPhone}
                                placeholder={'Телефон'}
                                validation_failed={!phoneValidated}
                            />
                            {/*<TextInput*/}
                            {/*    value={userEmail}*/}
                            {/*    onChange={setUserEmail}*/}
                            {/*    placeholder={'Email'}*/}
                            {/*    validation_failed={!emailValidated}*/}
                            {/*/>*/}
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
                isDisabled={validateFormMemo}
                isLoading={requestLoading}
                onClick={createBooking}
            />
        </Page>
    );
};
