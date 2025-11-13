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
import { RestaurantMapPage } from '@/pages/RestaurantMapPage/RestaurantMapPage.tsx';
import { EventListOutlet } from '@/pages/EventsPage/EventListOutlet/EventListOutlet.tsx';
import { EventsPage } from '@/pages/EventsPage/EventsPage.tsx';
import { EventConfirmationOutlet } from '@/pages/EventsPage/EventConfirmationOutlet/EventConfirmationOutlet.tsx';
import { EventBookingOutlet } from '@/pages/EventsPage/EventBookingOutlet/EventBookingOutlet.tsx';
import { PaymentReturnPage } from '@/pages/PaymentReturnPage/PaymentReturnPage.tsx';
import { TicketInfoPage } from '@/pages/TicketInfoPage/TicketInfoPage.tsx';
import { Redirecter } from '@/components/Redirecter/Redirecter.tsx';
import { UserPhoneConfirmationPage } from '@/pages/UserPhoneConfirmation/UserPhoneConfirmationPage.tsx';
import { AdminScannerPage } from '@/pages/AdminScannerPage/AdminScannerPage.tsx';
import { OnboardingPage } from '@/pages/OnboardingPage/OnboardingPage.tsx';
import { StageTwo } from '@/pages/OnboardingPage/stages/StageTwo.tsx';
import { StageThree } from '@/pages/OnboardingPage/stages/StageThree.tsx';
import { BannerPopup } from '@/components/BannerPopup/BannerPopup.tsx';
import { EventSuperApplyOutlet } from '@/pages/EventsPage/EventSuperApplyOutlet/EventSuperApplyOutlet.tsx';
import { EventSuperInfoOutlet } from '@/pages/EventsPage/EventSuperInfoOutlet/EventSuperInfoOutlet.tsx';
import { NewRestaurant } from '@/pages/NewRestaurant/NewRestaurant.tsx';
import { ChooseBanquetOptionsPage } from '@/pages/ChooseBanquetOptionsPage/ChooseBanquetOptionsPage.tsx';
import { BanquetOptionPage } from '@/pages/BanquetOptionPage/BanquetOptionPage.tsx';
import { BanquetAdditionalServicesPage } from '@/pages/BanquetAdditionalServices/BanquetAdditionalServicesPage.tsx';
import { BanquetReservationPage } from '@/pages/BanquetReservationPage/BanquetReservationPage.tsx';
import { StageFour } from '@/pages/OnboardingPage/stages/StageFour.tsx';
import { PreferencesThree } from '@/pages/PreferencesPage/stages/PreferencesThree.tsx';
import { PreferencesOne } from '@/pages/PreferencesPage/stages/PreferencesOne.tsx';
import { PreferencesTwo } from '@/pages/PreferencesPage/stages/PreferencesTwo.tsx';
import { PreferencesPage } from '@/pages/PreferencesPage/PreferencesPage.tsx';
import { StageOne } from '@/pages/OnboardingPage/stages/StageOne.tsx';
import AllergiesPage from '@/pages/AllergiesPage/AllergiesPage.tsx';
import { CertificatesCreatePage } from '@/pages/CertificatesCreatePage/CertificatesCreatePage.tsx';
import { CertificatesCreateOnePage } from '@/pages/CertificatesCreatePage/stages/CertificatesCreateOnePage.tsx';
import { CertificatesCreateTwoPage } from '@/pages/CertificatesCreatePage/stages/CertificatesCreateTwoPage.tsx';
import { CertificatesCreateOnlinePage } from '@/pages/CertificatesCreatePage/stages/CertificatesCreateOnlinePage.tsx';
import { CertificatesListPage } from '@/pages/CertificatesCreatePage/stages/CertificatesListPage.tsx';
import { CertificatesCreateOfflinePage } from '@/pages/CertificatesCreatePage/stages/CertificatesCreateOfflinePage.tsx';
import { BookingRestaurantPage } from '@/pages/BookingRestaurantPage/BookingRestaurantPage.tsx';
import { BookingFreeEventPage } from '@/pages/BookingFreeEventPage/BookingFreeEventPage.tsx';
import { APIGetCertificates } from '@/api/certificates.api.ts';
import { certificatesListAtom } from '@/atoms/certificatesListAtom.ts';
import { CertificatesPaymentPage } from '@/pages/CertificatesCreatePage/stages/CertificatesPaymentPage.tsx';
import CertificateLandingPage from '@/pages/CertificateLanding/CertificateLandingPage.tsx';
import { CertificatesCreateErrorPage } from '@/pages/CertificatesCreatePage/stages/CertificatesCreateErrorPage.tsx';

