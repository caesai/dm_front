// import { render, screen } from '@testing-library/react';
// import { MenuBlock } from '@/pages/RestaurantPage/blocks/MenuBlock.tsx';

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

// const mockMenuImgs = [
//     { image_url: 'menu1.jpg', order: 2, id: 1 },
//     { image_url: 'menu2.jpg', order: 1, id: 2 },
//     { image_url: 'menu3.jpg', order: 3, id: 3 }
// ];

describe('MenuBlock', () => {

    it('renders without menu items', () => {
        // TODO: Add test for menu block
    });

});
