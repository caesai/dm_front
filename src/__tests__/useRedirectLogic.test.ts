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
            if (atom === userAtom) return [{ ...defaultMockUser, complete_onboarding: true, license_agreement: true, phone_number: '123456789' }];
            return [null];
        });
        (useLocation as jest.Mock).mockReturnValue({ pathname: '/', search: '', state: undefined });
        (useSearchParams as jest.Mock).mockReturnValue([new URLSearchParams({})]);
    });

    // --- Helper function for test setup ---
    const setup = ({
                       auth = { access_token: 'valid_token' },
                       user = { ...defaultMockUser, complete_onboarding: true, license_agreement: true, phone_number: '123456789' },
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

    it('should not navigate for an unauthenticated user', () => {
        setup({ auth: null });
        renderHook(() => useRedirectLogic());
        expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should navigate to phone confirmation if user is authenticated, onboarding is complete, but phone number is missing', () => {
        setup({
            user: { ...defaultMockUser, phone_number: undefined, complete_onboarding: true, license_agreement: true },
        });
        renderHook(() => useRedirectLogic());
        expect(mockNavigate).toHaveBeenCalledWith('/phoneConfirmation', { state: undefined });
    });

    it('should navigate to onboarding if user is authenticated but onboarding is incomplete', () => {
        setup({
            user: { ...defaultMockUser, license_agreement: false, complete_onboarding: false, phone_number: '123456789' },
        });
        renderHook(() => useRedirectLogic());
        expect(mockNavigate).toHaveBeenCalledWith('/onboarding', { replace: true });
    });

    it('should navigate to /events/super for specific tgWebAppStartParam', () => {
        setup({ params: { tgWebAppStartParam: 'hospitality_heroes' } });
        renderHook(() => useRedirectLogic());
        expect(mockNavigate).toHaveBeenCalledWith('/events/super?shared=true', { replace: true });
    });

    it('should navigate to /newrestaurant for specific tgWebAppStartParam', () => {
        setup({ params: { tgWebAppStartParam: 'newselfokna' } });
        renderHook(() => useRedirectLogic());
        expect(mockNavigate).toHaveBeenCalledWith('/newrestaurant', { replace: true });
    });

    it('should navigate to /booking with id from tgWebAppStartParam', () => {
        setup({ params: { tgWebAppStartParam: 'bookingId_123' } });
        renderHook(() => useRedirectLogic());
        expect(mockNavigate).toHaveBeenCalledWith('/booking?id=123&shared=true', { replace: true });
    });

    it('should navigate to /events/ with id from eventId query param', () => {
        setup({ params: { tgWebAppStartParam : 'eventId_111' } });
        renderHook(() => useRedirectLogic());
        expect(mockNavigate).toHaveBeenCalledWith('/events/111?shared=true', { replace: true });
    });

    it('should navigate to /restaurant/ with id from restaurantId query param', () => {
        setup({ params: { tgWebAppStartParam : 'restaurantId_222' } });
        renderHook(() => useRedirectLogic());
        expect(mockNavigate).toHaveBeenCalledWith('/restaurant/222?shared=true', { replace: true });
    });

    it('should navigate to /booking with id from bookingId query param', () => {
        setup({ params: { tgWebAppStartParam : 'bookingId_333' } });
        renderHook(() => useRedirectLogic());
        expect(mockNavigate).toHaveBeenCalledWith('/booking?id=333&shared=true', { replace: true });
    });

    it('should navigate to payment return url if on paymentReturn path', () => {
        const urlSearch = '?success=true&payment_id=abc';
        setup({ pathname: '/paymentReturn', search: urlSearch });
        renderHook(() => useRedirectLogic());
        expect(mockNavigate).toHaveBeenCalledWith(`/paymentReturn${urlSearch}`, { replace: true });
    });

    it('should not navigate when user is on an excluded onboarding path', () => {
        setup({
            user: { ...defaultMockUser, complete_onboarding: false, license_agreement: false },
            pathname: '/onboarding',
        });
        renderHook(() => useRedirectLogic());
        expect(mockNavigate).not.toHaveBeenCalled();
    });
});
