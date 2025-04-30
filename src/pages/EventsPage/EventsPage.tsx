import { Page } from '@/components/Page.tsx';
import css from './EventsPage.module.css';
import { RoundedButton } from '@/components/RoundedButton/RoundedButton.tsx';
import { BackIcon } from '@/components/Icons/BackIcon.tsx';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { ITimeSlot } from '@/pages/BookingPage/BookingPage.types.ts';
import { useAtom } from 'jotai/index';
import { eventsListAtom } from '@/atoms/eventBookingAtom.ts';
import { APIGetEvents } from '@/api/events.ts';

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

    const [, setEvents] = useAtom<IEvent[]>(eventsListAtom);

    useEffect(() => {
        APIGetEvents().then((res) => setEvents(res.data));
    }, []);

    const isRestaurantsPage = useMemo(() => {
        return location.pathname.split('/').at(-1) === 'restaurant';
    }, [location.pathname]);
    const [bookingInfo, setBookingInfo] = useState<IEventBooking>({});

    useEffect(() => {
        console.log(bookingInfo);
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
                        {isRestaurantsPage ? 'Рестораны' : 'Мероприятия'}
                    </span>
                    <div className={css.header_spacer} />
                </div>
                <Outlet context={[bookingInfo, setBookingInfo]} />
            </div>
        </Page>
    );
};
