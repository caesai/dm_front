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
        setBookingInfo((prev) => ({ ...prev, event: event }));
        navigate(`/events/${event.name}`);
    };

    return (
        <div className={css.cards}>
            {events.map((event) => (
                <EventCard
                    key={event.name}
                    onClick={() => next(event)}
                    event_price={event.ticket_price}
                    event_name={event.name}
                    event_desc={event.description}
                    event_img={event.image_url}
                />
            ))}
        </div>
    );
};
