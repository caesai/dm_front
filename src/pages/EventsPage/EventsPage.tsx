import { Page } from '@/components/Page.tsx';
import css from './EventsPage.module.css';
import { RoundedButton } from '@/components/RoundedButton/RoundedButton.tsx';
import { BackIcon } from '@/components/Icons/BackIcon.tsx';
import {
    Outlet,
    useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { ITimeSlot } from '@/pages/BookingPage/BookingPage.types.ts';
import { useAtom } from 'jotai/index';
import { eventsListAtom } from '@/atoms/eventBookingAtom.ts';
import { APIGetEvents } from '@/api/events.ts';
import {Share} from "@/components/Icons/Share.tsx";
import {Toast} from "@/components/Toast/Toast.tsx";

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

    const [events, setEvents] = useAtom<IEvent[]>(eventsListAtom);
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [toastShow, setToastShow] = useState<boolean>(false);

    useEffect(() => {
        APIGetEvents().then((res) => setEvents(res.data));
    }, []);

    const isRestaurantsPage = useMemo(() => {
        return location.pathname.split('/').at(-1) === 'restaurant';
    }, [location.pathname]);
    const [bookingInfo,
        setBookingInfo
    ] = useState<IEventBooking>({});

    const eventURL = useMemo(() => {
        return location.pathname.split('/')[2];
    }, [location.pathname]);

    const shareEvent = () => {
        navigator.clipboard.writeText(`https://t.me/dmdev1bot?start=event_${bookingInfo.restaurant?.dates[0].id}`);
        setToastShow(true);
        setToastMessage('Ссылка скопирована')
        setTimeout(function(){ setToastShow(false); setToastMessage(null);}, 3000);
    };

    console.log('events: ', events)

    useEffect(() => {
        console.log('bookingInfo: ', bookingInfo);
    }, [bookingInfo]);

    return (
        <Page back={true}>
            <div className={css.page}>
                <div className={css.header}>
                    <RoundedButton
                        bgColor={'var(--primary-background)'}
                        icon={<BackIcon color={'var(--dark-grey)'} />}
                        action={() => navigate(-1)}
                    />
                    <span className={css.header_title}>
                        {isRestaurantsPage ? 'Выберите ресторан' : 'Мероприятия'}
                    </span>
                    <div className={css.header_spacer} >
                        {eventURL ? (
                            <RoundedButton
                                icon={
                                    <Share color={'var(--dark-grey)'}/>
                                }
                                action={() => shareEvent()}
                            />
                        ) : null}
                    </div>
                </div>
                <Outlet context={[bookingInfo, setBookingInfo]} />
                <Toast message={toastMessage} showClose={toastShow} />

                {/*<p className={css.span_title}>Пока нет мероприятий</p>*/}
            </div>
        </Page>
    );
};
