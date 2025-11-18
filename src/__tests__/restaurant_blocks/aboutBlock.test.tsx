import { render, screen, fireEvent } from '@testing-library/react';
import { AboutBlock } from '@/pages/Restaurant/blocks/AboutBlock.tsx';

jest.mock('@/utils', () => ({
    getCurrentTimeShort: () => '12:00',
    getCurrentWeekdayShort: () => '1',
    getRestaurantStatus: () => 'Открыто'
}));

jest.mock('react-collapse', () => ({
    UnmountClosed: ({ children, isOpened }: any) =>
        isOpened ? <div data-testid="collapse-open">{children}</div> : null
}));

jest.mock('@/components/Icons/DownArrow', () => ({
    DownArrow: () => <div data-testid="down-arrow">↓</div>
}));

const mockProps = {
    about_text: 'Test restaurant description text',
    workTime: [
        { weekday: '1', time_start: '10:00', time_end: '22:00' },
        { weekday: '2', time_start: '10:00', time_end: '22:00' }
    ],
    about_kitchen: 'Kitchen',
    about_dishes: 'Dishes',
    about_features: 'Features test',
    avg_cheque: '1500'
};

describe('AboutBlock', () => {
    it('renders about block with title', () => {
        render(<AboutBlock {...mockProps} />);

        expect(screen.getByText('О месте')).toBeInTheDocument();
        expect(screen.getByText('Читать больше')).toBeInTheDocument();
    });

    it('displays restaurant details', () => {
        render(<AboutBlock {...mockProps} />);

        expect(screen.getByText('Кухня:')).toBeInTheDocument();
        expect(screen.getByText('Kitchen, Dishes')).toBeInTheDocument();
        expect(screen.getByText('Особенности:')).toBeInTheDocument();
        expect(screen.getByText('Features test')).toBeInTheDocument();
        expect(screen.getByText('Средний чек:')).toBeInTheDocument();
        expect(screen.getByText('1500 ₽')).toBeInTheDocument();
    });

    it('shows restaurant status and schedule button', () => {
        render(<AboutBlock {...mockProps} />);

        expect(screen.getByText('Открыто')).toBeInTheDocument();
        expect(screen.getByText('График')).toBeInTheDocument();
    });

    it('toggles about text when read more button is clicked', () => {
        render(<AboutBlock {...mockProps} />);

        fireEvent.click(screen.getByText('Читать больше'));

        expect(screen.getByText('Скрыть')).toBeInTheDocument();
    });

    it('toggles work hours when schedule button is clicked', () => {
        render(<AboutBlock {...mockProps} />);

        fireEvent.click(screen.getByText('График'));

        expect(screen.getByTestId('collapse-open')).toBeInTheDocument();
    });

    it('renders without work time', () => {
        render(<AboutBlock {...mockProps} workTime={undefined} />);

        expect(screen.getByText('О месте')).toBeInTheDocument();
        expect(screen.getByText('Кухня:')).toBeInTheDocument();
    });

    it('handles empty kitchen and dishes info', () => {
        const propsWithEmptyKitchen = {
            ...mockProps,
            about_kitchen: '',
            about_dishes: ''
        };

        render(<AboutBlock {...propsWithEmptyKitchen} />);

        expect(screen.getByText('Кухня:')).toBeInTheDocument();
    });

    it('displays work hours when expanded', () => {
        render(<AboutBlock {...mockProps} />);

        fireEvent.click(screen.getByText('График'));

        const collapseContent = screen.getByTestId('collapse-open');
        expect(collapseContent).toBeInTheDocument();
    });
});