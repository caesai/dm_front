import { render, screen, fireEvent } from '@testing-library/react';
import { GastronomyBlock } from '@/pages/Restaurant/blocks/GastronomyBlock.tsx';
import { useNavigate } from 'react-router-dom';
import { IRestaurant } from '@/types/restaurant.ts';

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

const mockRestaurant: IRestaurant = {
    id: 12,
    title: 'Self Edge Chinois',
    slogan: 'Современная Азия с акцентом на Китай и культовый raw bar',
    address: 'Санкт-Перербург, ул. Добролюбова, 11',
    logo_url: '',
    thumbnail_photo: 'thumbnail.jpg',
    avg_cheque: 3000,
    about_text: 'About text',
    about_dishes: 'Европейская',
    about_kitchen: 'Американская',
    about_features: 'Some features',
    phone_number: '+79999999999',
    address_lonlng: '0,0',
    address_station: 'Station',
    address_station_color: '#000000',
    city: {
        id: 2,
        name: 'Санкт-Петербург',
        name_english: 'spb',
        name_dative: 'Санкт-Петербурге',
    },
    gallery: [],
    brand_chef: {
        name: '',
        photo_url: '',
        about: ''
    },
    worktime: [],
    menu: [],
    menu_imgs: [],
    socials: [],
    photo_cards: [],
    openTime: '10:00-22:00'
};

const mockProps = {
    image: 'gastronomy-image.jpg',
    description: 'New Year culinary delights description',
    currentRestaurant: mockRestaurant
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

        expect(mockNavigate).toHaveBeenCalledWith('/gastronomy/choose', {
            state: { restaurant: mockRestaurant }
        });
    });

    it('displays gastronomy image', () => {
        render(<GastronomyBlock {...mockProps} />);

        const image = document.querySelector('[style*="background-image"]');
        expect(image).toBeInTheDocument();
    });
});