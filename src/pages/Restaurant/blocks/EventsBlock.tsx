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

    return (
        <ContentContainer>
            <ContentBlock>
                <HeaderContainer>
                    <HeaderContent title={'Мероприятия'} id={'events'} />
                </HeaderContainer>
                {events?.map((e) => (
                    <EventCard
                        key={e.name}
                        onClick={() => navigate(`/events/${e.id}`)}
                        event_price={e.ticket_price}
                        event_name={e.name}
                        event_img={e.image_url}
                        event_restaurant={e.restaurant.title}
                        event_date={e.date_start}
                        event_address={e.restaurant.address}
                        sold={e.tickets_left == 0}
                    />
                ))}
            </ContentBlock>
        </ContentContainer>
    );
};