import {useCallback, useEffect} from 'react';
import {
    useLocation, useNavigate, useSearchParams,
} from 'react-router-dom';
import { useAtom } from 'jotai/index';
import { authAtom, userAtom } from '@/atoms/userAtom.ts';
import { setDataToLocalStorage } from '@/utils.ts';

export const Redirecter = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [user] = useAtom(userAtom);
    const [auth] = useAtom(authAtom);
    const [params] = useSearchParams();

    const EXCLUDED_URLS = ['/phoneConfirmation', '/onboarding', '/gdpr'];
    const ONBOARDING_EXCLUDED = [
        '/onboarding',
        '/onboarding/1',
        '/onboarding/2',
        '/onboarding/3',
        '/onboarding/4',
        '/onboarding/5',
        '/onboarding/6',
        '/onboarding/7',
    ];

    const getEventIdFromParams = useCallback((paramsObject: {[k:string]: string}, searchString: string) => {
        for (let key in paramsObject) {
            if (paramsObject[key].includes(searchString)) {
                return paramsObject[key].replace(`${searchString}_`, '');
            }
        }
    }, []);

    useEffect(() => {
        const paramsObject = Object.fromEntries([...params]);
        if (
            auth?.access_token &&
            !user?.phone_number &&
            user?.complete_onboarding &&
            !EXCLUDED_URLS.includes(location.pathname)
        ) {
            navigate('/phoneConfirmation');
        }
        if (
            auth?.access_token &&
            (!user?.license_agreement || !user.complete_onboarding) &&
            !ONBOARDING_EXCLUDED.includes(location.pathname) &&
            !location.pathname.includes('events') &&
            !location.pathname.includes('restaurant')
        ) {
            if (paramsObject.tgWebAppStartParam === 'hospitality_heroes') {
                setDataToLocalStorage('superEvent', {});
                navigate(`/events/super`, { replace: true });
            }
            if (paramsObject.tgWebAppStartParam === 'newselfokna') {
                navigate('/newrestaurant', { replace: true });
            }
            if (location.search.includes('eventId')) {
                const eventId = getEventIdFromParams(paramsObject, 'eventId');
                navigate(`/events/${eventId}?shared=true`);
            } else if (location.search.includes('restaurantId')) {
                const restaurantId = getEventIdFromParams(paramsObject, 'restaurantId');
                setDataToLocalStorage('superEvent', { id: restaurantId });
                navigate('/restaurant/' + restaurantId + '?shared=true', { replace: true });
            } else if (location.search.includes('bookingId')) {
                const bookingId = getEventIdFromParams(paramsObject, 'bookingId');
                navigate('/booking/?id=' + bookingId + '&shared=true', { replace: true });
            } else if (location.search.includes('ticketId')) {
                const ticketId = getEventIdFromParams(paramsObject, 'ticketId');
                navigate('/tickets/' + ticketId + '?shared=true', { replace: true });
            } else {
                navigate('/onboarding');
            }
        }
        if (
            auth?.access_token &&
            location.pathname.includes('/paymentReturn')
        ) {
            navigate(location.pathname + location.search);
        }
        if (
            location.search.includes('eventId')
        ) {
            const eventId = getEventIdFromParams(paramsObject, 'eventId');
            navigate(`/events/${eventId}?shared=true`, { replace: true });
        }
        if (location.search.includes('restaurantId')) {
            const restaurantId = getEventIdFromParams(paramsObject, 'restaurantId');
            navigate('/restaurant/' + restaurantId + '?shared=true', { replace: true });
        }
        if (location.search.includes('bookingId')) {
            const bookingId = getEventIdFromParams(paramsObject, 'bookingId');
            navigate('/booking/?id=' + bookingId + '&shared=true', { replace: true });
        }
        if (location.search.includes('ticketId')) {
            const ticketId = getEventIdFromParams(paramsObject, 'ticketId');
            navigate('/tickets/' + ticketId + '?shared=true', { replace: true });
        }
        if (paramsObject.tgWebAppStartParam === 'hospitality_heroes') {
            navigate(`/events/super`, { replace: true });
        }
        if (paramsObject.tgWebAppStartParam === 'newselfokna') {
            navigate('/newrestaurant', { replace: true });
        }
    }, [auth, user, location.pathname, location.search]);

    return <></>;
};