const AppRouter = () => {
    const [user] = useAtom(userAtom);
    const [auth] = useAtom(authAtom);
    const [cities, setCities] = useAtom(cityListAtom);
    const [restaurants, setRestaurants] = useAtom(restaurantsListAtom);
    const [, setCertificates] = useAtom(certificatesListAtom);
    // const [earlyAccess, setEarlyAccess] = useState(true);
    const [loadingComplete, setLoadingComplete] = useState<boolean>();
    const [, setReview] = useAtom(reviewAtom);

    // Auth and preloading
    useEffect(() => {
        if (!loadingComplete && auth?.access_token) {
            APIGetCityList()
                .then((res) => setCities(res.data));
            APIGetRestaurants(auth.access_token)
                .then((res) => setRestaurants(res.data));
        }
    }, [loadingComplete]);

    useEffect(() => {
        if (auth?.access_token) {
            APIGetCertificates(auth?.access_token, Number(user?.id))
                .then(response => setCertificates(response.data));
        }
    }, [auth]);

    useEffect(() => {
        if (auth?.access_token)
            APIIsReviewAvailable(auth.access_token)
                .then((res) =>
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
            <BannerPopup />
            <Redirecter />
            {
                !loadingComplete ? (
                <AppLoadingScreen />
            ) : (
                <Routes>
                    <Route path={'/'} element={<IndexPage />} />
                    <Route path={'/map'} element={<RestaurantMapPage />} />
                    <Route path={'/profile'} element={<ProfilePage />} />
                    <Route path={'/me'} element={<UserProfilePage />} />
                        <Route path={'/me/allergies'} element={<AllergiesPage />} />
                    <Route path={'/events'} element={<EventsPage />}>
                        <Route path={'/events'} element={<EventListOutlet />} />
                        <Route
                            path={'/events/:eventId'}
                            element={<EventConfirmationOutlet />}
                        />
                        <Route
                            path={'/events/:eventId/confirm'}
                            element={<EventBookingOutlet />}
                        />
                        <Route
                            path={'/events/super'}
                            element={<EventSuperInfoOutlet />}
                        />
                        <Route
                            path={'/events/super/apply'}
                            element={<EventSuperApplyOutlet />}
                        />
                    </Route>
                    <Route path={'/events/:id/booking'} element={<BookingFreeEventPage />} />
                    <Route path={'/tickets'} element={<UserTicketsPage />} />
                    <Route path={'/tickets/:id'} element={<TicketInfoPage />} />
                    <Route path={'/myBookings'} element={<MyBookingsPage />} />
                    <Route
                        path={'/myBookings/:id'}
                        element={<BookingInfoPage />}
                    />
                    <Route path={'/restaurant/:id'} element={<Restaurant />} />
                    <Route path={'/restaurant/:id/booking'} element={<BookingRestaurantPage />} />
                    <Route path={'/newrestaurant'} element={<NewRestaurant />} />
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
                        <Route path={'/onboarding/3'} element={<StageThree />} />
                        <Route path={'/onboarding/4'} element={<StageFour />} />
                    </Route>
                    <Route path={'/preferences'} element={<PreferencesPage/>}>
                        <Route path={'/preferences/1'} element={<PreferencesOne />} />
                        <Route path={'/preferences/2'} element={<PreferencesTwo />} />
                        <Route path={'/preferences/3'} element={<PreferencesThree />} />
                    </Route>
                    <Route path={'banquets/:id/choose'} element={<ChooseBanquetOptionsPage />} />
                    <Route path={'banquets/:id/option'} element={<BanquetOptionPage />} />
                    <Route path={'banquets/:id/additional-services'} element={<BanquetAdditionalServicesPage />} />
                    <Route path={'banquets/:id/reservation'} element={<BanquetReservationPage />} />

                    <Route path={'/certificates'} element={<CertificatesCreatePage />}>
                        <Route path={'/certificates/1'} element={<CertificatesCreateOnePage />} />
                        <Route path={'/certificates/2'} element={<CertificatesCreateTwoPage />} />
                        <Route path={'/certificates/online'} element={<CertificatesCreateOnlinePage />} />
                        <Route path={'/certificates/offline'} element={<CertificatesCreateOfflinePage />} />
                        <Route path={'/certificates/my'} element={<CertificatesListPage />} />
                        <Route path={'/certificates/payment'} element={<CertificatesPaymentPage />} />
                        <Route path={'/certificates/error'} element={<CertificatesCreateErrorPage />} />
                    </Route>
                    <Route path={'/certificates/landing/:id'} element={<CertificateLandingPage />} />

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
