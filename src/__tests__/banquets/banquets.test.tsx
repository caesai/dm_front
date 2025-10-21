import { MemoryRouter, useLocation } from 'react-router-dom';
import { ChooseBanquetOptionsPage } from '@/pages/ChooseBanquetOptionsPage/ChooseBanquetOptionsPage.tsx';
import { screen, waitFor, render } from '@testing-library/react';
import { banquetData } from '@/__mocks__/banquets.mock.ts';
// Mocking Telegram SDK to be able to run code outside
jest.mock('@telegram-apps/sdk-react', () => ({
    backButton: {
        show: jest.fn(),
        onClick: jest.fn(),
    },
}));

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'), // Import and retain default behavior
    useLocation: jest.fn(), // Mock useLocation specifically
}));

jest.mock('swiper/react', () => ({
    Swiper: jest.fn(),
    SwiperSlide: jest.fn(),
}));

jest.mock('swiper/modules', () => ({
    Navigation: jest.fn(),
    Pagination: jest.fn(),
}));

describe('Banquets', () => {
    beforeEach(() => {
        // Reset the mock before each test to avoid state leakage
        (useLocation as jest.Mock).mockClear();
    });

    test('Should return an empty banquets message', async () => {
        (useLocation as jest.Mock).mockReturnValue({
            state: {
                banquets: null
            },
        });
        render(
            <MemoryRouter initialEntries={['/banquets/11/choose']} future={{
                v7_startTransition: true,
                v7_relativeSplatPath: true,
            }}>
                <ChooseBanquetOptionsPage />
            </MemoryRouter>
        )
        await waitFor(() => {
            expect(screen.getByText(/Нет доступных опций для банкета/i)).toBeInTheDocument();
        });
    });

    test('Should return an array of banquets and have 3 elements', async () => {
        (useLocation as jest.Mock).mockReturnValue({
            state: {
                banquets: banquetData
            },
        });
        render(
            <MemoryRouter initialEntries={['/banquets/11/choose']} future={{
                v7_startTransition: true,
                v7_relativeSplatPath: true,
            }}>
                <ChooseBanquetOptionsPage />
            </MemoryRouter>
        )
        await waitFor(() => {
            expect(screen.getAllByText(/Банкетная рассадка/i).length).toEqual(3);
        });
    });
});
