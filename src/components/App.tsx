import { swipeBehavior, useLaunchParams } from '@telegram-apps/sdk-react';
import { AppRoot } from '@telegram-apps/telegram-ui';
import { Navigate, Route, Routes, BrowserRouter } from 'react-router-dom';
import { ScrollToTop } from '@/navigation/utills.tsx';
import { useEffect, useState } from 'react';
import { useAtom } from 'jotai';
import { authAtom, reviewAtom, userAtom } from '@/atoms/userAtom.ts';
import { AppLoadingScreen } from '@/components/AppLoadingScreen/AppLoadingScreen.tsx';
import { IndexPage } from '@/pages/IndexPage/IndexPage.tsx';
import { ProfilePage } from '@/pages/ProfilePage/ProfilePage.tsx';
import { UserProfilePage } from '@/pages/UserProfilePage/UserProfilePage.tsx';
import { UserTicketsPage } from '@/pages/UserTicketsPage/UserTicketsPage.tsx';
import { MyBookingsPage } from '@/pages/MyBookingsPage/MyBookingsPage.tsx';
import { BookingInfoPage } from '@/pages/BookingInfoPage/BookingInfoPage.tsx';
import { Restaurant } from '@/pages/Restaurant/Restaurant.tsx';
import { BookingPage } from '@/pages/BookingPage/BookingPage.tsx';
import { BookingConfirmationPage } from '@/pages/BookingConfirmationPage/BookingConfirmationPage.tsx';
import { EnvUnsupported } from '@/components/EnvUnsupported.tsx';
import { cityListAtom } from '@/atoms/cityListAtom.ts';
import { APIGetCityList } from '@/api/city.ts';
import { APIGetRestaurants, APIIsReviewAvailable } from '@/api/restaurants.ts';
import { restaurantsListAtom } from '@/atoms/restaurantsListAtom.ts';
// import { APIGetEA } from '@/api/config.ts';
import { RestaurantMapPage } from '@/pages/RestaurantMapPage/RestaurantMapPage.tsx';
import { EventListOutlet } from '@/pages/EventsPage/EventListOutlet/EventListOutlet.tsx';
import { EventsPage } from '@/pages/EventsPage/EventsPage.tsx';
import { EventInfoOutlet } from '@/pages/EventsPage/EventInfoOutlet/EventInfoOutlet.tsx';
import { RestaurantsListOutlet } from '@/pages/EventsPage/RestaurantsListOutlet/RestaurantsListOutlet.tsx';
import { DTSelectionOutlet } from '@/pages/EventsPage/DTSelectionOutlet/DTSelectionOutlet.tsx';
import { EventConfirmationOutlet } from '@/pages/EventsPage/EventConfirmationOutlet/EventConfirmationOutlet.tsx';
import { EventBookingOutlet } from '@/pages/EventsPage/EventBookingOutlet/EventBookingOutlet.tsx';
import { PaymentReturnPage } from '@/pages/PaymentReturnPage/PaymentReturnPage.tsx';
import { TicketInfoPage } from '@/pages/TicketInfoPage/TicketInfoPage.tsx';
import { Redirecter } from '@/components/Redirecter/Redirecter.tsx';
import { UserPhoneConfirmationPage } from '@/pages/UserPhoneConfirmation/UserPhoneConfirmationPage.tsx';
import { AdminScannerPage } from '@/pages/AdminScannerPage/AdminScannerPage.tsx';
import { OnboardingPage } from '@/pages/OnboardingPage/OnboardingPage.tsx';
import { StageOne } from '@/pages/OnboardingPage/stages/StageOne.tsx';
import { StageTwo } from '@/pages/OnboardingPage/stages/StageTwo.tsx';
// import { StageThree } from '@/pages/OnboardingPage/stages/StageThree.tsx';
import { StageFour } from '@/pages/OnboardingPage/stages/StageFour.tsx';
import { StageFive } from '@/pages/OnboardingPage/stages/StageFive.tsx';
import { StageSix } from '@/pages/OnboardingPage/stages/StageSix.tsx';
import {StageSeven} from "@/pages/OnboardingPage/stages/StageSeven.tsx";

