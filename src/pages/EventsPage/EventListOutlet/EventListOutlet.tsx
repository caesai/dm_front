import css from '@/pages/EventsPage/EventsPage.module.css';
import { EventCard } from '@/components/EventCard/EventCard.tsx';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { IEventBookingContext } from '@/utils.ts';
import { IEvent } from '@/pages/EventsPage/EventsPage.tsx';
import { useAtom } from 'jotai';
import { eventsListAtom } from '@/atoms/eventBookingAtom.ts';

export const EventListOutlet = () => {
    const navigate = useNavigate();
    const [, setBookingInfo] = useOutletContext<IEventBookingContext>();
    const [events] = useAtom<IEvent[]>(eventsListAtom);

    const next = (event: IEvent) => {
        // setBookingInfo((prev) => ({ ...prev, event: event }));
        // navigate(`/events/${event.name}`);
        setBookingInfo((p) => ({
            ...p,
            event: event,
            restaurantId: String(event?.restaurants[0].id),
            restaurant: event?.restaurants[0],
        }));
        navigate(`/events/${event.name}/restaurant/${event?.restaurants[0].id}/guests`)
    };

    return (
        <div className={css.cards}>
            {events.sort(function(a, b) {
                const aDate = new Date(a.restaurants[0].dates[0].date_start);
                const bDate = new Date(b.restaurants[0].dates[0].date_start);
                return aDate.getTime() - bDate.getTime();
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
                />
            ))}
        </div>
    );
};
