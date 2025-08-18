import React from 'react';
import css from '@/pages/EventsPage/EventsPage.module.css';
import { EventCard } from '@/components/EventCard/EventCard.tsx';
import { useNavigate } from 'react-router-dom';
import { IEvent } from '@/pages/EventsPage/EventsPage.tsx';
import { useAtom } from 'jotai';
import { eventsListAtom } from '@/atoms/eventBookingAtom.ts';

export const EventListOutlet: React.FC = () => {
    const navigate = useNavigate();
    const [events] = useAtom<IEvent[]>(eventsListAtom);
    const next = (event: IEvent) => {
        navigate(`/events/${event.restaurants[0].dates[0].id}`)
    };
    return (
        <div className={css.cards}>
            {events.sort(function(a, b) {
                const aDate = new Date(a.restaurants[0].dates[0].date_start);
                const bDate = new Date(b.restaurants[0].dates[0].date_start);
                return aDate.getTime() - bDate.getTime();
            }).filter((event) =>{
                return new Date().getTime() <= new Date(event.restaurants[0].dates[0].date_start).getTime();
            }).map((event) => (
                <EventCard
                    key={event.name}
                    onClick={() => next(event)}
                    event_price={event.ticket_price}
                    event_name={event.name}
                    event_desc={event.description}
                    event_img={event.image_url}
                    event_address={event.restaurants[0].address}
                    event_dates={event.restaurants[0].dates}
                    event_restaurant={event.restaurants[0].title}
                    sold={event.restaurants[0].dates[0].tickets_left === 0}
                />
            ))}
        </div>
    );
};
