import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
// Types
import { IEvent } from '@/types/events.types.ts';
// Components
import { ContentContainer } from '@/components/ContentContainer/ContentContainer.tsx';
import { ContentBlock } from '@/components/ContentBlock/ContentBlock.tsx';
import { HeaderContainer } from '@/components/ContentBlock/HeaderContainer/HeaderContainer.tsx';
import { HeaderContent } from '@/components/ContentBlock/HeaderContainer/HeaderContent/HeaderContainer.tsx';
import { EventCard } from '@/components/EventCard/EventCard.tsx';

interface EventsBlockProps {
    events: IEvent[] | null;
}

export const EventsBlock: React.FC<EventsBlockProps> = ({ events }) => {
    const navigate = useNavigate();

    /**
     * Обрабатывает клик по карточке мероприятия для навигации на страницу деталей мероприятия
     * @param {number} eventId - ID мероприятия для навигации
     */
    const handleEventClick = useCallback((eventId: number) => {
        navigate(`/events/${eventId}/details`);
    }, [navigate]);

    if (!events || events.length === 0) {
        return null;
    }

    return (
        <ContentContainer>
            <ContentBlock>
                <HeaderContainer>
                    <HeaderContent title="Мероприятия" id="events" />
                </HeaderContainer>
                {events.map((event) => (
                    <EventCard key={event.id} onClick={handleEventClick} {...event} />
                ))}
            </ContentBlock>
        </ContentContainer>
    );
};
