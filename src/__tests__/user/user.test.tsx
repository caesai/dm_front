import { act, screen, render } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { UserProfilePage } from '@/pages/UserProfilePage/UserProfilePage.tsx';
import { APIUpdateUserInfo } from '@/api/user.api.ts';
import { useAtom } from 'jotai';
import { mockUserData } from '@/__mocks__/user.mock.ts';

// Mocking ENV Variables
jest.mock('@/api/base.ts', () => ({
    BASE_URL: 'https://devsoko.ru/api/v1',
    DEV_MODE: 'development',
    BASE_BOT: 'dmdev1bot',
}));

// Mock the global setTimeout function
jest.useFakeTimers();

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useLocation: jest.fn(),
}));

// Mock the entire Jotai module
jest.mock('jotai', () => ({
    useAtom: jest.fn(),
    atom: jest.fn(),
}));

let mainButtonClickHandler: () => void;
const removeListenerMock = jest.fn();
// Create the inline mock factory
jest.mock('@telegram-apps/sdk-react', () => {
    return {
        backButton: {
            show: jest.fn(),
            onClick: jest.fn(),
        },
        mainButton: {
            onClick: jest.fn((callback) => {
                mainButtonClickHandler = callback;
                return removeListenerMock;
            }),
            setParams: jest.fn(),
            // Define `mount` as a mock function that returns an object with `isAvailable`
            mount: {
                isAvailable: jest.fn(),
            },
            unmount: jest.fn(),
        },
    };
});

// Mock the API call function
jest.mock('@/api/user.api.ts', () => ({
    APIUpdateUserInfo: jest.fn(() => Promise.resolve({ data: {} })),
}));

describe('User', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (useLocation as jest.Mock).mockClear();
    });

    test('should show an success toast on API error', async () => {
        // Arrange
        const mockAuthInfo = {
            access_token: 'fake-access-token',
            // ... other properties
        };
        const mockSetAuthInfo = jest.fn();
        (useLocation as jest.Mock).mockReturnValue({
            state: {
                allergies: null
            },
        });

        // Configure the `useAtom` mock to return a tuple with your mock data
        (useAtom as jest.Mock).mockReturnValue([mockAuthInfo, mockSetAuthInfo]);
        (APIUpdateUserInfo as jest.Mock).mockResolvedValue({ data: mockUserData });

        render(
            <MemoryRouter initialEntries={['/me']} future={{
                v7_startTransition: true,
                v7_relativeSplatPath: true,
            }}>
                <UserProfilePage />
            </MemoryRouter>,
        );

        // Act
        // Use `act()` to handle state changes caused by the click handler
        await act(async () => {
            // Trigger the click handler that was registered by the component
            if (mainButtonClickHandler) {
                mainButtonClickHandler();
            }
        });

        // Assert
        // Check that the API function was called as a result of the click
        expect(APIUpdateUserInfo).toHaveBeenCalled();
        expect(screen.getByTestId('toast-message')).toHaveTextContent('Изменения сохранены');
    });
});
