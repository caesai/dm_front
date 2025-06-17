import { useEffect } from 'react';
import {
    useLocation, useNavigate, useSearchParams,
} from 'react-router-dom';
import { useAtom } from 'jotai/index';
import { authAtom, userAtom } from '@/atoms/userAtom.ts';
import {APIGetEvents} from "@/api/events.ts";

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

    const redirectToEvent = () => {
        APIGetEvents().then((res) => {
            console.log('Params Entries: ', Object.fromEntries([...params]));
            const event = res.data.filter((event) =>
                event.restaurants.some((restaurant) => {
                        return restaurant.dates[0].id.toString() === decodeURIComponent(String(params.get('eventId')));
                    }
                )
            );
            navigate('/events/' + event[0].name + '/restaurant/' + event[0].restaurants[0].id + '/guests/?fromlink')
        });
    }

    useEffect(() => {
        if (
            auth?.access_token &&
            !user?.phone_number &&
            user?.complete_onboarding &&
            !EXCLUDED_URLS.includes(location.pathname)
        ) {
            if (
                location.search.includes('event')
            ) {
                navigate(`/phoneConfirmation?event=${params.get('event')}&restaurant_id=${params.get('restaurant_id')}`)
            } else {
                navigate('/phoneConfirmation');
            }
        }
        if (
            auth?.access_token &&
            (!user?.license_agreement || !user.complete_onboarding) &&
            !ONBOARDING_EXCLUDED.includes(location.pathname) &&
            !location.pathname.includes('events')
        ) {
            if (
                location.search.includes('eventId')
            ) {
                redirectToEvent();
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
            redirectToEvent();
        }
    }, [auth, user, location.pathname, location.search]);

    return <></>;
};
