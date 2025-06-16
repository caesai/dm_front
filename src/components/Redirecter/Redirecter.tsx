import { useEffect } from 'react';
import {useLocation, useNavigate,
} from 'react-router-dom';
import { useAtom } from 'jotai/index';
import { authAtom, userAtom } from '@/atoms/userAtom.ts';
import {APIGetEvents} from "@/api/events.ts";

export const Redirecter = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [user] = useAtom(userAtom);
    const [auth] = useAtom(authAtom);

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

    // useEffect(() => {
    //     if (
    //         location.search.includes('eventId')
    //     ) {
    //         APIGetEvents().then((res) => {
    //             const event = res.data.filter((event) =>
    //                 event.restaurants.filter((restaurant) => {
    //                         console.log('restaurant.dates[0].id: ', restaurant)
    //                         return restaurant.dates[0].id.toString() === location.search.slice(location.search.lastIndexOf('_') + 1)
    //                     }
    //                 )
    //             );
    //             navigate('/events/' + event[0].name + '/restaurant/' + event[0].restaurants[0].id + '/guests/?fromlink')
    //         });
    //
    //     }
    // }, [location.search]);

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
            !ONBOARDING_EXCLUDED.includes(location.pathname) &&
            !location.pathname.includes('events')
        ) {
            if (
                location.search.includes('eventId')
            ) {
                APIGetEvents().then((res) => {
                    const event = res.data.filter((event) =>
                        event.restaurants.filter((restaurant) => {
                                console.log('restaurant.dates[0].id: ', restaurant)
                                return restaurant.dates[0].id.toString() === location.search.slice(location.search.lastIndexOf('_') + 1)
                            }
                        )
                    );
                    navigate('/events/' + event[0].name + '/restaurant/' + event[0].restaurants[0].id + '/guests/?fromlink')
                });
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
        // if (
        //     location.search.includes('eventId')
        // ) {
        //     const event = events.filter((event) =>
        //         event.restaurants.filter((restaurant) => {
        //                 console.log('restaurant.dates[0].id: ', restaurant)
        //                 return restaurant.dates[0].id.toString() === location.search.slice(location.search.lastIndexOf('_') + 1)
        //             }
        //         )
        //     );
        //     console.log('event: ', event);
        //     navigate('/events/' + event[0].name + '/restaurant/' + event[0].restaurants[0].title + '/guests/')
        // }
    }, [auth, user, location.pathname, location.search]);

    return <></>;
};
