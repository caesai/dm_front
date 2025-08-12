import {Page} from '@/components/Page.tsx';
import css from './EventsPage.module.css';
import {RoundedButton} from '@/components/RoundedButton/RoundedButton.tsx';
import {BackIcon} from '@/components/Icons/BackIcon.tsx';
import {
    Outlet,
    useLocation, useNavigate,
} from 'react-router-dom';
import {useEffect, useMemo, useState} from 'react';
import {ITimeSlot} from '@/pages/BookingPage/BookingPage.types.ts';
import {useAtom} from 'jotai/index';
import {eventsListAtom} from '@/atoms/eventBookingAtom.ts';
import {APIGetEvents} from '@/api/events.ts';
import {Share} from "@/components/Icons/Share.tsx";
import {getDataFromLocalStorage, removeDataFromLocalStorage} from "@/utils.ts";
import {BASE_BOT} from "@/api/base.ts";

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

    const [, setEvents] = useAtom<IEvent[]>(eventsListAtom);
    const [bookingInfo, setBookingInfo] = useState<IEventBooking>({});

    useEffect(() => {
        console.log('wtf')
        APIGetEvents().then((res) => {
            const sharedEvent = getDataFromLocalStorage('sharedEvent');
            if (sharedEvent) {
                const eventState = res.data.filter((ev) => {
                    return ev.name === JSON.parse(sharedEvent).eventName;
                })
                console.log('sharedEvent: ', eventState);
                setBookingInfo((prev) => ({
                    ...prev,
                    event: eventState[0],
                    event_date: eventState[0]?.restaurants[0].dates[0],
                    restaurantId: String(eventState[0]?.restaurants[0].id),
                    restaurant: eventState[0]?.restaurants[0],
                    date: {
                        start_datetime: String(eventState[0]?.restaurants[0].dates[0].date_start),
                        end_datetime: String(eventState[0]?.restaurants[0].dates[0].date_end),
                        is_free: true
                    }
                }));
            } else {
                setEvents(res.data);
            }
        });
    }, []);

    const isRestaurantsPage = useMemo(() => {
        return location.pathname.split('/').at(-1) === 'restaurant';
    }, [location.pathname]);

    const eventURL = useMemo(() => {
        return location.pathname.split('/')[2];
    }, [location.pathname]);

    const shareEvent = () => {
        navigator.share({
            title: bookingInfo.event?.name,
            url: `https://t.me/${BASE_BOT}?startapp=eventId_${bookingInfo.restaurant?.dates[0].id}`,
        }).then().catch((err) => {
            alert(JSON.stringify(err));
        });
    };

    useEffect(() => {
        console.log('bookingInfo: ', bookingInfo);
    }, [bookingInfo]);

    return (
        <Page back={true}>
            <div className={css.page}>
                <div className={css.header}>
                    <RoundedButton
                        bgColor={'var(--primary-background)'}
                        icon={<BackIcon color={'var(--dark-grey)'}/>}
                        action={() => {
                            const sharedEvent = getDataFromLocalStorage('sharedEvent');
                            if ( sharedEvent ) {
                                removeDataFromLocalStorage('sharedEvent');
                                navigate('/');
                            } else {
                                navigate(-1);
                            }
                        }}
                    />
                    <span className={css.header_title}>
                        {isRestaurantsPage ? 'Выберите ресторан' : 'Мероприятия'}
                    </span>
                    <div className={css.header_spacer}>
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
                <Outlet context={[bookingInfo, setBookingInfo]}/>
            </div>
        </Page>
    );
};
