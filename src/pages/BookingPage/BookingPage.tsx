import { FC, useEffect, useMemo, useState } from 'react';
import css from './BookingPage.module.css';

import { Page } from '@/components/Page.tsx';
import { PageContainer } from '@/components/PageContainer/PageContainer.tsx';
import { ContentContainer } from '@/components/ContentContainer/ContentContainer.tsx';
import { CrossIcon } from '@/components/Icons/CrossIcon.tsx';
import { RoundedButton } from '@/components/RoundedButton/RoundedButton.tsx';
import { useNavigate, useParams } from 'react-router-dom';
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
import { BOOKINGCOMMENTMOCK } from '@/mockData.ts';
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
    guestCountAtom,
    timeslotAtom,
} from '@/atoms/bookingInfoAtom.ts';
import { PlaceholderBlock } from '@/components/PlaceholderBlock/PlaceholderBlock.tsx';

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

    const [auth] = useAtom(authAtom);
    const [user] = useAtom(userAtom);
    const [comms] = useAtom(commAtom);
    const [guestCount, setGuestCount] = useAtom(guestCountAtom);
    const [bookingDate, setBookingDate] = useAtom(bookingDateAtom);
    const [guestCountPopup, setGuestCountPopup] = useState(false);
    const [bookingDatePopup, setBookingDatePopup] = useState(false);
    const [timeslotsLoading, setTimeslotsLoading] = useState(true);
    const [userName, setUserName] = useState<string>(
        user?.first_name ? user.first_name : ''
    );
    const [userPhone, setUserPhone] = useState<string>(
        user?.phone_number ? user.phone_number : ''
    );
    const [userEmail, setUserEmail] = useState<string>(
        user?.email ? user.email : ''
    );
    const [confirmation, setConfirmation] = useState<IConfirmationType>({
        id: 'telegram',
        text: 'В Telegram',
    });
    const [availableTimeslots, setAvailableTimeslots] = useState<ITimeSlot[]>(
        []
    );
    const [filteredTimeslots, setFilteredTimeslots] = useState<ITimeSlot[]>([]);
    const [currentPartOfDay, setCurrentPartOfDay] = useState({
        morning: true,
        day: false,
        evening: false,
    });
    const [commentary, setCommentary] = useState('');
    const [currentSelectedTime, setCurrentSelectedTime] =
        useAtom<ITimeSlot | null>(timeslotAtom);
    const [bookingDates, setBookingDates] = useState<PickerValueObj[]>([]);

    const [phoneValidated, setPhoneValidated] = useState(true);
    const [nameValidated, setNameValidated] = useState(true);
    const [emailValidated, setEmailValidated] = useState(true);
    const [dateValidated, setDateValidated] = useState(true);
    const [guestsValidated, setGuestsValidated] = useState(true);
    const [requestLoading, setRequestLoading] = useState(false);

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

    useEffect(() => {
        if (currentSelectedTime) {
            const part = findPartOfDay(
                new Date(currentSelectedTime.start_datetime)
            );
            switch (part) {
                case 'morning':
                    setCurrentPartOfDay({
                        morning: true,
                        day: false,
                        evening: false,
                    });
                    break;
                case 'evening':
                    setCurrentPartOfDay({
                        morning: false,
                        day: false,
                        evening: true,
                    });
                    break;
                case 'day':
                    setCurrentPartOfDay({
                        morning: false,
                        day: true,
                        evening: false,
                    });
                    break;
            }
        }
    }, [currentSelectedTime, availableTimeslots]);

    useEffect(() => {
        if (
            !id ||
            !auth?.access_token ||
            bookingDate.value === 'unset' ||
            guestCount.value === 'unset'
        ) {
            return;
        }
        setTimeslotsLoading(true);
        APIGetAvailableTimeSlots(
            auth.access_token,
            parseInt(id),
            bookingDate.value,
            parseInt(guestCount.value)
        )
            .then((res) => setAvailableTimeslots(res.data))
            .finally(() => setTimeslotsLoading(false));
    }, [bookingDate, guestCount]);

    useEffect(() => {
        if (currentPartOfDay.morning) {
            setFilteredTimeslots(
                availableTimeslots.filter(
                    (v) =>
                        new Date(v.start_datetime).getHours() >= 8 &&
                        new Date(v.start_datetime).getHours() < 12
                )
            );
        } else if (currentPartOfDay.day) {
            setFilteredTimeslots(
                availableTimeslots.filter(
                    (v) =>
                        new Date(v.start_datetime).getHours() >= 12 &&
                        new Date(v.start_datetime).getHours() < 18
                )
            );
        } else if (currentPartOfDay.evening) {
            setFilteredTimeslots(
                availableTimeslots.filter(
                    (v) =>
                        new Date(v.start_datetime).getHours() >= 18 &&
                        new Date(v.start_datetime).getHours() <= 23
                )
            );
        }
    }, [availableTimeslots, currentPartOfDay]);

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
    const emailValidate = useMemo(() => {
        const EMAIL_REGEXP =
            /^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/iu;
        return Boolean(userEmail.trim().match(EMAIL_REGEXP));
    }, [userEmail]);
    const timeslotValidate = useMemo(() => {
        return !!currentSelectedTime;
    }, [currentSelectedTime]);
    const guestsValidate = useMemo(() => {
        return !(guestCount.value == 'unset');
    }, [guestCount]);

    const validateFormMemo = useMemo(() => {
        return [
            nameValidate,
            phoneValidate,
            emailValidate,
            currentSelectedTime,
            guestCount,
        ].every(Boolean);
    }, [
        nameValidate,
        phoneValidate,
        emailValidate,
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
        if (!emailValidate) {
            setEmailValidated(false);
            setTimeout(() => {
                setEmailValidated(true);
            }, 5000);
        }
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

    const createBooking = () => {
        if (validateForm() && auth?.access_token && currentSelectedTime) {
            setRequestLoading(true);
            APICreateBooking(
                auth.access_token,
                Number(id),
                bookingDate.value,
                getTimeShort(currentSelectedTime.start_datetime),
                Number(guestCount.value),
                userName,
                userPhone,
                userEmail,
                commentary,
                comms,
                confirmation.text
            )
                .then((res) => {
                    navigate(`/myBookings/${res.data.id}`);
                })
                .catch(() => {
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
                setGuestCount={setGuestCount}
                isOpen={guestCountPopup}
                setOpen={setGuestCountPopup}
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
                                                          guestCount.value
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
                    {guestCount.value === 'unset' ||
                    bookingDate.value === 'unset' ? null : timeslotsLoading ? (
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
                                            <div
                                                className={classNames(
                                                    css.timeOfDay,
                                                    currentPartOfDay.morning
                                                        ? css.timeOfDay__active
                                                        : null
                                                )}
                                                onClick={() =>
                                                    setCurrentPartOfDay(() => ({
                                                        morning: true,
                                                        day: false,
                                                        evening: false,
                                                    }))
                                                }
                                            >
                                                <span>Утро</span>
                                            </div>
                                            <div
                                                className={classNames(
                                                    css.timeOfDay,
                                                    currentPartOfDay.day
                                                        ? css.timeOfDay__active
                                                        : null
                                                )}
                                                onClick={() =>
                                                    setCurrentPartOfDay(() => ({
                                                        morning: false,
                                                        day: true,
                                                        evening: false,
                                                    }))
                                                }
                                            >
                                                <span>День</span>
                                            </div>
                                            <div
                                                className={classNames(
                                                    css.timeOfDay,
                                                    currentPartOfDay.evening
                                                        ? css.timeOfDay__active
                                                        : null
                                                )}
                                                onClick={() =>
                                                    setCurrentPartOfDay(() => ({
                                                        morning: false,
                                                        day: false,
                                                        evening: true,
                                                    }))
                                                }
                                            >
                                                <span>Вечер</span>
                                            </div>
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
                                                                {getTimeShort(
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
                            </div>
                        </ContentContainer>
                    )}
                    <ContentContainer>
                        <HeaderContainer>
                            <HeaderContent title={'Пожелания к брони'} />
                        </HeaderContainer>
                        <TextInput
                            value={commentary}
                            onChange={(e) => setCommentary(e)}
                            placeholder={'Комментарий к брони'}
                        />
                        <div className={css.commentary_options}>
                            <Swiper
                                slidesPerView="auto"
                                modules={[FreeMode]}
                                freeMode={true}
                                spaceBetween={8}
                            >
                                {BOOKINGCOMMENTMOCK.map((obj) => (
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
                            <TextInput
                                value={userEmail}
                                onChange={setUserEmail}
                                placeholder={'Email'}
                                validation_failed={!emailValidated}
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
            <div className={css.absoluteBottom}>
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
