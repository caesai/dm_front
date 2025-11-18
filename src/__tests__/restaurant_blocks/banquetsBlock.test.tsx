import { render, screen, fireEvent } from '@testing-library/react';
import { BanquetsBlock } from '@/pages/Restaurant/blocks/BanquetsBlock.tsx';
import { useNavigate } from 'react-router-dom';

jest.mock('react-router-dom', () => ({
    useNavigate: jest.fn(),
}));

jest.mock('@/components/Buttons/UniversalButton/UniversalButton', () => ({
    UniversalButton: ({ title, action }: any) => (
        <button onClick={action} data-testid="universal-button">
            {title}
        </button>
    ),
}));

jest.mock('@/utils', () => ({
    workdayIndexMap: {
        '1': 1,
        '2': 2,
        '3': 3,
        '4': 4,
        '5': 5,
        '6': 6,
        '7': 7
    }
}));

const mockProps = {
    image: 'banquet-image.jpg',
    description: 'banquet description',
    restaurant_id: 1,
    restaurant_title: 'Test Restaurant',
    banquets: {
        additional_options: [],
        banquet_options: [],
        description: '',
        image: ''
    },
    workTime: [
        { weekday: '1', time_start: '10:00', time_end: '22:00' },
        { weekday: '2', time_start: '10:00', time_end: '22:00' }
    ]
};

describe('BanquetsBlock', () => {
    const mockNavigate = jest.fn();

    beforeEach(() => {
        (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('renders banquets block with title and description', () => {
        render(<BanquetsBlock {...mockProps} />);

        expect(screen.getByText('Банкеты')).toBeInTheDocument();
        expect(screen.getByText('banquet description')).toBeInTheDocument();
        expect(screen.getByText('Подробнее')).toBeInTheDocument();
    });

    it('navigates to banquet page when button is clicked', () => {
        render(<BanquetsBlock {...mockProps} />);

        fireEvent.click(screen.getByText('Подробнее'));

        expect(mockNavigate).toHaveBeenCalledWith('/banquets/1/choose', {
            state: {
                restaurant_title: 'Test Restaurant',
                banquets: mockProps.banquets,
                workTime: mockProps.workTime
            }
        });
    });

    it('displays banquet image', () => {
        render(<BanquetsBlock {...mockProps} />);

        const image = document.querySelector('[style*="background-image"]');
        expect(image).toBeInTheDocument();
    });

    it('renders without workTime', () => {
        render(<BanquetsBlock {...mockProps} workTime={undefined} />);

        expect(screen.getByText('Банкеты')).toBeInTheDocument();
        expect(screen.getByText('Подробнее')).toBeInTheDocument();
    });
});