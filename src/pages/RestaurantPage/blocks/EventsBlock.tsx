import React, { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
// Types
import { IEvent } from '@/types/events.types.ts';
// Components
import { ContentContainer } from '@/components/ContentContainer/ContentContainer.tsx';
import { ContentBlock } from '@/components/ContentBlock/ContentBlock.tsx';
import { HeaderContainer } from '@/components/ContentBlock/HeaderContainer/HeaderContainer.tsx';
import { HeaderContent } from '@/components/ContentBlock/HeaderContainer/HeaderContent/HeaderContainer.tsx';
import { EventCard } from '@/components/EventCard/EventCard.tsx';
import { useRestaurantPageData } from '@/hooks/useRestaurantPageData.ts';

/**
 * Пропсы компонента EventsBlock.
 *
 * @interface IEventsBlockProps
 */
interface IEventsBlockProps {
    /**
     * ID ресторана.
     */
    restaurantId: string;
}

/**
 * Компонент для отображения списка мероприятий.
 *
 * @component
 * @example
 * <EventsBlock restaurantId="1" />
 */
export const EventsBlock: React.FC<IEventsBlockProps> = ({ restaurantId }): JSX.Element => {
    /**
     * События.
     */
    const { events } = useRestaurantPageData({ restaurantId });
    /**
     * Навигация.
     */
    const navigate = useNavigate();

    /**
     * Фильтрует события без билетов
     * @returns {IEvent[] | undefined} Отфильтрованный список событий
     */
    const getFilteredEvents = (): IEvent[] | undefined => {
        if (!events) return undefined;

        return events.filter((event) => {
            return event.tickets_left > 0;
        });
    };
    const filteredEvents = useMemo(() => getFilteredEvents(), [events]);

    /**
     * Обрабатывает клик по карточке мероприятия для навигации на страницу деталей мероприятия
     * @param {number} eventId - ID мероприятия для навигации
     */
    const handleEventClick = useCallback((eventId: number) => {
        navigate(`/events/${eventId}/details`);
    }, [navigate]);

    if (!filteredEvents || filteredEvents.length === 0) {
        return <></> as JSX.Element;
    }

    return (
        <ContentContainer>
            <ContentBlock>
                <HeaderContainer>
                    <HeaderContent title="Мероприятия" id="events" />
                </HeaderContainer>
                {filteredEvents?.map((event) => (
                    <EventCard key={event.id} onClick={handleEventClick} {...event} />
                ))}
            </ContentBlock>
        </ContentContainer>
    );
};
