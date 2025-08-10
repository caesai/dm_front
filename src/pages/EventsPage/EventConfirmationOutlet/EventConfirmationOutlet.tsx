import {useNavigate, useOutletContext, useParams} from 'react-router-dom';
import css from './EventConfirmationOutlet.module.css';
import {formatDateDT, IEventBookingContext} from '@/utils.ts';
import {UniversalButton} from '@/components/Buttons/UniversalButton/UniversalButton.tsx';
import moment from 'moment';
import classNames from "classnames";
import {useEffect, useState} from "react";
import {useAtom} from "jotai/index";
import {guestCountAtom} from "@/atoms/eventBookingAtom.ts";
import {userAtom} from "@/atoms/userAtom.ts";
// import {APIGetAvailableEventTimeslots} from "@/api/events.ts";
// import {authAtom} from "@/atoms/userAtom.ts";
// import {ITimeSlot} from "@/pages/BookingPage/BookingPage.types.ts";
// import { IEventBooking, IEventDate } from '@/pages/EventsPage/EventsPage.tsx';

export const EventConfirmationOutlet = () => {
    const navigate = useNavigate();
    // const [auth] = useAtom(authAtom);
    const {name, res} = useParams();
    const [bookingInfo, setBookingInfo] =
        useOutletContext<IEventBookingContext>();
    const [hideAbout, setHideAbout] = useState(true);
    const [guestCount, setGuestCount] = useAtom(guestCountAtom);
    const [user] = useAtom(userAtom);

    // const [restaurantTimeslots, setRestaurantTimeslots] = useState<ITimeSlot[]>(
    //     []
    // );

    const incCounter = () => {
        if (guestCount !== bookingInfo.event_date?.tickets_left)
            setGuestCount((prev: number) => (prev < 9 ? prev + 1 : prev));
    };
    const decCounter = () => {
        setGuestCount((prev: number) => (prev - 1 >= 1 ? prev - 1 : prev));
    };
    const next = () => {
        if (user?.complete_onboarding) {
            setBookingInfo((prev) => ({...prev}));
            navigate(`/events/${name}/restaurant/${res}/confirm`);
        } else {
            navigate(`/onboarding/4`);
        }
    };
    // useEffect(() => {
    //     const eventId = bookingInfo.restaurant?.dates[0].id;
    //     if (!auth?.access_token || !eventId || !bookingInfo.restaurant?.id) {
    //         return;
    //     }
    //     APIGetAvailableEventTimeslots(
    //         eventId,
    //         bookingInfo.restaurant?.id,
    //         guestCount,
    //         auth.access_token
    //     )
    //         .then((res) => {
    //             setRestaurantTimeslots(res.data)
    //             console.log('timeSlots: ', res.data);
    //             setBookingInfo((prev) => ({...prev, date: res.data[0] }))
    //         })
    // }, []);

    useEffect(() => {
        setBookingInfo((prev) => ({
            ...prev,
            event_date: bookingInfo.restaurant?.dates[0],
            date: {
                start_datetime: String(bookingInfo.restaurant?.dates[0].date_start),
                end_datetime: String(bookingInfo.restaurant?.dates[0].date_end),
                is_free: true
            }
        }));
    }, []);

    return (
        <div className={css.content}>
            <div
                className={css.event_img}
                style={{
                    backgroundImage: `url(${bookingInfo.event?.image_url ? bookingInfo.event.image_url : 'https://storage.yandexcloud.net/bottec-dreamteam/event_placeholder.png'})`,
                }}
            />
            <div className={css.content_description}>
                <h2 className={css.content_description__title}>
                    {bookingInfo.event?.name}
                </h2>
                <span className={classNames(
                    css.content_description__info,
                    hideAbout ? css.trimLines : null
                )}>
                    {bookingInfo.event?.description.split(/\n|\r\n/).map((segment, index) => (
                        <>
                            {index > 0 && <br/>}
                            {segment}
                        </>
                    ))}
                </span>

                {bookingInfo.event?.description && bookingInfo.event?.description.split(/\r\n|\r|\n/).length > 4 &&
                    (
                        <div
                            className={css.trimLinesButton}
                            onClick={() => setHideAbout((prev) => !prev)}
                        >
                                <span className={css.text}>
                                    {hideAbout ? 'Читать больше' : 'Скрыть'}
                                </span>
                        </div>
                    )
                }
            </div>
            <div className={css.event_params}>
                <div className={css.event_params_row}>
                    <div className={css.event_params_col}>
                        <span className={css.event_params_col__title}>
                            Дата
                        </span>
                        <span className={css.event_params_col__data}>
                            {bookingInfo.event_date && formatDateDT(
                                new Date(bookingInfo.event_date.date_start)
                            )}
                        </span>
                    </div>
                    <div className={css.event_params_col}>
                        <span className={css.event_params_col__title}>
                            Время
                        </span>
                        <span className={css.event_params_col__data}>
                            {moment(
                                bookingInfo.event_date?.date_start
                            ).format('HH:mm')}
                        </span>
                    </div>
                    <div className={css.event_params_col}>
                        <span className={css.event_params_col__title}>
                            Цена
                        </span>
                        <span className={css.event_params_col__data}>
                            {bookingInfo.event?.ticket_price} ₽
                        </span>
                    </div>
                </div>
                <div className={css.event_params_row}>
                    <div className={css.event_params_col}>
                        <span className={css.event_params_col__title}>
                            Осталось мест
                        </span>
                        <span className={css.event_params_col__data}>
                            {bookingInfo.event_date?.tickets_left}
                        </span>
                    </div>
                    <div className={css.event_params_col}>
                        <div className={css.roundedText}>
                            <span>✓ 100% предоплата</span>
                        </div>
                    </div>
                </div>
                {/*<div className={css.event_params_row}>*/}
                {/*    <div className={css.event_params_col}>*/}
                {/*        <span className={css.event_params_col__title}>*/}
                {/*            Ресторан*/}
                {/*        </span>*/}
                {/*        <span className={css.event_params_col__data}>*/}
                {/*            {bookingInfo.restaurant?.title}*/}
                {/*        </span>*/}
                {/*    </div>*/}
                {/*</div>*/}
                {/*<div className={css.event_params_row}>*/}
                {/*    <div className={css.event_params_col}>*/}
                {/*        <span className={css.event_params_col__title}>*/}
                {/*            Адрес*/}
                {/*        </span>*/}
                {/*        <span className={css.event_params_col__data}>*/}
                {/*            {bookingInfo.restaurant?.address}*/}
                {/*        </span>*/}
                {/*    </div>*/}
                {/*</div>*/}
                <div className={css.personsContainer}>
                    <span className={css.personsContainer__title}>
                        Количество мест
                    </span>
                    <div className={css.personCounter}>
                        <span className={css.clickableSpan} onClick={decCounter}>
                            -
                        </span>
                        <span>{guestCount}</span>
                        <span className={css.clickableSpan} onClick={incCounter}>
                        +
                        </span>
                    </div>
                </div>
            </div>
            <div className={css.absoluteBottom}>
                <div className={css.bottomWrapper}>
                    <UniversalButton
                        width={'full'}
                        title={'Купить билет'}
                        theme={'red'}
                        action={() => next()}
                    />
                </div>
            </div>
        </div>
    );
};
