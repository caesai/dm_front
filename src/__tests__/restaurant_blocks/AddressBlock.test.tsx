import { render, screen } from '@testing-library/react';
import { AddressBlock } from '@/pages/Restaurant/blocks/AddressBlock.tsx';

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

const mockProps = {
    longitude: 37.6173,
    latitude: 55.7558,
    logo_url: 'restaurant-logo.jpg',
    address: 'Test Address 123',
    address_station_color: '#FF0000'
};

describe('AddressBlock', () => {
    it('renders address block with title', () => {
        render(<AddressBlock {...mockProps} />);

        expect(screen.getByText('Адрес')).toBeInTheDocument();
    });

    it('renders Yandex map components', () => {
        render(<AddressBlock {...mockProps} />);

        expect(screen.getByTestId('ymap-provider')).toBeInTheDocument();
        expect(screen.getByTestId('ymap')).toBeInTheDocument();
        expect(screen.getByTestId('ymap-marker')).toBeInTheDocument();
        expect(screen.getByTestId('scheme-layer')).toBeInTheDocument();
        expect(screen.getByTestId('features-layer')).toBeInTheDocument();
    });

    it('displays restaurant logo in map marker', () => {
        render(<AddressBlock {...mockProps} />);

        const logo = screen.getByAltText('Логотип ресторана');
        expect(logo).toHaveAttribute('src', 'restaurant-logo.jpg');
    });

    it('passes correct coordinates to map components', () => {
        render(<AddressBlock {...mockProps} />);

        const map = screen.getByTestId('ymap');
        const marker = screen.getByTestId('ymap-marker');

        expect(map).toHaveAttribute('data-location', JSON.stringify({
            center: [37.6173, 55.7558],
            zoom: 17
        }));
        expect(marker).toHaveAttribute('data-coordinates', JSON.stringify([37.6173, 55.7558]));
    });

    it('renders without metro info when no station color', () => {
        const propsWithoutColor = {
            ...mockProps,
            address_station_color: undefined
        };

        render(<AddressBlock {...propsWithoutColor} />);

        expect(screen.getByText('Адрес')).toBeInTheDocument();
    });
});