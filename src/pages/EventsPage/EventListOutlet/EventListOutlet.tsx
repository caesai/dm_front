import React from 'react';
import css from '@/pages/EventsPage/EventsPage.module.css';
import { EventCard } from '@/components/EventCard/EventCard.tsx';
import { useNavigate } from 'react-router-dom';
// import { IEvent } from '@/pages/EventsPage/EventsPage.tsx';
import { useAtom } from 'jotai';
import { eventsListAtom } from '@/atoms/eventBookingAtom.ts';
import { IEventInRestaurant } from '@/types/events.ts';

export const EventListOutlet: React.FC = () => {
    const navigate = useNavigate();
    const [events] = useAtom<IEventInRestaurant[]>(eventsListAtom);
    const next = (event: IEventInRestaurant) => {
        navigate(`/events/${event.id}`)
    };
    return (
        <div className={css.cards}>
            {events
                .sort(function(a, b) {
                    const aDate = new Date(a.date_start);
                    const bDate = new Date(b.date_start);
                    return aDate.getTime() - bDate.getTime();
                })
                // .filter((event) =>{
                //     return new Date().getTime() <= new Date(event.date_start).getTime();
                // })
                .map((event) => (
                    <EventCard
                        key={event.name}
                        onClick={() => next(event)}
                        event_price={event.ticket_price}
                        event_name={event.name}
                        event_desc={event.description}
                        event_img={event.image_url}
                        event_address={event.restaurant.address}
                        event_date={event.date_start}
                        event_restaurant={event.restaurant.title}
                        sold={event.tickets_left === 0}
                    />
                ))
            }
        </div>
    );
};
