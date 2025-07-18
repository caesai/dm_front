import {FC, useEffect, useMemo, useRef, useState} from 'react';
import css from './BookingPage.module.css';

import { Page } from '@/components/Page.tsx';
import { PageContainer } from '@/components/PageContainer/PageContainer.tsx';
import { ContentContainer } from '@/components/ContentContainer/ContentContainer.tsx';
import { CrossIcon } from '@/components/Icons/CrossIcon.tsx';
import { RoundedButton } from '@/components/RoundedButton/RoundedButton.tsx';
import {useNavigate, useParams} from 'react-router-dom';
import classNames from 'classnames';
import { CalendarIcon } from '@/components/Icons/CalendarIcon.tsx';
import { DownArrow } from '@/components/Icons/DownArrow.tsx';
import { UsersIcon } from '@/components/Icons/UsersIcon.tsx';
import {
    formatDate,
    formatDateShort,
    getGuestsString,
    getTimeShort,
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
    const { id } = useParams();

    // Global state atoms
    const [auth] = useAtom(authAtom);
    const [user] = useAtom(userAtom);
    const [comms] = useAtom(commAtom);
    const [guestCount, setGuestCount] = useAtom(guestCountAtom);
    const [childrenCount, setChildrenCount] = useAtom(childrenCountAtom);
    const [bookingDate, setBookingDate] = useAtom(bookingDateAtom);
    const [currentSelectedTime, setCurrentSelectedTime] =
        useAtom<ITimeSlot | null>(timeslotAtom);

    // Local state
    const [guestCountPopup, setGuestCountPopup] = useState(false);
    const [bookingDatePopup, setBookingDatePopup] = useState(false);
    const [timeslotsLoading, setTimeslotsLoading] = useState(true);
    const [userName, setUserName] = useState<string>(
        user?.first_name ? user.first_name : ''
    );
    const [userPhone, setUserPhone] = useState<string>(
        user?.phone_number ? user.phone_number : ''
    );
    const [userEmail] = useState<string>(user?.email ? user.email : '');
    const [commentary, setCommentary] = useState('');
    const [confirmation, setConfirmation] = useState<IConfirmationType>({
        id: 'telegram',
        text: 'В Telegram',
    });
    const [availableTimeslots, setAvailableTimeslots] = useState<ITimeSlot[]>(
        []
    );
    const [currentPartOfDay, setCurrentPartOfDay] = useState<
        'morning' | 'day' | 'evening' | null
    >(null);
    const [bookingDates, setBookingDates] = useState<PickerValueObj[]>([]);

    const [phoneValidated, setPhoneValidated] = useState(true);
    const [nameValidated, setNameValidated] = useState(true);
    const [dateValidated, setDateValidated] = useState(true);
    const [guestsValidated, setGuestsValidated] = useState(true);
    const [requestLoading, setRequestLoading] = useState(false);

    const bookingBtn = useRef<HTMLDivElement>(null);

    // Update bookingDates when guestCount changes
    useEffect(() => {
        auth?.access_token && id
            ? APIGetAvailableDays(auth?.access_token, parseInt(id), 1).then(
                  (res) =>
                      setBookingDates(
                          res.data.map((v) => ({
                              title: formatDate(v),
                              value: v,
                          }))
                      )
              )
            : null;
    }, [guestCount]);

    useEffect(() => {
        console.log(currentSelectedTime);
    }, [currentSelectedTime]);

    // Update availableTimeslots when bookingDate or guestCount changes
    useEffect(() => {
        if (
            !id ||
            !auth?.access_token ||
            bookingDate.value === 'unset' ||
            !guestCount
        ) {
            return;
        }
        setTimeslotsLoading(true);
        APIGetAvailableTimeSlots(
            auth.access_token,
            parseInt(id),
            bookingDate.value,
            guestCount
        )
            .then((res) => setAvailableTimeslots(res.data))
            .finally(() => setTimeslotsLoading(false));
    }, [bookingDate, guestCount]);

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
                return h >= 18 && h <= 23;
            }),
        [availableTimeslots]
    );

    // Find the first part of the day with available timeslots and update currentPartOfDay
    useEffect(() => {
        if (morningTimeslots.length > 0) setCurrentPartOfDay('morning');
        else if (dayTimeslots.length > 0) setCurrentPartOfDay('day');
        else if (eveningTimeslots.length > 0) setCurrentPartOfDay('evening');
        else setCurrentPartOfDay(null); // Нет слотов вовсе
    }, [morningTimeslots, dayTimeslots, eveningTimeslots]);

    // Update currentPartOfDay when currentSelectedTime changes
    useEffect(() => {
        if (currentSelectedTime) {
            const part = findPartOfDay(
                new Date(currentSelectedTime.start_datetime)
            );
            setCurrentPartOfDay(part);
        }
    }, [currentSelectedTime]);

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
        if (hours >= 18 && hours <= 23) {
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
        return !guestCount;
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
        console.log('Click');
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
        //
        // window.location.href = "tg:resolve";
        if (window.Telegram.WebApp) {
            window.location.href = `https://t.me/${BASE_BOT}?start=find_table-${Number(id)}`
            window.Telegram.WebApp.close();
        } else {
            window.location.href = `https://t.me/${BASE_BOT}?start=find_table-${Number(id)}`
        }
    }

    const createBooking = () => {
        if (validateForm() && auth?.access_token && currentSelectedTime) {
            setRequestLoading(true);
            APICreateBooking(
                auth.access_token,
                Number(id),
                bookingDate.value,
                getTimeShort(currentSelectedTime.start_datetime),
                guestCount,
                childrenCount,
                userName,
                userPhone,
                userEmail,
                commentary,
                comms,
                confirmation.text
                // tg_id: user.
            )
                .then((res) => {
                    navigate(`/myBookings/${res.data.id}`);
                })
                .catch((err) => {
                    console.log('err: ', err);
                    alert(
                        'Произошла ошибка при выполнении запроса, попробуйте еще раз.'
                    );
                })
                .finally(() => setRequestLoading(false));
        }
    };

    return (
        <Page back={true}>
            <BookingGuestCountSelectorPopup
                guestCount={guestCount}
                childrenCount={childrenCount}
                setGuestCount={setGuestCount}
                setChildrenCount={setChildrenCount}
                isOpen={guestCountPopup}
                setOpen={setGuestCountPopup}
                maxGuestsNumber={getGuestMaxNumber(id)}
                serviceFeeMessage={getServiceFeeData(id)}
            />
            <BookingDateSelectorPopup
                isOpen={bookingDatePopup}
                setOpen={setBookingDatePopup}
                bookingDate={bookingDate}
                setBookingDate={setBookingDate}
                values={bookingDates}
            />
            <div className={css.page}>
                <PageContainer>
                    <ContentContainer>
                        <div className={css.headerContainer}>
                            <div className={css.headerNav}>
                                <div style={{ width: '44px' }}></div>
                                <div className={css.headerInfo}>
                                    <h3 className={css.headerInfo__title}>
                                        Бронирование
                                    </h3>
                                </div>
                                <div>
                                    <RoundedButton
                                        icon={<CrossIcon size={44} />}
                                        isBack={true}
                                    />
                                </div>
                            </div>
                            <div className={css.header_bottom}>
                                <div
                                    className={classNames(css.header__selector)}
                                >
                                    <div
                                        className={classNames(
                                            css.header__select,
                                            !dateValidated ? css.invalid : null
                                        )}
                                        onClick={() =>
                                            setBookingDatePopup(true)
                                        }
                                    >
                                        <div
                                            className={css.header__select__left}
                                        >
                                            <CalendarIcon
                                                size={24}
                                            ></CalendarIcon>
                                            <span
                                                className={
                                                    css.header__select__left_text
                                                }
                                            >
                                                {bookingDate.value !== 'unset'
                                                    ? formatDateShort(
                                                          bookingDate.value
                                                      )
                                                    : 'Дата'}
                                            </span>
                                        </div>
                                        <div
                                            className={
                                                css.header__select__arrow
                                            }
                                        >
                                            <DownArrow></DownArrow>
                                        </div>
                                    </div>
                                    <div
                                        className={classNames(
                                            css.header__select,
                                            !guestsValidated
                                                ? css.invalid
                                                : null
                                        )}
                                        onClick={() =>
                                            setGuestCountPopup(!guestCountPopup)
                                        }
                                    >
                                        <div
                                            className={css.header__select__left}
                                        >
                                            <UsersIcon size={24}></UsersIcon>
                                            <span
                                                className={
                                                    css.header__select__left_text
                                                }
                                            >
                                                {guestCount
                                                    ? getGuestsString(
                                                          guestCount
                                                      )
                                                    : 'Гости'}
                                            </span>
                                        </div>
                                        <div
                                            className={
                                                css.header__select__arrow
                                            }
                                        >
                                            <DownArrow></DownArrow>
                                        </div>
                                    </div>
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
                                <UniversalButton
                                    action={hideApp}
                                    width={'full'}
                                    title={'Не нашли стол на желаемую дату и время?'}
                                    style={{ fontSize: 12, color: "gray", textDecoration: 'underline', fontFamily: 'Mont'}} />
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
                                                            onClick={() =>
                                                                setCurrentSelectedTime(
                                                                    v
                                                                )
                                                            }
                                                        >
                                                            <span>
                                                                {currentSelectedTime?.start_datetime ==
                                                                v.start_datetime
                                                                    ? `${getTimeShort(
                                                                          v.start_datetime
                                                                      )} - ${getTimeShort(
                                                                          v.end_datetime
                                                                      )}`
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
                                <UniversalButton
                                    action={hideApp}
                                    width={'full'}
                                    title={'Не нашли стол на желаемую дату и время?'}
                                    style={{ fontSize: 12, color: "gray", textDecoration: 'underline', fontFamily: 'Mont'}} />
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

                    <ContentContainer>
                        <HeaderContainer>
                            <HeaderContent title={'Пожелания к брони'} />
                        </HeaderContainer>
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
                                {id !== undefined &&
                                    getBookingCommentMock(id).map((obj) => (
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
                    </ContentContainer>
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
            <div className={css.absoluteBottom} ref={bookingBtn}>
                <div className={css.absoluteBottom_wrapper}>
                    <div
                        className={classNames(
                            css.redButton,
                            validateFormMemo ? null : css.disabledButton,
                            requestLoading && css.loadingButton
                        )}
                        onClick={() => createBooking()}
                    >
                        <span className={css.text}>Забронировать</span>
                    </div>
                </div>
            </div>
        </Page>
    );
};
