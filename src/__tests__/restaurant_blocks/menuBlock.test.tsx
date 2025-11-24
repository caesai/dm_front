import { render, screen, fireEvent } from '@testing-library/react';
import { MenuBlock } from '@/pages/Restaurant/blocks/MenuBlock.tsx';

jest.mock('swiper/react', () => ({
    Swiper: ({ children }: any) => <div data-testid="swiper">{children}</div>,
    SwiperSlide: ({ children }: any) => <div data-testid="swiper-slide">{children}</div>,
}));

jest.mock('swiper/modules', () => ({
    FreeMode: jest.fn(),
}));

jest.mock('@/components/MenuPopup/MenuPopup', () => ({
    MenuPopup: ({ isOpen }: any) =>
        isOpen ? <div data-testid="menu-popup">Menu Popup Open</div> : null
}));

jest.mock('@/components/Buttons/UniversalButton/UniversalButton', () => ({
    UniversalButton: ({ title, action }: any) => (
        <button onClick={action} data-testid="universal-button">
            {title}
        </button>
    ),
}));

const mockMenu = [
    { id: 1, title: 'Pasta', price: 500, photo_url: 'pasta.jpg' },
    { id: 2, title: 'Pizza', price: 800, photo_url: 'pizza.jpg' },
    { id: 3, title: 'Salad', price: 300, photo_url: 'salad.jpg' }
];

const mockMenuImgs = [
    { image_url: 'menu1.jpg', order: 2, id: 1 },
    { image_url: 'menu2.jpg', order: 1, id: 2 },
    { image_url: 'menu3.jpg', order: 3, id: 3 }
];

describe('MenuBlock', () => {
    it('renders menu block with title', () => {
        render(<MenuBlock menu={mockMenu} menu_imgs={mockMenuImgs} />);

        expect(screen.getByText('Меню')).toBeInTheDocument();
        expect(screen.getByText('Всё меню')).toBeInTheDocument();
    });

    it('displays menu items with titles and prices', () => {
        render(<MenuBlock menu={mockMenu} menu_imgs={mockMenuImgs} />);

        expect(screen.getByText('Pasta')).toBeInTheDocument();
        expect(screen.getByText('500 ₽')).toBeInTheDocument();
        expect(screen.getByText('Pizza')).toBeInTheDocument();
        expect(screen.getByText('800 ₽')).toBeInTheDocument();
        expect(screen.getByText('Salad')).toBeInTheDocument();
        expect(screen.getByText('300 ₽')).toBeInTheDocument();
    });

    it('opens menu popup when button is clicked', () => {
        render(<MenuBlock menu={mockMenu} menu_imgs={mockMenuImgs} />);

        fireEvent.click(screen.getByText('Всё меню'));

        expect(screen.getByTestId('menu-popup')).toBeInTheDocument();
    });

    it('renders without menu images', () => {
        render(<MenuBlock menu={mockMenu} menu_imgs={undefined} />);

        expect(screen.getByText('Меню')).toBeInTheDocument();
        expect(screen.getByText('Всё меню')).toBeInTheDocument();
    });

    it('renders without menu items', () => {
        render(<MenuBlock menu={undefined} menu_imgs={mockMenuImgs} />);

        expect(screen.getByText('Меню')).toBeInTheDocument();
        expect(screen.getByText('Всё меню')).toBeInTheDocument();
    });

    it('displays menu item photos', () => {
        render(<MenuBlock menu={mockMenu} menu_imgs={mockMenuImgs} />);

        const photos = document.querySelectorAll('[style*="background-image"]');
        expect(photos.length).toBeGreaterThan(0);
    });
});
