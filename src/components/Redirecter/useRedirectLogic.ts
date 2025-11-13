import { useCallback, useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAtom } from 'jotai';
import { authAtom, userAtom } from '@/atoms/userAtom.ts';

const EXCLUDED_URLS = ['/phoneConfirmation', '/onboarding', '/gdpr'];
const ONBOARDING_EXCLUDED = [
    '/onboarding',
    '/onboarding/1',
    '/onboarding/2',
    '/onboarding/3',
    '/onboarding/4',
    '/onboarding/5',
    '/onboarding/6',
];

const getEventIdFromParams = (paramsObject: Record<string, string>, searchString: string): string | undefined => {
    for (const key in paramsObject) {
        if (paramsObject[key]?.includes(searchString)) {
            return paramsObject[key].replace(`${searchString}_`, '');
        }
    }
    return undefined;
};

const extractIdFromParam = (paramValue: string, prefix: string): string | undefined => {
    if (paramValue?.startsWith(prefix)) {
        return paramValue.replace(prefix, '');
    }
    return undefined;
};

export const useRedirectLogic = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [user] = useAtom(userAtom);
    const [auth] = useAtom(authAtom);
    const [params] = useSearchParams();
    const state = location?.state;
    const paramsObject = Object.fromEntries(params.entries());

    const handleNavigation = useCallback((paramKey: string, path: string) => {
        const id = getEventIdFromParams(paramsObject, paramKey);
        if (id) {
            if (path.includes('booking')) {
                const params = new URLSearchParams({ id, shared: 'true' });
                navigate(`${path}?${params.toString()}`, { replace: true });
            } else {
                navigate(`${path}${id}?shared=true`, { replace: true });
            }
            return true;
        }
        return false;
    }, [navigate, paramsObject]);

    useEffect(() => {
        const { pathname, search } = location;

        // Highest priority: Handle specific Telegram Web App start parameters
        if (paramsObject.tgWebAppStartParam) {
            const bookingId = extractIdFromParam(paramsObject.tgWebAppStartParam, 'bookingId_');
            if (bookingId) {
                navigate(`/booking?id=${bookingId}&shared=true`, { replace: true });
                return;
            }
            if (paramsObject.tgWebAppStartParam === 'hospitality_heroes') {
                navigate(`/events/super?shared=true`, { replace: true });
                return;
            }
            if (paramsObject.tgWebAppStartParam === 'newselfokna') {
                navigate('/newrestaurant', { replace: true });
                return;
            }
        }

        // Redirect based on query parameters (highest priority)
        const hasRedirectedByParam = handleNavigation('eventId', '/events/') ||
            handleNavigation('restaurantId', '/restaurant/') ||
            handleNavigation('bookingId', '/booking/') ||
            handleNavigation('ticketId', '/tickets/') ||
            handleNavigation('certificateId', '/certificates/landing/');

        if (hasRedirectedByParam) return;

        // Check user authentication and onboarding status
        if (auth?.access_token) {
            if (!user?.phone_number && user?.complete_onboarding && !EXCLUDED_URLS.includes(pathname)) {
                navigate('/phoneConfirmation', { state });
                return;
            }

            const isUserIncomplete = !user?.license_agreement || !user.complete_onboarding;
            const isOnboardingNotExcluded = !ONBOARDING_EXCLUDED.includes(pathname) &&
                !pathname.includes('events') &&
                !pathname.includes('restaurant') &&
                !pathname.includes('booking');

            if (isUserIncomplete && isOnboardingNotExcluded) {
                navigate('/onboarding', { replace: true });
                return;
            }

            // Handle payment return routes
            if (pathname.includes('/paymentReturn')) {
                navigate(pathname + search, { replace: true });
                return;
            }
        }

    }, [auth, user, location.pathname, location.search, navigate, state, paramsObject, handleNavigation]);
};