const AppRouter = () => {
    // const [user] = useAtom(userAtom);
    const [auth] = useAtom(authAtom);
    const [cities, setCities] = useAtom(cityListAtom);
    const [restaurants, setRestaurants] = useAtom(restaurantsListAtom);
    // const [earlyAccess, setEarlyAccess] = useState(true);
    const [loadingComplete, setLoadingComplete] = useState<boolean>();
    const [, setReview] = useAtom(reviewAtom);

    // Auth and preloading
    useEffect(() => {
        if (!loadingComplete && auth?.access_token) {
            APIGetCityList().then((res) => setCities(res.data));
            APIGetRestaurants(auth.access_token).then((res) => {
                console.log('restaurants: ', res.data)
                setRestaurants(res.data);
            });
        }
    }, [loadingComplete]);

    // useEffect(() => {
    //     APIGetEA().then((res) => setEarlyAccess(res.data.result));
    // }, []);

    useEffect(() => {
        if (auth?.access_token)
            APIIsReviewAvailable(auth.access_token).then((res) =>
                setReview({
                    loading: false,
                    available: res.data.available,
                })
            );
    }, [auth]);

    useEffect(() => {
        if (!cities.length || !restaurants.length) {
            setLoadingComplete(false);
        }
        if (cities.length && restaurants.length) {
            setLoadingComplete(true);
        }
    }, [cities, restaurants]);

    return (
        <BrowserRouter basename={import.meta.env.MODE !== 'development' ? undefined : '/dm_front/'}>
            <ScrollToTop />
            <Redirecter />
            {
            //     earlyAccess && !user?.early_access ? (
            //     <div>
            //         <span>
            //             Вход в приложение пока доступен только по приглашению
            //         </span>
            //     </div>
            // ) :
                !loadingComplete ? (
                <AppLoadingScreen />
            ) : (
                <Routes>
                    <Route path={'/'} element={<IndexPage />} />
                    <Route path={'/map'} element={<RestaurantMapPage />} />
                    <Route path={'/profile'} element={<ProfilePage />} />
                    <Route path={'/me'} element={<UserProfilePage />} />
                    <Route path={'/events'} element={<EventsPage />}>
                        <Route path={'/events'} element={<EventListOutlet />} />
                        <Route
                            path={'/events/:name'}
                            element={<EventInfoOutlet />}
                        />
                        <Route
                            path={'/events/:name/restaurant'}
                            element={<RestaurantsListOutlet />}
                        />
                        <Route
                            path={'/events/:name/restaurant/:res'}
                            element={<DTSelectionOutlet />}
                        />
                        <Route
                            path={'/events/:name/restaurant/:res/guests'}
                            element={<EventConfirmationOutlet />}
                        />
                        <Route
                            path={'/events/:id/restaurant/:res/confirm'}
                            element={<EventBookingOutlet />}
                        />
                    </Route>
                    <Route path={'/tickets'} element={<UserTicketsPage />} />
                    <Route path={'/tickets/:id'} element={<TicketInfoPage />} />
                    <Route path={'/myBookings'} element={<MyBookingsPage />} />
                    <Route
                        path={'/myBookings/:id'}
                        element={<BookingInfoPage />}
                    />
                    <Route path={'/restaurant/:id'} element={<Restaurant />} />
                    <Route path={'/booking'} element={<BookingPage />} />
                    <Route
                        path={'/bookingConfirmation'}
                        element={<BookingConfirmationPage />}
                    />
                    <Route path={'/unsupported'} element={<EnvUnsupported />} />
                    <Route
                        path={'/paymentReturn'}
                        element={<PaymentReturnPage />}
                    />
                    <Route
                        path={'/phoneConfirmation'}
                        element={<UserPhoneConfirmationPage />}
                    />
                    <Route path={'/scanner'} element={<AdminScannerPage />} />
                    <Route path={'/onboarding'} element={<OnboardingPage />}>
                        <Route path={'/onboarding/1'} element={<StageOne />} />
                        <Route path={'/onboarding/2'} element={<StageTwo />} />
                         {/*<Route path={'/onboarding/3'} element={<StageThree />} />*/}
                        <Route path={'/onboarding/4'} element={<StageFour />} />
                        <Route path={'/onboarding/3'} element={<StageFive />} />
                        <Route path={'/onboarding/5'} element={<StageSix />} />
                        <Route path={'/onboarding/6'} element={<StageSeven />} />
                    </Route>

                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            )}
        </BrowserRouter>
    );
};

export function App() {
    const lp = useLaunchParams();
    useEffect(() => {
        swipeBehavior.mount();
    }, []);
    const [userState] = useAtom(userAtom);
    return (
        <AppRoot
            appearance={'light'}
            platform={
                ['macos', 'ios'].includes(lp.tgWebAppPlatform) ? 'ios' : 'base'
            }
        >
            {!userState ? <AppLoadingScreen /> : <AppRouter />}
        </AppRoot>
    );
}
