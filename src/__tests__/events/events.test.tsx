import axios from 'axios';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
// import { APIGetEvents } from '@/api/events.ts';
import { mockEventsList } from '@/__mocks__/events.mock.ts';
import { EventsPage } from '@/pages/EventsPage/EventsPage.tsx';
import { EventListOutlet } from '@/pages/EventsPage/EventListOutlet/EventListOutlet.tsx';
// import { backButton } from '@telegram-apps/sdk-react';

// Mocking ENV Variables
jest.mock('../../api/base.ts', () => ({
    BASE_URL: 'https://devsoko.ru/api/v1',
    DEV_MODE: 'development',
    BASE_BOT: 'dmdev1bot',
}));

jest.mock('axios'); // Mock the entire axios module

jest.mock('@telegram-apps/sdk-react', () => ({
    backButton: {
        show: jest.fn(),
        onClick: jest.fn(),
    },
}));

jest

describe('Events API Test', () => {
    beforeEach(() => {
        // Ensure the window.Telegram object and its properties exist
        Object.defineProperty(window, 'Telegram', {
            configurable: true,
            value: {
                WebApp: {
                    initDataUnsafe: {
                        user: {
                            id: 'random-id',
                            first_name: 'Test',
                            last_name: 'User',
                            username: 'testuser',
                        },
                    },
                },
            },
            writable: true,
        });
    });

    //TODO: test APIGetEvents.
    test('APIGetEvents', async () => {
        //TODO:
        (axios.get as jest.Mock).mockResolvedValue({ data: mockEventsList });

        render(
            <MemoryRouter initialEntries={['/events']} future={{
                v7_startTransition: true,
                v7_relativeSplatPath: true,
            }}>
                <EventsPage />
                <EventListOutlet />
            </MemoryRouter>,
        );

        await waitFor(() => {
            expect(screen.getByText(/Дегустация чая/i)).toBeInTheDocument();
        });
    });
});
