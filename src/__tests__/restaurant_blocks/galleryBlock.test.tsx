import { render, screen } from '@testing-library/react';
import { GalleryBlock } from '@/pages/RestaurantPage/blocks/GalleryBlock.tsx';

jest.mock('swiper/react', () => ({
    Swiper: ({ children }: any) => <div data-testid="swiper">{children}</div>,
    SwiperSlide: ({ children }: any) => <div data-testid="swiper-slide">{children}</div>,
}));

jest.mock('swiper/modules', () => ({
    FreeMode: jest.fn(),
}));

jest.mock('@/api/restaurants', () => ({}));
jest.mock('@/api/base', () => ({
    DEV_MODE: false,
}));

jest.mock('@/components/ImageViewerPopup/ImageViewerPopup', () => ({
    ImageViewerPopup: ({ isOpen }: any) =>
        isOpen ? <div data-testid="image-viewer">Image Viewer Open</div> : null
}));

jest.mock('@/pages/RestaurantPage/RestaurantPage', () => ({
    transformGallery: () => [
        {
            title: 'Interior',
            photos: [{ link: 'photo1.jpg' }, { link: 'photo2.jpg' }]
        },
        {
            title: 'Food',
            photos: [{ link: 'photo3.jpg' }, { link: 'photo4.jpg' }]
        }
    ]
}));

const mockGallery = [
    { category: 'Interior', url: 'photo1.jpg', id: 1 },
    { category: 'Interior', url: 'photo2.jpg', id: 2 },
    { category: 'Food', url: 'photo3.jpg', id: 3 },
    { category: 'Food', url: 'photo4.jpg', id: 4 }
];

describe('GalleryBlock', () => {
    it('renders nothing when no gallery provided', () => {
        const { container } = render(<GalleryBlock restaurant_gallery={undefined} />);
        expect(container.firstChild).toBeNull();
    });

    it('renders gallery with title and categories', () => {
        render(<GalleryBlock restaurant_gallery={mockGallery} />);

        expect(screen.getByText('Галерея')).toBeInTheDocument();
        expect(screen.getByText('Все фото')).toBeInTheDocument();
        expect(screen.getByText('Interior')).toBeInTheDocument();
        expect(screen.getByText('Food')).toBeInTheDocument();
    });

    it('shows all photos category as active by default', () => {
        render(<GalleryBlock restaurant_gallery={mockGallery} />);

        const allPhotosCategory = screen.getByText('Все фото');
        expect(allPhotosCategory).toHaveClass('photoSliderNavigationActive');
    });

    it('displays photos in gallery', () => {
        render(<GalleryBlock restaurant_gallery={mockGallery} />);

        const photos = document.querySelectorAll('[style*="background-image"]');
        expect(photos.length).toBeGreaterThan(0);
    });
});