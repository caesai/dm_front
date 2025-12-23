import React, { useCallback, useEffect, useState } from 'react';
import { Navigate, Route, Routes, BrowserRouter } from 'react-router-dom';
import { swipeBehavior, useLaunchParams } from '@telegram-apps/sdk-react';
import { AppRoot } from '@telegram-apps/telegram-ui';
import { useAtom } from 'jotai';
import { ScrollToTop } from '@/navigation/utills.tsx';
// API's
import { APIGetRestaurantsList } from '@/api/restaurants.api.ts';
import { APIGetCityList } from '@/api/city.api.ts';
import { APIGetCertificates } from '@/api/certificates.api.ts';
import { APIGetGastronomyDishesList } from '@/api/gastronomy.api.ts';
import { APIGetEventsList } from '@/api/events.api.ts';
import { DEV_MODE } from '@/api/base.ts';
// Atoms
import { authAtom, userAtom } from '@/atoms/userAtom.ts';
import { cityListAtom } from '@/atoms/cityListAtom.ts';
import { restaurantsListAtom } from '@/atoms/restaurantsListAtom.ts';
import { certificatesListAtom } from '@/atoms/certificatesListAtom.ts';
import { allGastronomyDishesListAtom } from '@/atoms/dishesListAtom.ts';
import { eventsListAtom } from '@/atoms/eventListAtom.ts';
// Components
import { AppLoadingScreen } from '@/components/AppLoadingScreen/AppLoadingScreen.tsx';
import { EnvUnsupported } from '@/components/EnvUnsupported.tsx';
import { Redirecter } from '@/components/Redirecter/Redirecter.tsx';
import { BannerPopup } from '@/components/BannerPopup/BannerPopup.tsx';
import { Toast } from '@/components/Toast/Toast.tsx';
// Pages
import { IndexPage } from '@/pages/IndexPage/IndexPage.tsx';
import { ProfilePage } from '@/pages/ProfilePage/ProfilePage.tsx';
import { UserProfilePage } from '@/pages/UserProfilePage/UserProfilePage.tsx';
import { UserTicketsPage } from '@/pages/UserTicketsPage/UserTicketsPage.tsx';
import { MyBookingsPage } from '@/pages/MyBookingsPage/MyBookingsPage.tsx';
import { BookingInfoPage } from '@/pages/BookingInfoPage/BookingInfoPage.tsx';
import { RestaurantPage } from '@/pages/RestaurantPage/RestaurantPage.tsx';
import { BookingPage } from '@/pages/BookingPage/BookingPage.tsx';
import { BookingConfirmationPage } from '@/pages/BookingConfirmationPage/BookingConfirmationPage.tsx';
import { RestaurantMapPage } from '@/pages/RestaurantMapPage/RestaurantMapPage.tsx';
import { EventsListPage } from '@/pages/EventsPage/EventsListPage/EventsListPage.tsx';
import { EventsPage } from '@/pages/EventsPage/EventsPage.tsx';
import { EventDetailsPage } from '@/pages/EventsPage/EventDetailsPage/EventDetailsPage.tsx';
import { EventBookingPage } from '@/pages/EventsPage/EventBookingPage/EventBookingPage.tsx';
import { PaymentReturnPage } from '@/pages/PaymentReturnPage/PaymentReturnPage.tsx';
import { TicketInfoPage } from '@/pages/TicketInfoPage/TicketInfoPage.tsx';
import { UserPhoneConfirmationPage } from '@/pages/UserPhoneConfirmation/UserPhoneConfirmationPage.tsx';
import { AdminScannerPage } from '@/pages/AdminScannerPage/AdminScannerPage.tsx';
import { OnboardingPage } from '@/pages/OnboardingPage/OnboardingPage.tsx';
import { StageTwo } from '@/pages/OnboardingPage/stages/StageTwo.tsx';
import { StageThree } from '@/pages/OnboardingPage/stages/StageThree.tsx';
import { EventSuperApplyOutlet } from '@/pages/EventsPage/EventSuperApplyOutlet/EventSuperApplyOutlet.tsx';
import { EventSuperInfoOutlet } from '@/pages/EventsPage/EventSuperInfoOutlet/EventSuperInfoOutlet.tsx';
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
import { AllergiesPage } from '@/pages/AllergiesPage/AllergiesPage.tsx';
import { CertificatesCreatePage } from '@/pages/CertificatesCreatePage/CertificatesCreatePage.tsx';
import { CertificatesCreateOnePage } from '@/pages/CertificatesCreatePage/stages/CertificatesCreateOnePage.tsx';
import { CertificatesCreateTwoPage } from '@/pages/CertificatesCreatePage/stages/CertificatesCreateTwoPage.tsx';
import { CertificatesCreateOnlinePage } from '@/pages/CertificatesCreatePage/stages/CertificatesCreateOnlinePage.tsx';
import { CertificatesListPage } from '@/pages/CertificatesCreatePage/stages/CertificatesListPage.tsx';
import { CertificatesCreateOfflinePage } from '@/pages/CertificatesCreatePage/stages/CertificatesCreateOfflinePage.tsx';
import { BookingRestaurantPage } from '@/pages/BookingRestaurantPage/BookingRestaurantPage.tsx';
import { BookingFreeEventPage } from '@/pages/BookingFreeEventPage/BookingFreeEventPage.tsx';
import { CertificatesPaymentPage } from '@/pages/CertificatesCreatePage/stages/CertificatesPaymentPage.tsx';
import { CertificateLandingPage } from '@/pages/CertificateLanding/CertificateLandingPage.tsx';
import { CertificatesCreateErrorPage } from '@/pages/CertificatesCreatePage/stages/CertificatesCreateErrorPage.tsx';
import { GastronomyPage } from '@/pages/GastronomyPage/GastronomyPage.tsx';
import { GastronomyChooseRestaurantPage } from '@/pages/GastronomyPage/stages/GastronomyChooseRestaurantPage.tsx';
import { GastronomyChooseDishesPage } from '@/pages/GastronomyPage/stages/GastronomyChooseDishesPage.tsx';
import { GastonomyDishDetailsPage } from '@/pages/GastronomyPage/stages/GastronomyDishDetailsPage/GastonomyDishDetailsPage.tsx';
import { GastronomyBasketPage } from '@/pages/GastronomyPage/stages/GastronomyBasketPage/GastronomyBasketPage.tsx';
import { EventPaymentSuccessPage } from '@/pages/EventsPage/EventPaymentSuccessPage.tsx';
import { BanquetAddressPage } from '@/pages/BanquetAddressPage/BanquetAddressPage.tsx';
import { GastronomyOrderPage } from '@/pages/GastronomyPage/stages/GastronomyOrderPage/GastronomyOrderPage.tsx';
import { GastronomyOrdersListPage } from '@/pages/GastronomyPage/stages/GastronomyOrdersListPage/GastronomyOrdersListPage.tsx';
import { RestaurantMenuPage } from '@/pages/RestaurantMenuPage/RestaurantMenuPage.tsx';
import { RestaurantDishDetailsPage } from '@/pages/RestaurantDishDetailsPage/RestaurantDishDetailsPage.tsx';

