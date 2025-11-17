import React from 'react';
import css from '@/pages/EventsPage/EventsPage.module.css';
import { EventCard } from '@/components/EventCard/EventCard.tsx';
import { useNavigate } from 'react-router-dom';
// import { IEvent } from '@/pages/EventsPage/EventsPage.tsx';
import { useAtom } from 'jotai';
import { eventsListAtom } from '@/atoms/eventBookingAtom.ts';
import { IEventInRestaurant } from '@/types/events.ts';
import { mockEventsUsersList } from '@/__mocks__/events.mock.ts';

export const EventListOutlet: React.FC = () => {
    const navigate = useNavigate();
    const [events] = useAtom<IEventInRestaurant[]>(eventsListAtom);
    const tg_id = window.Telegram.WebApp.initDataUnsafe.user.id;

    const next = (event: IEventInRestaurant) => {
        // if (event.ticket_price == 0 && event.tickets_left == 0) {
        //     return;
        // }
        navigate(`/events/${event.id}`)
    };
    
    const filteredEvents = events.filter((event) => {
        if (tg_id && mockEventsUsersList.includes(tg_id)) {
            return event.tickets_left > 0;
        } else {
            return event.tickets_left > 0 && event.ticket_price === 0;
        }
    });
    return (
        <div className={css.cards}>
            {filteredEvents.length > 0 ? filteredEvents
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
                : <span className={css.header_title}>Мероприятий пока нет</span>
            }
        </div>
    );
};
