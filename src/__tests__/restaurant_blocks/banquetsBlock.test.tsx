import { render, screen, fireEvent } from '@testing-library/react';
import { BanquetsBlock } from '@/pages/RestaurantPage/blocks/BanquetsBlock.tsx';
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
    restaurant: {
        id: 1,
        title: "Smoke BBQ",
        slogan: "Бар · гриль · коптильня",
        address: "Москва, Трубная ул., 18",
        logo_url: "https://storage.yandexcloud.net/dreamteam-storage/959edf8c8af64e93a19c587371a4090d.png",
        thumbnail_photo: "https://storage.yandexcloud.net/dreamteam-storage/b76b600f30cb4fb6bb5fc796b713ecfa.jpg",
        openTime: "",
        avg_cheque: 1500,
        photo_cards: [
            {
                id: 117,
                category: "Блюда",
                url: "https://storage.yandexcloud.net/dreamteam-storage/e7edc89403ac4da2ba4542683eae345a.jpg"
            }
        ],
        brand_chef: {
            names: ["lorem"],
            photo_url: "https://storage.yandexcloud.net/dreamteam-storage/212d0f1e30014e6cbbf2513bbc1d387d.jpg",
            about: "about text",
            avatars: [],
        },
        city: {
            id: 1,
            name: "Москва",
            name_dative: "Москве",
            name_english: "moscow",
        },
        about_text: "text",
        about_dishes: "Мясо, Рыба и морепродукты",
        about_kitchen: "Американская, Европейская",
        about_features: "Обеды, Бранчи, Веранда",
        address_lonlng: "123123",
        address_station: "м. Трубная",
        address_station_color: "#99CC00",
        phone_number: "+7 (926) 041-53-72",
        gallery: [
            {
                id: 1,
                category: "Ресторан",
                url: "https://example.com/gallery1.jpg"
            }
        ],
        menu: [
            {
                id: 1,
                title: "Крем - суп из пастернака",
                photo_url: "https://storage.yandexcloud.net/bottec-dreamteam/SmokeBBQ/MSK/main.jpg",
                price: 1300
            }
        ],
        menu_imgs: [
            {
                id: 36,
                image_url: "https://storage.yandexcloud.net/bottec-dreamteam/menu1.png",
                order: 1
            }
        ],
        worktime: [
            {
                weekday: "вс",
                time_start: "09:00",
                time_end: "23:00"
            }
        ],
        socials: [
            {
                type: "instagram",
                url: "https://www.instagram.com/smokebbqmoscow",
                name: "smokebbqmoscow"
            }
        ],
        banquets: {
            banquet_options: [],
            additional_options: [],
            description: '',
            image: '',
        },
    },
    workTime: [
        { weekday: '1', time_start: '10:00', time_end: '22:00' },
        { weekday: '2', time_start: '10:00', time_end: '22:00' }
    ],
    openTime: ''
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

        expect(mockNavigate).toHaveBeenCalledWith('/banquets/1/address', {
            state: {
                restaurant: mockProps.restaurant,
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
