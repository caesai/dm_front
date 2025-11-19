import { IEventInRestaurant } from '@/types/events.ts';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ContentContainer } from '@/components/ContentContainer/ContentContainer.tsx';
import { ContentBlock } from '@/components/ContentBlock/ContentBlock.tsx';
import { HeaderContainer } from '@/components/ContentBlock/HeaderContainer/HeaderContainer.tsx';
import { HeaderContent } from '@/components/ContentBlock/HeaderContainer/HeaderContent/HeaderContainer.tsx';
import { EventCard } from '@/components/EventCard/EventCard.tsx';

interface EventsBlockProps {
    events: IEventInRestaurant[] | null;
}

export const EventsBlock: React.FC<EventsBlockProps> = ({ events }) => {
    const navigate = useNavigate();

    /**
     * Обрабатывает клик по карточке события для навигации на страницу события
     * @param {number} eventId - ID события для навигации
     */
    const handleEventClick = (eventId: number) => {
        navigate(`/events/${eventId}`);
    };

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
                    <EventCard
                        key={event.id}
                        onClick={() => handleEventClick(event.id)}
                        event_price={event.ticket_price}
                        event_name={event.name}
                        event_img={event.image_url}
                        event_restaurant={event.restaurant.title}
                        event_date={event.date_start}
                        event_address={event.restaurant.address}
                        sold={event.tickets_left === 0}
                    />
                ))}
            </ContentBlock>
        </ContentContainer>
    );
};