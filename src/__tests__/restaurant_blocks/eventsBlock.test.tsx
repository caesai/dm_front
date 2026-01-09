import { render, screen, fireEvent } from '@testing-library/react';
import { useNavigate } from 'react-router-dom';
import { EventsBlock } from '@/pages/RestaurantPage/blocks/EventsBlock.tsx';

jest.mock('react-router-dom', () => ({
    useNavigate: jest.fn(),
}));

describe('EventsBlock', () => {
    const mockNavigate = jest.fn();

    beforeEach(() => {
        (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('renders nothing when no events provided', () => {
        const { container } = render(<EventsBlock restaurantId={String(1)} />);
        expect(container.firstChild).toBeNull();
    });

    it('renders nothing when events array is empty', () => {
        const { container } = render(<EventsBlock restaurantId={String(1)} />);
        expect(container.firstChild).toBeNull();
    });

    it('рендерит блок мероприятий с заголовком и карточками мероприятий', () => {
        render(<EventsBlock restaurantId={String(1)} />);

        expect(screen.getByText(/Мероприятия/i)).toBeInTheDocument();
        expect(screen.getByText(/Test Event 1/i)).toBeInTheDocument();
        expect(screen.getByText(/Test Event 2/i)).toBeInTheDocument();
        expect(screen.getByText(/1000 ₽/i)).toBeInTheDocument();
        expect(screen.getByText(/Test Restaurant 1/i)).toBeInTheDocument();
        expect(screen.getByText(/Test Address 1/i)).toBeInTheDocument();
    });

    it('navigates to event page when event card is clicked', () => {
        render(<EventsBlock restaurantId={String(1)} />);

        const eventCards = screen.getAllByTestId('event-card');
        fireEvent.click(eventCards[0]);

        expect(mockNavigate).toHaveBeenCalledWith('/events/1/details');
    });

    // it('shows sold out status for events with no tickets left', () => {
    //     render(<EventsBlock events={mockEvents} />);

    //     expect(screen.getByText('Sold Out')).toBeInTheDocument();
    //     // expect(screen.getByText('Available')).toBeInTheDocument();
    // });
});