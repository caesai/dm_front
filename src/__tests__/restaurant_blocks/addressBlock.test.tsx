import { render, screen } from '@testing-library/react';
import { AddressBlock } from '@/pages/RestaurantPage/blocks/AddressBlock.tsx';

jest.mock('ymap3-components', () => ({
    YMapComponentsProvider: ({ children }: any) => <div data-testid="ymap-provider">{children}</div>,
    YMap: ({ children, location }: any) => (
        <div data-testid="ymap" data-location={JSON.stringify(location)}>
            {children}
        </div>
    ),
    YMapDefaultSchemeLayer: () => <div data-testid="scheme-layer"></div>,
    YMapDefaultFeaturesLayer: () => <div data-testid="features-layer"></div>,
    YMapMarker: ({ children, coordinates }: any) => (
        <div data-testid="ymap-marker" data-coordinates={JSON.stringify(coordinates)}>
            {children}
        </div>
    ),
}));

describe('AddressBlock', () => {
    it('renders address block with title', () => {
        render(<AddressBlock restaurantId={String(1)} />);

        expect(screen.getByText('Адрес')).toBeInTheDocument();
    });

    it('renders Yandex map components', () => {
        render(<AddressBlock restaurantId={String(1)} />);

        expect(screen.getByTestId('ymap-provider')).toBeInTheDocument();
        expect(screen.getByTestId('ymap')).toBeInTheDocument();
        expect(screen.getByTestId('ymap-marker')).toBeInTheDocument();
        expect(screen.getByTestId('scheme-layer')).toBeInTheDocument();
        expect(screen.getByTestId('features-layer')).toBeInTheDocument();
    });

    it('displays restaurant logo in map marker', () => {
        render(<AddressBlock restaurantId={String(1)} />);

        const logo = screen.getByAltText('Логотип ресторана');
        expect(logo).toHaveAttribute('src', 'restaurant-logo.jpg');
    });

    it('passes correct coordinates to map components', () => {
        render(<AddressBlock restaurantId={String(1)} />);

        const map = screen.getByTestId('ymap');
        const marker = screen.getByTestId('ymap-marker');

        expect(map).toHaveAttribute('data-location', JSON.stringify({
            center: [37.6173, 55.7558],
            zoom: 17
        }));
        expect(marker).toHaveAttribute('data-coordinates', JSON.stringify([37.6173, 55.7558]));
    });

    it('renders without metro info when no station color', () => {
        render(<AddressBlock restaurantId={String(1)} />);

        expect(screen.getByText('Адрес')).toBeInTheDocument();
    });
});