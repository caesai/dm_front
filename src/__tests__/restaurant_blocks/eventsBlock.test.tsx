import { render, screen, fireEvent } from '@testing-library/react';
import { EventsBlock } from '@/pages/Restaurant/blocks/EventsBlock.tsx';
import { useNavigate } from 'react-router-dom';

jest.mock('react-router-dom', () => ({
    useNavigate: jest.fn(),
}));

jest.mock('@/components/EventCard/EventCard', () => ({
    EventCard: ({ onClick, event_name, event_price, event_restaurant, event_date, event_address, sold }: any) => (
        <div data-testid="event-card" onClick={onClick}>
            <div>{event_name}</div>
            <div>{event_price} ₽</div>
            <div>{event_restaurant}</div>
            <div>{event_date}</div>
            <div>{event_address}</div>
            <div>{sold ? 'Sold Out' : 'Available'}</div>
        </div>
    ),
}));

const mockEvents = [
    {
        id: 1,
        description: 'test description',
        name: 'Test Event 1',
        ticket_price: 1000,
        image_url: 'event1.jpg',
        restaurant: {
            id: 1,
            title: 'Test Restaurant 1',
            address: 'Test Address 1',
            thumbnail_photo: 'restaurant1.png'
        },
        date_start: '2024-01-01',
        date_end: '2024-01-24',
        tickets_left: 10
    },
    {
        id: 2,
        description: 'test description',
        name: 'Test Event 2',
        ticket_price: 0,
        image_url: 'event2.jpg',
        restaurant: {
            id: 2,
            title: 'Test Restaurant 2',
            address: 'Test Address 2',
            thumbnail_photo: 'restaurant2.png'
        },
        date_start: '2024-01-02',
        date_end: '2024-01-24',
        tickets_left: 0
    }
];

describe('EventsBlock', () => {
    const mockNavigate = jest.fn();

    beforeEach(() => {
        (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('renders nothing when no events provided', () => {
        const { container } = render(<EventsBlock events={null} />);
        expect(container.firstChild).toBeNull();
    });

    it('renders nothing when events array is empty', () => {
        const { container } = render(<EventsBlock events={[]} />);
        expect(container.firstChild).toBeNull();
    });

    it('renders events block with title and event cards', () => {
        render(<EventsBlock events={mockEvents} />);

        expect(screen.getByText('Мероприятия')).toBeInTheDocument();
        expect(screen.getByText('Test Event 1')).toBeInTheDocument();
        expect(screen.getByText('Test Event 2')).toBeInTheDocument();
        expect(screen.getByText('1000 ₽')).toBeInTheDocument();
        expect(screen.getByText('Test Restaurant 1')).toBeInTheDocument();
        expect(screen.getByText('Test Address 1')).toBeInTheDocument();
    });

    it('navigates to event page when event card is clicked', () => {
        render(<EventsBlock events={mockEvents} />);

        const eventCards = screen.getAllByTestId('event-card');
        fireEvent.click(eventCards[0]);

        expect(mockNavigate).toHaveBeenCalledWith('/events/1');
    });

    it('shows sold out status for events with no tickets left', () => {
        render(<EventsBlock events={mockEvents} />);

        expect(screen.getByText('Sold Out')).toBeInTheDocument();
        expect(screen.getByText('Available')).toBeInTheDocument();
    });
});