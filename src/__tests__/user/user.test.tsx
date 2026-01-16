import { act, screen, render } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { UserProfilePage } from '@/pages/UserProfilePage/UserProfilePage.tsx';
import { APIUpdateUserInfo } from '@/api/user.api.ts';
import { mockUserData } from '@/__mocks__/user.mock.ts';
import { Toast } from '@/components/Toast/Toast.tsx';
import { authAtom } from '@/atoms/userAtom.ts';
import { TestProvider } from '@/__mocks__/atom.mock.ts';

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

    test('должен показать тост что изменения сохранены', async () => {
        // Arrange
        const mockAuthInfo = {
            access_token: 'fake-access-token',
            // ... other properties
        };
        (useLocation as jest.Mock).mockReturnValue({
            state: {
                allergies: null
            },
        });

        (APIUpdateUserInfo as jest.Mock).mockResolvedValue({ data: mockUserData });

        render(
            <MemoryRouter initialEntries={['/me']} future={{
                v7_startTransition: true,
                v7_relativeSplatPath: true,
            }}>
                <TestProvider initialValues={[[authAtom, mockAuthInfo]]}>
                    <Toast />
                    <UserProfilePage />
                </TestProvider>
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
