import { useEffect } from 'react';
import {useLocation, useNavigate,
    // useOutletContext
} from 'react-router-dom';
import { useAtom } from 'jotai/index';
import { authAtom, userAtom } from '@/atoms/userAtom.ts';
// import {IEventBookingContext} from "@/utils.ts";
import {IEvent} from "@/pages/EventsPage/EventsPage.tsx";
import {eventsListAtom} from "@/atoms/eventBookingAtom.ts";

export const Redirecter = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [user] = useAtom(userAtom);
    const [auth] = useAtom(authAtom);
    // const [, setBookingInfo] = useOutletContext<IEventBookingContext>();
    const [events] = useAtom<IEvent[]>(eventsListAtom);

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
    console.log('location.pathname: ', location.pathname)
    // console.log('params: ', location.search.includes('event'), location.search.slice(location.search.lastIndexOf('_')+1));
    useEffect(() => {
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
            !ONBOARDING_EXCLUDED.includes(location.pathname)
        ) {
            navigate('/onboarding');
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
            const restaurantId = events.filter((event) =>
                event.restaurants.filter((restaurant) =>
                    restaurant.dates[0].id.toString() === location.search.slice(location.search.lastIndexOf('_')+1)
                )
            );
            console.log('restaurantId: ', restaurantId);
            // navigate('/events/' + location.search.slice(location.search.lastIndexOf('_')+1) + '/restaurant/1/guests/')
        }
    }, [auth, user, location.pathname]);

    return <></>;
};
