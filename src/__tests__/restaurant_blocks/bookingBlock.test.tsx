import { render, screen, fireEvent } from '@testing-library/react';
import { BookingBlock } from '@/pages/Restaurant/blocks/BookingsBlock.tsx';
import { useAtom } from 'jotai';

jest.mock('jotai', () => ({
    useAtom: jest.fn(),
    atom: jest.fn((initialValue) => initialValue),
}));

jest.mock('swiper/react', () => ({
    Swiper: ({ children, ...props }: any) => (
        <div data-testid="swiper" {...props}>
            {children}
        </div>
    ),
    SwiperSlide: ({ children, ...props }: any) => (
        <div data-testid="swiper-slide" {...props}>
            {children}
        </div>
    ),
}));

jest.mock('swiper/modules', () => ({
    FreeMode: jest.fn(),
}));

jest.mock('@/components/DateListSelector/DateListSelector', () => ({
    DateListSelector: ({ isOpen }: any) =>
        isOpen ? <div data-testid="date-selector">Date Selector Open</div> : null
}));

jest.mock('@/components/RestaurantNavigation/RestaurantNavigation', () => ({
    RestaurantNavigation: () => (
        <div data-testid="restaurant-navigation">
            Navigation
        </div>
    ),
}));

jest.mock('@/components/PlaceholderBlock/PlaceholderBlock', () => ({
    PlaceholderBlock: ({ width, height, rounded }: any) => (
        <div
            data-testid="placeholder-block"
            style={{ width, height, borderRadius: rounded }}
        >
            Loading...
        </div>
    ),
}));

jest.mock('@/atoms/bookingInfoAtom', () => ({
    guestCountAtom: 'mock-guest-count',
}));

jest.mock('@/utils', () => ({
    formatDateAlt: (date: string) => `Formatted: ${date}`,
    getTimeShort: (datetime: string) => {
        const time = datetime.split('T')[1].substring(0, 5);
        return time;
    },
}));

const mockProps = {
    currentSelectedTime: null,
    workTime: [{ weekday: '1', time_start: '11:00', time_end: '23:00' }],
    bookingDate: { value: '2024-01-01', title: '1 января' },
    bookingDates: [
        { value: '2024-01-01', title: '1 января' },
        { value: '2024-01-02', title: '2 января' }
    ],
    setBookingDate: jest.fn(),
    timeslotLoading: false,
    availableTimeslots: [
        { start_datetime: '2024-01-01T18:00:00', end_datetime: '2024-01-01T20:00:00', is_free: true },
        { start_datetime: '2024-01-01T20:00:00', end_datetime: '2024-01-01T22:00:00', is_free: false }
    ],
    setCurrentSelectedTime: jest.fn(),
    isShow: true,
    isEvents: true,
    isNavigationLoading: false
};

describe('BookingBlock', () => {
    beforeEach(() => {
        (useAtom as jest.Mock).mockReturnValue([{ title: '1 гость', value: '1' }, jest.fn()]);
    });

    it('renders component without errors', () => {
        render(<BookingBlock {...mockProps} />);
        expect(screen.getByText(/Formatted: 2024-01-01/)).toBeInTheDocument();
    });

    it('displays timeslots when not loading', () => {
        render(<BookingBlock {...mockProps} />);
        expect(screen.getByText('18:00')).toBeInTheDocument();
        expect(screen.getByText('20:00')).toBeInTheDocument();
    });

    it('shows placeholders when timeslots are loading', () => {
        render(<BookingBlock {...mockProps} timeslotLoading={true} />);
        const placeholders = screen.getAllByTestId('placeholder-block');
        expect(placeholders.length).toBeGreaterThan(0);
    });

    it('opens date selector when date is clicked', () => {
        render(<BookingBlock {...mockProps} />);

        fireEvent.click(screen.getByText(/Formatted: 2024-01-01/));

        expect(screen.getByTestId('date-selector')).toBeInTheDocument();
    });

    it('selects timeslot when clicked', () => {
        render(<BookingBlock {...mockProps} />);

        fireEvent.click(screen.getByText('18:00'));

        expect(mockProps.setCurrentSelectedTime).toHaveBeenCalledWith(
            mockProps.availableTimeslots[0]
        );
    });

    it('renders navigation component', () => {
        render(<BookingBlock {...mockProps} />);
        expect(screen.getByTestId('restaurant-navigation')).toBeInTheDocument();
    });
});