import { render, screen, fireEvent } from '@testing-library/react';
import { GastronomyBlock } from '@/pages/Restaurant/blocks/GastronomyBlock.tsx';
import { useNavigate } from 'react-router-dom';

jest.mock('react-router-dom', () => ({
    useNavigate: jest.fn(),
}));

jest.mock('@/components/Buttons/UniversalButton/UniversalButton', () => ({
    UniversalButton: ({ title, action, theme }: any) => (
        <button onClick={action} data-testid="universal-button" data-theme={theme}>
            {title}
        </button>
    ),
}));

const mockProps = {
    image: 'gastronomy-image.jpg',
    description: 'New Year culinary delights description'
};

describe('GastronomyBlock', () => {
    const mockNavigate = jest.fn();

    beforeEach(() => {
        (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('renders gastronomy block with title and description', () => {
        render(<GastronomyBlock {...mockProps} />);

        expect(screen.getByText('Новогодняя кулинария')).toBeInTheDocument();
        expect(screen.getByText('New Year culinary delights description')).toBeInTheDocument();
        expect(screen.getByText('Сделать предзаказ')).toBeInTheDocument();
    });

    it('navigates to gastronomy page when button is clicked', () => {
        render(<GastronomyBlock {...mockProps} />);

        fireEvent.click(screen.getByText('Сделать предзаказ'));

        expect(mockNavigate).toHaveBeenCalledWith('/gastronomy/choose');
    });

    it('displays gastronomy image', () => {
        render(<GastronomyBlock {...mockProps} />);

        const image = document.querySelector('[style*="background-image"]');
        expect(image).toBeInTheDocument();
    });
});