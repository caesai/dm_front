import { Page } from '@/components/Page.tsx';
import css from './EventsPage.module.css';
import { RoundedButton } from '@/components/RoundedButton/RoundedButton.tsx';
import { BackIcon } from '@/components/Icons/BackIcon.tsx';
import { Outlet, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { ITimeSlot } from '@/pages/BookingPage/BookingPage.types.ts';
import { useAtom } from 'jotai/index';
import { eventsListAtom } from '@/atoms/eventBookingAtom.ts';
import { APIGetEvents } from '@/api/events.ts';
import { Share } from '@/components/Icons/Share.tsx';
import { BASE_BOT } from '@/api/base.ts';

// import {Toast} from "@/components/Toast/Toast.tsx";

export interface IEventBooking {
    event?: IEvent;
    restaurant?: IEventRestaurant;
    date?: ITimeSlot;
    event_date?: IEventDate;
    time?: string;
    guestCount?: number;
}

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

export const EventsPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [params] = useSearchParams();

    const [events, setEvents] = useAtom<IEvent[]>(eventsListAtom);
    const [bookingInfo, setBookingInfo] = useState<IEventBooking>({});

    useEffect(() => {
        APIGetEvents().then((res) => {
            setEvents(res.data);
        });
    }, []);

    useEffect(() => {
        const pathSegments = location.pathname.split('/');
        if (pathSegments[2] !== undefined) {
            console.log('params.get(\'shared\'): ');

            if (events === undefined) return;
            const event = events.find(item => item.restaurants[0].dates[0].id === Number(pathSegments[2]));
            if (event !== undefined) {
                setBookingInfo((prev) => ({
                    ...prev,
                    event: event,
                    event_date: event?.restaurants[0].dates[0],
                    restaurantId: String(event?.restaurants[0].id),
                    restaurant: event?.restaurants[0],
                    date: {
                        start_datetime: String(event?.restaurants[0].dates[0].date_start),
                        end_datetime: String(event?.restaurants[0].dates[0].date_end),
                        is_free: true,
                    },
                }));
            }
        }
    }, [location.pathname, events]);

    const isRestaurantsPage = useMemo(() => {
        return location.pathname.split('/').at(-1) === 'restaurant';
    }, [location.pathname]);

    const eventURL = useMemo(() => {
        return location.pathname.split('/')[2];
    }, [location.pathname]);

    const shareEvent = () => {
        navigator.share({
            title: bookingInfo.event?.name,
            url: `https://t.me/${BASE_BOT}?startapp=eventId_${bookingInfo.event?.restaurants[0].dates[0].id}`,
        }).then().catch((err) => {
            alert(JSON.stringify(err));
        });
    };

    useEffect(() => {
        console.log('bookingInfo: ', bookingInfo);
    }, [bookingInfo]);

    const goBack = () => {
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
                <Outlet context={[bookingInfo, setBookingInfo]} />
            </div>
        </Page>
    );
};