const AppRouter: React.FC = () => {
    const [user] = useAtom(userAtom);
    const [auth] = useAtom(authAtom);
    const [, setCitiesList] = useAtom(cityListAtom);
    const [, setRestaurantsList] = useAtom(restaurantsListAtom);
    const [, setCertificatesList] = useAtom(certificatesListAtom);
    const [, setAllGastronomyDishesList] = useAtom(allGastronomyDishesListAtom);
    const [, setEventsList] = useAtom(eventsListAtom);

    const [loadingComplete, setLoadingComplete] = useState<boolean>();

    /**
     * Загружает начальные данные приложения.
     *
     * Выполняет параллельную загрузку следующих данных:
     * - Список городов
     * - Список ресторанов
     * - Список блюд для гастрономии
     * - Список сертификатов пользователя
     * - Список мероприятий
     *
     * После успешной загрузки сохраняет данные в соответствующие атомы Jotai.
     * Экран загрузки скрывается сразу после выполнения первого запроса,
     * остальные данные подгружаются в фоновом режиме.
     * Функция выполняется только один раз при наличии токена авторизации.
     * 
     * Все 5 запросов запускаются параллельно
     * Как только любой из них завершается (успешно или с ошибкой) — экран загрузки скрывается
     * Данные из каждого запроса сохраняются в атомы по мере их поступления
     *
     * @returns {Promise<void>} Промис, который разрешается после завершения загрузки данных
     * @throws Логирует ошибку в консоль при неудачной загрузке
     */
    const loadApplicationData = useCallback(async () => {
        if (!loadingComplete && auth?.access_token) {
            const completeLoading = () => setLoadingComplete(true);

            APIGetCityList()
                .then((cities) => setCitiesList(cities.data))
                .catch(console.error)
                .finally(completeLoading);

            APIGetRestaurantsList(auth.access_token)
                .then((restaurants) => setRestaurantsList(restaurants.data))
                .catch(console.error)
                .finally(completeLoading);

            APIGetGastronomyDishesList(auth.access_token)
                .then((dishes) => setAllGastronomyDishesList(dishes.data))
                .catch(console.error)
                .finally(completeLoading);

            APIGetCertificates(auth.access_token, Number(user?.id))
                .then((certificates) => setCertificatesList(certificates.data))
                .catch(console.error)
                .finally(completeLoading);

            APIGetEventsList(auth.access_token)
                .then((events) => setEventsList(events.data))
                .catch(console.error)
                .finally(completeLoading);
        }
    }, [loadingComplete, auth?.access_token, user?.id]);

    useEffect(() => {
        loadApplicationData();
    }, [loadApplicationData]);
    
    return (
        <BrowserRouter basename={!DEV_MODE ? undefined : '/dm_front/'}>
            <ScrollToTop />
            <BannerPopup />
            <Redirecter />
            <Toast />
            {!loadingComplete ? (
                <AppLoadingScreen />
            ) : (
                <Routes>
                    <Route path={'/'} element={<IndexPage />} />
                    {/* Страница карты ресторанов */}
                    <Route path={'/map'} element={<RestaurantMapPage />} />
                    {/* Страница профиля */}
                    <Route path={'/profile'} element={<ProfilePage />} />
                    {/* Страница профиля пользователя */}
                    <Route path={'/me'} element={<UserProfilePage />} />
                    {/* Страница аллергий */}
                    <Route path={'/me/allergies'} element={<AllergiesPage />} />
                    {/* Мероприятия */}
                    <Route path={'/events'} element={<EventsPage />}>
                        {/* Страница списка мероприятий */}
                        <Route path={'/events'} element={<EventsListPage />} />
                        {/* Страница деталей мероприятия */}
                        <Route path={'/events/:eventId/details'} element={<EventDetailsPage />} />
                        {/* Страница бронирования мероприятия */}
                        <Route path={'/events/:eventId/confirm'} element={<EventBookingPage />} />
                        {/* Страница успешной оплаты мероприятия */}
                        <Route path={'/events/payment-success/:orderId'} element={<EventPaymentSuccessPage />} />
                        {/* Страница ошибки оплаты мероприятия */}
                        {/* <Route path={'/events/payment-error/:orderId'} element={<EventPaymentErrorPage />} /> */}
                        {/* Страница информации о супер-мероприятии */}
                        <Route path={'/events/super'} element={<EventSuperInfoOutlet />} />
                        {/* Страница заявки на супер-мероприятие */}
                        <Route path={'/events/super/apply'} element={<EventSuperApplyOutlet />} />
                    </Route>
                    {/* Бронирование мероприятия */}
                    <Route path={'/events/:id/booking'} element={<BookingFreeEventPage />} />
                    {/* Мои билеты */}
                    <Route path={'/tickets'} element={<UserTicketsPage />} />
                    {/* Информация о билете */}
                    <Route path={'/tickets/:id'} element={<TicketInfoPage />} />
                    {/* Мои бронирования */}
                    <Route path={'/myBookings'} element={<MyBookingsPage />} />
                    {/* Информация о бронировании */}
                    <Route path={'/myBookings/:id'} element={<BookingInfoPage />} />
                    {/* Страница ресторана */}
                    <Route path={'/restaurant/:id'} element={<RestaurantPage />} />
                    {/* Бронирование ресторана */}
                    <Route path={'/restaurant/:id/booking'} element={<BookingRestaurantPage />} />
                    {/* Меню ресторана */}
                    <Route path={'/restaurant/:id/menu'} element={<RestaurantMenuPage />} />
                    {/* Страница деталей блюда */}
                    <Route path={'/restaurant/:id/menu/dish/:dishId'} element={<RestaurantDishDetailsPage />} />
                    {/* Бронирование столика */}
                    <Route path={'/booking'} element={<BookingPage />} />
                    {/* Подтверждение бронирования */}
                    <Route path={'/bookingConfirmation'} element={<BookingConfirmationPage />} />
                    {/* Неподдерживаемая среда */}
                    <Route path={'/unsupported'} element={<EnvUnsupported />} />
                    {/* Возврат платежа */}
                    <Route path={'/paymentReturn'} element={<PaymentReturnPage />} />
                    {/* Подтверждение телефона */}
                    <Route path={'/phoneConfirmation'} element={<UserPhoneConfirmationPage />} />
                    {/* Сканнер */}
                    <Route path={'/scanner'} element={<AdminScannerPage />} />
                    {/* Онбординг */}
                    <Route path={'/onboarding'} element={<OnboardingPage />}>
                        <Route path={'/onboarding/1'} element={<StageOne />} />
                        <Route path={'/onboarding/2'} element={<StageTwo />} />
                        <Route path={'/onboarding/3'} element={<StageThree />} />
                        <Route path={'/onboarding/4'} element={<StageFour />} />
                    </Route>
                    {/* Предпочтения */}
                    <Route path={'/preferences'} element={<PreferencesPage />}>
                        <Route path={'/preferences/1'} element={<PreferencesOne />} />
                        <Route path={'/preferences/2'} element={<PreferencesTwo />} />
                        <Route path={'/preferences/3'} element={<PreferencesThree />} />
                    </Route>
                    {/* Банкеты */}
                    {/* Страница выбора ресторана для банкета */}
                    <Route path={'banquets/:id/address'} element={<BanquetAddressPage />} />
                    {/* Выбор опций банкета */}
                    <Route path={'banquets/:id/choose'} element={<ChooseBanquetOptionsPage />} />
                    {/* Страница опции банкета */}
                    <Route path={'banquets/:id/option'} element={<BanquetOptionPage />} />
                    {/* Страница дополнительных услуг */}
                    <Route path={'banquets/:id/additional-services'} element={<BanquetAdditionalServicesPage />} />
                    {/* Страница бронирования банкета */}
                    <Route path={'banquets/:id/reservation'} element={<BanquetReservationPage />} />

                    {/* Сертификаты */}
                    {/* Страница создания сертификата */}
                    <Route path={'/certificates'} element={<CertificatesCreatePage />}>
                        {/* Страница выбора типа сертификата */}
                        <Route path={'/certificates/1'} element={<CertificatesCreateOnePage />} />
                        {/* Страница выбора типа сертификата */}
                        <Route path={'/certificates/2'} element={<CertificatesCreateTwoPage />} />
                        {/* Страница онлайн-сертификата */}
                        <Route path={'/certificates/online'} element={<CertificatesCreateOnlinePage />} />
                        <Route path={'/certificates/offline'} element={<CertificatesCreateOfflinePage />} />
                        {/* Страница моих сертификатов */}
                        <Route path={'/certificates/my'} element={<CertificatesListPage />} />
                        {/* Страница оплаты сертификата */}
                        <Route path={'/certificates/payment'} element={<CertificatesPaymentPage />} />
                        {/* Страница ошибки при создании сертификата */}
                        <Route path={'/certificates/error'} element={<CertificatesCreateErrorPage />} />
                    </Route>
                    {/* Страница сертификата */}
                    <Route path={'/certificates/landing/:id'} element={<CertificateLandingPage />} />

                    {/* Гастрономия */}
                    <Route path={'/gastronomy'} element={<GastronomyPage />}>
                        {/* Страница выбора ресторана для гастрономии */}
                        <Route path={'/gastronomy/choose'} element={<GastronomyChooseRestaurantPage />} />
                        {/* Страница выбора блюд для гастрономии */}
                        <Route path={'/gastronomy/:res_id'} element={<GastronomyChooseDishesPage />} />
                        {/* Страница деталей блюда */}
                        <Route path={'/gastronomy/:res_id/dish/:dish_id'} element={<GastonomyDishDetailsPage />} />
                        {/* Страница корзины */}
                        <Route path={'/gastronomy/:res_id/basket'} element={<GastronomyBasketPage />} />
                        {/* Страница моих заказов */}
                        <Route path={'/gastronomy/my'} element={<GastronomyOrdersListPage />} />
                    </Route>
                    {/* Страница заказа гастрономии */}
                    <Route path={'/gastronomy/order/:order_id'} element={<GastronomyOrderPage />} />

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
        <AppRoot appearance={'light'} platform={['macos', 'ios'].includes(lp.tgWebAppPlatform) ? 'ios' : 'base'}>
            {!userState ? <AppLoadingScreen /> : <AppRouter />}
        </AppRoot>
    );
}
