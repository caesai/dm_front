import {useCallback, useEffect} from 'react';
import {
    useLocation, useNavigate, useSearchParams,
} from 'react-router-dom';
import { useAtom } from 'jotai/index';
import { authAtom, userAtom } from '@/atoms/userAtom.ts';

export const Redirecter = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [user] = useAtom(userAtom);
    const [auth] = useAtom(authAtom);
    const [params] = useSearchParams();
    const state = location?.state;

    const EXCLUDED_URLS = ['/phoneConfirmation', '/onboarding', '/gdpr'];
    const ONBOARDING_EXCLUDED = [
        '/onboarding',
        '/onboarding/1',
        '/onboarding/2',
        '/onboarding/3',
        '/onboarding/4',
        '/onboarding/5',
        '/onboarding/6',
        // '/onboarding/7',
        // '/onboarding/8',
        // '/onboarding/9',
    ];

    const paramsObject = Object.fromEntries([...params]);

    const shouldNavigateToPhoneConfirmation = auth?.access_token &&
        !user?.phone_number &&
        user?.complete_onboarding &&
        !EXCLUDED_URLS.includes(location.pathname);

    const shouldNavigateToOnboarding = auth?.access_token &&
        (!user?.license_agreement || !user.complete_onboarding) &&
        !ONBOARDING_EXCLUDED.includes(location.pathname) &&
        !location.pathname.includes('events') &&
        !location.pathname.includes('restaurant');

    const handleNavigation = (paramKey: string, path: string) => {
        if (location.search.includes(paramKey)) {
            const id = getEventIdFromParams(paramsObject, paramKey);
            navigate(`${path}${id}?shared=true`, { replace: true });
            return;
        }
    };

    const getEventIdFromParams = useCallback((paramsObject: {[k:string]: string}, searchString: string) => {
        for (let key in paramsObject) {
            if (paramsObject[key].includes(searchString)) {
                return paramsObject[key].replace(`${searchString}_`, '');
            }
        }
    }, []);

    // Refactored Redirect Logic
    useEffect(() => {
        if (shouldNavigateToPhoneConfirmation) {
            navigate('/phoneConfirmation', { state });
        }

        if (shouldNavigateToOnboarding) {
            if (paramsObject.tgWebAppStartParam === 'hospitality_heroes') {
                navigate(`/events/super?shared=true`, { replace: true });
                return;
            } else if (paramsObject.tgWebAppStartParam === 'newselfokna') {
                navigate('/newrestaurant', { replace: true });
                return;
            } else {
                handleNavigation('eventId', '/events/');
                handleNavigation('restaurantId', '/restaurant/');
                handleNavigation('bookingId', '/booking/?id=');
                handleNavigation('ticketId', '/tickets/');
            }
            navigate('/onboarding');
        }

        if (auth?.access_token && location.pathname.includes('/paymentReturn')) {
            navigate(location.pathname + location.search);
        }

        handleNavigation('eventId', '/events/');
        handleNavigation('restaurantId', '/restaurant/');
        handleNavigation('bookingId', '/booking/?id=');
        handleNavigation('ticketId', '/tickets/');

        if (paramsObject.tgWebAppStartParam === 'hospitality_heroes') {
            navigate(`/events/super`, { replace: true });
            return;
        } else if (paramsObject.tgWebAppStartParam === 'newselfokna') {
            navigate('/newrestaurant', { replace: true });
            return;
        }
    }, [auth, user, location.pathname, location.search]);

    // TODO: Be sure redirect logic still works then delete this part
    // useEffect(() => {
    //     const paramsObject = Object.fromEntries([...params]);
    //     if (
    //         auth?.access_token &&
    //         !user?.phone_number &&
    //         user?.complete_onboarding &&
    //         !EXCLUDED_URLS.includes(location.pathname)
    //     ) {
    //         navigate('/phoneConfirmation', { state });
    //     }
    //     if (
    //         auth?.access_token &&
    //         (!user?.license_agreement || !user.complete_onboarding) &&
    //         !ONBOARDING_EXCLUDED.includes(location.pathname) &&
    //         !location.pathname.includes('events') &&
    //         !location.pathname.includes('restaurant')
    //     ) {
    //         if (paramsObject.tgWebAppStartParam === 'hospitality_heroes') {
    //             navigate(`/events/super?shared=true`, { replace: true });
    //         }
    //         if (paramsObject.tgWebAppStartParam === 'newselfokna') {
    //             navigate('/newrestaurant', { replace: true });
    //         }
    //         if (location.search.includes('eventId')) {
    //             const eventId = getEventIdFromParams(paramsObject, 'eventId');
    //             navigate(`/events/${eventId}?shared=true`);
    //         } else if (location.search.includes('restaurantId')) {
    //             const restaurantId = getEventIdFromParams(paramsObject, 'restaurantId');
    //             navigate('/restaurant/' + restaurantId + '&shared=true', { replace: true });
    //         } else if (location.search.includes('bookingId')) {
    //             const bookingId = getEventIdFromParams(paramsObject, 'bookingId');
    //             navigate('/booking/?id=' + bookingId + '&shared=true', { replace: true });
    //         } else if (location.search.includes('ticketId')) {
    //             const ticketId = getEventIdFromParams(paramsObject, 'ticketId');
    //             navigate('/tickets/' + ticketId + '?shared=true', { replace: true });
    //         } else {
    //             navigate('/onboarding');
    //         }
    //     }
    //     if (
    //         auth?.access_token &&
    //         location.pathname.includes('/paymentReturn')
    //     ) {
    //         navigate(location.pathname + location.search);
    //     }
    //     if (
    //         location.search.includes('eventId')
    //     ) {
    //         const eventId = getEventIdFromParams(paramsObject, 'eventId');
    //         navigate(`/events/${eventId}?shared=true`, { replace: true });
    //     }
    //     if (location.search.includes('restaurantId')) {
    //         const restaurantId = getEventIdFromParams(paramsObject, 'restaurantId');
    //         navigate('/restaurant/' + restaurantId + '?shared=true', { replace: true });
    //     }
    //     if (location.search.includes('bookingId')) {
    //         const bookingId = getEventIdFromParams(paramsObject, 'bookingId');
    //         navigate('/booking/?id=' + bookingId + '&shared=true', { replace: true });
    //     }
    //     if (location.search.includes('ticketId')) {
    //         const ticketId = getEventIdFromParams(paramsObject, 'ticketId');
    //         navigate('/tickets/' + ticketId + '?shared=true', { replace: true });
    //     }
    //     if (paramsObject.tgWebAppStartParam === 'hospitality_heroes') {
    //         navigate(`/events/super`, { replace: true });
    //     }
    //     if (paramsObject.tgWebAppStartParam === 'newselfokna') {
    //         navigate('/newrestaurant', { replace: true });
    //     }
    // }, [auth, user, location.pathname, location.search]);

    return <></>;
};
