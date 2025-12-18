import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAtom } from 'jotai';
// Types
import { IEvent } from '@/types/events.types';
// Components
import { EventCard } from '@/components/EventCard/EventCard.tsx';
// Styles
import css from '@/pages/EventsPage/EventsPage.module.css';
// Atoms
import { eventsListAtom } from '@/atoms/eventListAtom.ts';

export const EventsListPage: React.FC = () => {
    const navigate = useNavigate();
    const [events] = useAtom<IEvent[]>(eventsListAtom);

    const next = (id: number) => {
        navigate(`/events/${id}/details`);
    };

    return (
        <div className={css.cards}>
            {events.filter((event) => event.tickets_left > 0)
                .map((event) => (
                    <EventCard key={event.name} {...event} onClick={next} />
                ))}
            {!events.filter((event) => event.tickets_left > 0).length && (
                <span className={css.header_title}>Мероприятий пока нет</span>
            )}
        </div>
    );
};
