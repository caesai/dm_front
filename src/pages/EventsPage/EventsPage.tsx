import { Page } from '@/components/Page.tsx';
import css from './EventsPage.module.css';
import { RoundedButton } from '@/components/RoundedButton/RoundedButton.tsx';
import { BackIcon } from '@/components/Icons/BackIcon.tsx';
import { Outlet, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import React, { useEffect, useMemo, useState } from 'react';
// import { ITimeSlot } from '@/pages/BookingPage/BookingPage.types.ts';
import { useAtom } from 'jotai/index';
import { eventsListAtom, guestCountAtom } from '@/atoms/eventBookingAtom.ts';
import { APIGetEvents } from '@/api/events.ts';
import { Share } from '@/components/Icons/Share.tsx';
import { BASE_BOT } from '@/api/base.ts';
import { IEventBooking, IEventInRestaurant } from '@/types/events.ts';

// import {Toast} from "@/components/Toast/Toast.tsx";
//
// export interface IEventBooking {
//     event?: IEvent;
//     restaurant?: IEventRestaurant;
//     date?: ITimeSlot;
//     event_date?: IEventDate;
//     time?: string;
//     guestCount?: number;
// }

export interface IEvent {
    name: string;
    description: string;
    ticket_price: number;
    image_url?: string;
    restaurants: IEventRestaurant[];
}

export interface IEventRestaurant {
    id: number;
    title: string;
    address: string;
    thumbnail_photo: string;
    dates: IEventDate[];
}

export interface IEventDate {
    id: number;
    date_start: string;
    date_end: string;
    ticket_price: number;
    tickets_left: number;
}

export const EventsPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [params] = useSearchParams();

    const [events, setEvents] = useAtom<IEventInRestaurant[]>(eventsListAtom);
    const [bookingInfo, setBookingInfo] = useState<IEventBooking>({});
    const [, setGuestCount] = useAtom(guestCountAtom);

    useEffect(() => {
        APIGetEvents().then((res) => {
            setEvents(res.data);
        });
    }, []);

    useEffect(() => {
        const pathSegments = location.pathname.split('/');
        if (pathSegments[2] !== undefined) {
            if (events === undefined) return;
            console.log('pathSegments[2]: ', pathSegments[2]);
            const event = events.find(item => String(item.id) === String(pathSegments[2]));
            if (event !== undefined) {
                setBookingInfo((prev) => ({
                    ...prev,
                    event: event,
                    restaurant: event?.restaurant,
                }));
            }
        }
    }, [location.pathname, events]);

    const isRestaurantsPage = useMemo(() => {
        return location.pathname.split('/').at(-1) === 'restaurant';
    }, [location.pathname]);

    const eventURL = useMemo(() => {
        return location.pathname.split('/')[2] && !location.pathname.includes('confirm');
    }, [location.pathname]);

    const shareEvent = () => {
        const url = encodeURI(
            `https://t.me/${BASE_BOT}?startapp=eventId_${bookingInfo.event?.id}`
        );
        const title = encodeURI(String(bookingInfo.event?.name));
        const shareData = {
            title,
            url,
        }
        try {
            if (navigator && navigator.canShare(shareData)) {
                navigator.share(shareData).then().catch((err) => {
                    alert(JSON.stringify(err));
                });
            }
        } catch (e) {
            window.open(`https://t.me/share/url?url=${url}&text=${title}`, "_blank");
        }
    };

    useEffect(() => {
        console.log('bookingInfo: ', bookingInfo);
    }, [bookingInfo]);

    useEffect(() => {
        // TODO: handling error through Modal Popup
        if (params.get('paymentError')) {
            console.log('Или отмена или платеж еще не прошел');
        }
        if (params.get('error')) {
            alert('Возникла ошибка при оплате мероприятия');
        }
    }, [params]);

    const goBack = () => {
        if (eventURL) {
            setGuestCount(0);
        }
        if (Boolean(params.get('shared'))) {
            navigate('/', { replace: true });
        } else {
            navigate(-1);
        }
    };
    return (
        <Page back={true}>
            <div className={css.page}>
                <div className={css.header}>
                    <RoundedButton
                        bgColor={'var(--primary-background)'}
                        icon={<BackIcon color={'var(--dark-grey)'} />}
                        action={goBack}
                    />
                    <span className={css.header_title}>
                        {isRestaurantsPage ? 'Выберите ресторан' : 'Мероприятия'}
                    </span>
                    <div className={css.header_spacer}>
                        {eventURL ? (
                            <RoundedButton
                                icon={
                                    <Share color={'var(--dark-grey)'} />
                                }
                                action={() => shareEvent()}
                            />
                        ) : null}
                    </div>
                </div>
                {events.length === 0 ? (
                    <span className={css.header_title}>Мероприятий пока нет</span>
                ) : (
                    <Outlet context={[bookingInfo, setBookingInfo]} />
                )}
            </div>
        </Page>
    );
};
