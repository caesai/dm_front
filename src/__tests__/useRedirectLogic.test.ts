import { renderHook } from '@testing-library/react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { useAtom } from 'jotai';
import { authAtom, userAtom } from '@/atoms/userAtom.ts';
import { useRedirectLogic } from '@/hooks/useRedirectLogic.ts';
import { mockUserData as defaultMockUser } from '@/__mocks__/user.mock.ts';
import type { IUser } from '@/types/user.types.ts';

// --- Mock external dependencies ---
jest.mock('jotai', () => ({
    ...jest.requireActual('jotai'),
    useAtom: jest.fn(),
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
    useLocation: jest.fn(),
    useSearchParams: jest.fn(),
}));


describe('useRedirectLogic', () => {
    // --- Setup for each test ---
    beforeEach(() => {
        jest.clearAllMocks();

        // Reset and provide default mock values for Jotai and router hooks
        (useAtom as jest.Mock).mockImplementation((atom) => {
            if (atom === authAtom) return [{ access_token: 'valid_token' }];
            if (atom === userAtom) return [{ ...defaultMockUser, complete_onboarding: true, phone_number: '123456789' }];
            return [null];
        });
        (useLocation as jest.Mock).mockReturnValue({ pathname: '/', search: '', state: undefined });
        (useSearchParams as jest.Mock).mockReturnValue([new URLSearchParams({})]);
    });

    // --- Helper function for test setup ---
    const setup = ({
                       auth = { access_token: 'valid_token' },
                       user = { ...defaultMockUser, complete_onboarding: true, phone_number: '123456789' },
                       pathname = '/',
                       search = '',
                       state = undefined,
                       params = {},
                   }: {
        auth?: { access_token: string } | null;
        user?: IUser;
        pathname?: string;
        search?: string;
        state?: any;
        params?: Record<string, string>;
    } = {}) => {
        (useAtom as jest.Mock).mockImplementation((atom) => {
            if (atom === authAtom) return [auth];
            if (atom === userAtom) return [user];
            return [null];
        });
        (useLocation as jest.Mock).mockReturnValue({ pathname, search, state });
        (useSearchParams as jest.Mock).mockReturnValue([new URLSearchParams(params)]);
    };

    // --- Test Cases ---

    it('не должно быть перенаправления для неавторизованного пользователя', () => {
        setup({ auth: null });
        renderHook(() => useRedirectLogic());
        expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('должно быть перенаправление на страницу подтверждения телефона, если пользователь авторизован, но номер телефона не установлен', () => {
        setup({
            user: { ...defaultMockUser, phone_number: undefined, complete_onboarding: true },
        });
        renderHook(() => useRedirectLogic());
        expect(mockNavigate).toHaveBeenCalledWith('/phoneConfirmation', { state: undefined });
    });

    it('должно быть перенаправление на страницу онбординга, если пользователь авторизован, но онбординг не пройден', () => {
        setup({
            user: { ...defaultMockUser, complete_onboarding: false, phone_number: '123456789' },
        });
        renderHook(() => useRedirectLogic());
        expect(mockNavigate).toHaveBeenCalledWith('/onboarding', { replace: true });
    });

    it('должно быть перенаправление на страницу супер-мероприятия, если параметр tgWebAppStartParam равен hospitality_heroes', () => {
        setup({ params: { tgWebAppStartParam: 'hospitality_heroes' } });
        renderHook(() => useRedirectLogic());
        expect(mockNavigate).toHaveBeenCalledWith('/events/super?shared=true', { replace: true });
    });

    it('должно быть перенаправление на страницу деталей мероприятия, если параметр tgWebAppStartParam равен eventId_111', () => {
        setup({ params: { tgWebAppStartParam : 'eventId_111' } });
        renderHook(() => useRedirectLogic());
        expect(mockNavigate).toHaveBeenCalledWith('/events/111/details?shared=true', { replace: true });
    });

    it('должно быть перенаправление на страницу ресторана, если параметр tgWebAppStartParam равен restaurantId_222', () => {
        setup({ params: { tgWebAppStartParam : 'restaurantId_222' } });
        renderHook(() => useRedirectLogic());
        expect(mockNavigate).toHaveBeenCalledWith('/restaurant/222?shared=true', { replace: true });
    });

    it('не должно быть перенаправления, если пользователь находится на странице онбординга', () => {
        setup({
            user: { ...defaultMockUser, complete_onboarding: false },
            pathname: '/onboarding',
        });
        renderHook(() => useRedirectLogic());
        expect(mockNavigate).not.toHaveBeenCalled();
    });
});
