import { render, screen, fireEvent } from '@testing-library/react';
import { ChefBlock } from '@/pages/RestaurantPage/blocks/ChefBlock.tsx';

describe('ChefBlock', () => {
    it('renders chef block with title and chef name', () => {
        render(<ChefBlock restaurantId={String(1)} />);

        expect(screen.getByText('О шефе')).toBeInTheDocument();
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Бренд-шеф')).toBeInTheDocument();
    });

    it('shows read more button for long text', () => {
        render(<ChefBlock restaurantId={String(1)} />);

        expect(screen.getByText('Читать больше')).toBeInTheDocument();
    });

    it('toggles text when read more button is clicked', () => {
        render(<ChefBlock restaurantId={String(1)} />);

        fireEvent.click(screen.getByText('Читать больше'));

        expect(screen.getByText('Скрыть')).toBeInTheDocument();
    });

    it('displays chef photo', () => {
        render(<ChefBlock restaurantId={String(1)} />);

        const photo = document.querySelector('[style*="background-image"]');
        expect(photo).toBeInTheDocument();
    });

    it('handles keyboard navigation', () => {
        render(<ChefBlock restaurantId={String(1)} />);

        const readMoreButton = screen.getByText('Читать больше');

        fireEvent.keyDown(readMoreButton, { key: 'Enter' });

        expect(screen.getByText('Скрыть')).toBeInTheDocument();
    });
});