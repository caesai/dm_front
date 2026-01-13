import React, { useEffect, useState, lazy, Suspense } from 'react';
import { Navigate, Route, Routes, BrowserRouter } from 'react-router-dom';
import { swipeBehavior, useLaunchParams } from '@telegram-apps/sdk-react';
import { AppRoot } from '@telegram-apps/telegram-ui';
import { useAtomValue } from 'jotai';
import { ScrollToTop } from '@/navigation/utills.tsx';
// API's
import { DEV_MODE } from '@/api/base.ts';
// Atoms
import { authAtom, userAtom } from '@/atoms/userAtom.ts';
// Hooks
import { useDataLoader } from '@/hooks/useDataLoader.ts';
// Components
import { AppLoadingScreen, Loader } from '@/components/AppLoadingScreen/AppLoadingScreen.tsx';
import { EnvUnsupported } from '@/components/EnvUnsupported.tsx';
import { Redirecter } from '@/components/Redirecter/Redirecter.tsx';
import { BannerPopup } from '@/components/BannerPopup/BannerPopup.tsx';
import { Toast } from '@/components/Toast/Toast.tsx';

// ============================================================================
// КРИТИЧНЫЕ СТРАНИЦЫ (синхронный импорт для быстрого First Contentful Paint)
// ============================================================================
import { IndexPage } from '@/pages/IndexPage/IndexPage.tsx';

// ============================================================================
// LAZY LOADED СТРАНИЦЫ (загружаются по требованию)
// ============================================================================

// Профиль
const ProfilePage = lazy(() => import('@/pages/ProfilePage/ProfilePage.tsx').then(m => ({ default: m.ProfilePage })));
const UserProfilePage = lazy(() => import('@/pages/UserProfilePage/UserProfilePage.tsx').then(m => ({ default: m.UserProfilePage })));
const AllergiesPage = lazy(() => import('@/pages/AllergiesPage/AllergiesPage.tsx').then(m => ({ default: m.AllergiesPage })));

// Билеты и бронирования
const UserTicketsPage = lazy(() => import('@/pages/UserTicketsPage/UserTicketsPage.tsx').then(m => ({ default: m.UserTicketsPage })));
const TicketInfoPage = lazy(() => import('@/pages/TicketInfoPage/TicketInfoPage.tsx').then(m => ({ default: m.TicketInfoPage })));
const MyBookingsPage = lazy(() => import('@/pages/MyBookingsPage/MyBookingsPage.tsx').then(m => ({ default: m.MyBookingsPage })));
const BookingInfoPage = lazy(() => import('@/pages/BookingInfoPage/BookingInfoPage.tsx').then(m => ({ default: m.BookingInfoPage })));

// Рестораны
const RestaurantPage = lazy(() => import('@/pages/RestaurantPage/RestaurantPage.tsx').then(m => ({ default: m.RestaurantPage })));
const RestaurantMapPage = lazy(() => import('@/pages/RestaurantMapPage/RestaurantMapPage.tsx').then(m => ({ default: m.RestaurantMapPage })));
const RestaurantMenuPage = lazy(() => import('@/pages/RestaurantMenuPage/RestaurantMenuPage.tsx').then(m => ({ default: m.RestaurantMenuPage })));
const RestaurantDishDetailsPage = lazy(() => import('@/pages/RestaurantDishDetailsPage/RestaurantDishDetailsPage.tsx').then(m => ({ default: m.RestaurantDishDetailsPage })));

// Бронирование
const BookingPage = lazy(() => import('@/pages/BookingPage/BookingPage.tsx').then(m => ({ default: m.BookingPage })));
const BookingConfirmationPage = lazy(() => import('@/pages/BookingConfirmationPage/BookingConfirmationPage.tsx').then(m => ({ default: m.BookingConfirmationPage })));
const RestaurantBookingPage = lazy(() => import('@/pages/BookingPage/RestaurantBookingPage.tsx').then(m => ({ default: m.RestaurantBookingPage })));
const EventBookingPage = lazy(() => import('@/pages/BookingPage/EventBookingPage.tsx').then(m => ({ default: m.EventBookingPage })));

// Мероприятия
const EventsListPage = lazy(() => import('@/pages/EventsPage/EventsListPage.tsx').then(m => ({ default: m.EventsListPage })));
const EventDetailsPage = lazy(() => import('@/pages/EventsPage/EventDetailsPage.tsx').then(m => ({ default: m.EventDetailsPage })));
const EventPurchasePage = lazy(() => import('@/pages/EventsPage/EventPurchasePage.tsx').then(m => ({ default: m.EventPurchasePage })));
const EventPaymentSuccessPage = lazy(() => import('@/pages/EventsPage/EventPaymentSuccessPage.tsx').then(m => ({ default: m.EventPaymentSuccessPage })));

// Платежи
const PaymentReturnPage = lazy(() => import('@/pages/PaymentReturnPage/PaymentReturnPage.tsx').then(m => ({ default: m.PaymentReturnPage })));

// Онбординг
const OnboardingPage = lazy(() => import('@/pages/OnboardingPage/OnboardingPage.tsx').then(m => ({ default: m.OnboardingPage })));
const StageOne = lazy(() => import('@/pages/OnboardingPage/stages/StageOne.tsx').then(m => ({ default: m.StageOne })));
const StageTwo = lazy(() => import('@/pages/OnboardingPage/stages/StageTwo.tsx').then(m => ({ default: m.StageTwo })));
const StageThree = lazy(() => import('@/pages/OnboardingPage/stages/StageThree.tsx').then(m => ({ default: m.StageThree })));
const StageFour = lazy(() => import('@/pages/OnboardingPage/stages/StageFour.tsx').then(m => ({ default: m.StageFour })));
const UserPhoneConfirmationPage = lazy(() => import('@/pages/UserPhoneConfirmation/UserPhoneConfirmationPage.tsx').then(m => ({ default: m.UserPhoneConfirmationPage })));

// Предпочтения
const PreferencesPage = lazy(() => import('@/pages/PreferencesPage/PreferencesPage.tsx').then(m => ({ default: m.PreferencesPage })));
const PreferencesOne = lazy(() => import('@/pages/PreferencesPage/stages/PreferencesOne.tsx').then(m => ({ default: m.PreferencesOne })));
const PreferencesTwo = lazy(() => import('@/pages/PreferencesPage/stages/PreferencesTwo.tsx').then(m => ({ default: m.PreferencesTwo })));
const PreferencesThree = lazy(() => import('@/pages/PreferencesPage/stages/PreferencesThree.tsx').then(m => ({ default: m.PreferencesThree })));

// Банкеты
const BanquetAddressPage = lazy(() => import('@/pages/BanquetAddressPage/BanquetAddressPage.tsx').then(m => ({ default: m.BanquetAddressPage })));
const ChooseBanquetOptionsPage = lazy(() => import('@/pages/ChooseBanquetOptionsPage/ChooseBanquetOptionsPage.tsx').then(m => ({ default: m.ChooseBanquetOptionsPage })));
const BanquetOptionPage = lazy(() => import('@/pages/BanquetOptionPage/BanquetOptionPage.tsx').then(m => ({ default: m.BanquetOptionPage })));
const BanquetAdditionalServicesPage = lazy(() => import('@/pages/BanquetAdditionalServices/BanquetAdditionalServicesPage.tsx').then(m => ({ default: m.BanquetAdditionalServicesPage })));
const BanquetReservationPage = lazy(() => import('@/pages/BanquetReservationPage/BanquetReservationPage.tsx').then(m => ({ default: m.BanquetReservationPage })));

// Сертификаты
const CertificatesCreatePage = lazy(() => import('@/pages/CertificatesCreatePage/CertificatesCreatePage.tsx').then(m => ({ default: m.CertificatesCreatePage })));
const CertificatesCreateOnePage = lazy(() => import('@/pages/CertificatesCreatePage/stages/CertificatesCreateOnePage.tsx').then(m => ({ default: m.CertificatesCreateOnePage })));
const CertificatesCreateTwoPage = lazy(() => import('@/pages/CertificatesCreatePage/stages/CertificatesCreateTwoPage.tsx').then(m => ({ default: m.CertificatesCreateTwoPage })));
const CertificatesCreateOnlinePage = lazy(() => import('@/pages/CertificatesCreatePage/stages/CertificatesCreateOnlinePage.tsx').then(m => ({ default: m.CertificatesCreateOnlinePage })));
const CertificatesCreateOfflinePage = lazy(() => import('@/pages/CertificatesCreatePage/stages/CertificatesCreateOfflinePage.tsx').then(m => ({ default: m.CertificatesCreateOfflinePage })));
const CertificatesListPage = lazy(() => import('@/pages/CertificatesCreatePage/stages/CertificatesListPage.tsx').then(m => ({ default: m.CertificatesListPage })));
const CertificatesPaymentPage = lazy(() => import('@/pages/CertificatesCreatePage/stages/CertificatesPaymentPage.tsx').then(m => ({ default: m.CertificatesPaymentPage })));
const CertificatesCreateErrorPage = lazy(() => import('@/pages/CertificatesCreatePage/stages/CertificatesCreateErrorPage.tsx').then(m => ({ default: m.CertificatesCreateErrorPage })));
const CertificateLandingPage = lazy(() => import('@/pages/CertificateLanding/CertificateLandingPage.tsx').then(m => ({ default: m.CertificateLandingPage })));

// Гастрономия
const GastronomyPage = lazy(() => import('@/pages/GastronomyPage/GastronomyPage.tsx').then(m => ({ default: m.GastronomyPage })));
const GastronomyChooseRestaurantPage = lazy(() => import('@/pages/GastronomyPage/stages/GastronomyChooseRestaurantPage.tsx').then(m => ({ default: m.GastronomyChooseRestaurantPage })));
const GastronomyChooseDishesPage = lazy(() => import('@/pages/GastronomyPage/stages/GastronomyChooseDishesPage.tsx').then(m => ({ default: m.GastronomyChooseDishesPage })));
const GastonomyDishDetailsPage = lazy(() => import('@/pages/GastronomyPage/stages/GastronomyDishDetailsPage/GastonomyDishDetailsPage.tsx').then(m => ({ default: m.GastonomyDishDetailsPage })));
const GastronomyBasketPage = lazy(() => import('@/pages/GastronomyPage/stages/GastronomyBasketPage/GastronomyBasketPage.tsx').then(m => ({ default: m.GastronomyBasketPage })));
const GastronomyOrdersListPage = lazy(() => import('@/pages/GastronomyPage/stages/GastronomyOrdersListPage/GastronomyOrdersListPage.tsx').then(m => ({ default: m.GastronomyOrdersListPage })));
const GastronomyOrderPage = lazy(() => import('@/pages/GastronomyPage/stages/GastronomyOrderPage/GastronomyOrderPage.tsx').then(m => ({ default: m.GastronomyOrderPage })));

// Hospitality Heroes & Privilege
const HospitalityHeroesPage = lazy(() => import('@/pages/HospitalityHeroesPage/HospitalityHeroesPage.tsx').then(m => ({ default: m.HospitalityHeroesPage })));
const HospitalityHeroesApplicationFormPage = lazy(() => import('@/pages/HospitalityHeroesPage/HospitalityHeroesApplicationFormPage.tsx').then(m => ({ default: m.HospitalityHeroesApplicationFormPage })));
const PrivilegePage = lazy(() => import('@/pages/PrivilegePage/PrivilegePage.tsx').then(m => ({ default: m.PrivilegePage })));

// Админ
const AdminScannerPage = lazy(() => import('@/pages/AdminScannerPage/AdminScannerPage.tsx').then(m => ({ default: m.AdminScannerPage })));

/**
 * Компонент-обёртка для отображения загрузки при lazy loading страниц.
 */
const PageLoader: React.FC = () => (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Loader />
    </div>
);

/**
 * Компонент маршрутизации приложения.
 *
 * Обеспечивает маршрутизацию между страницами приложения.
 *
 * @component
 * @returns {JSX.Element} Компонент маршрутизации приложения
 */
const AppRouter: React.FC = (): JSX.Element => {
    const auth = useAtomValue(authAtom);
    const [loadingComplete, setLoadingComplete] = useState<boolean>(false);

    const { loadCriticalData, loadBackgroundData, hasCachedCriticalData } = useDataLoader();

    /**
     * Загружает начальные данные приложения с приоритизацией.
     *
     * Стратегия загрузки:
     * 1. Если есть кэш — мгновенно показываем UI, обновляем данные в фоне
     * 2. Если нет кэша — ждём загрузки критичных данных
     * 3. Фоновые данные (события) — загружаются после показа UI
     *
     * Это обеспечивает:
     * - Мгновенное отображение UI при наличии кэша
     * - Минимальное время до интерактивности
     * - Снижение нагрузки на сеть и сервер
     */
    useEffect(() => {
        if (!auth?.access_token || loadingComplete) {
            return;
        }

        const loadData = async () => {
            // Проверяем наличие кэша и сразу показываем UI если есть
            const hasCache = hasCachedCriticalData();
            
            if (hasCache) {
                // Мгновенно показываем UI с кэшированными данными
                setLoadingComplete(true);
                // Обновляем данные в фоне
                loadCriticalData();
            } else {
                // Нет кэша — ждём загрузки
                await loadCriticalData();
                setLoadingComplete(true);
            }

            // Загружаем фоновые данные
            loadBackgroundData();
        };

        loadData();
    }, [auth?.access_token, loadingComplete, loadCriticalData, loadBackgroundData, hasCachedCriticalData]);

    return (
        <BrowserRouter basename={!DEV_MODE ? undefined : '/dm_front/'}>
            <ScrollToTop />
            <BannerPopup />
            <Toast />
            {!loadingComplete ? (
                <AppLoadingScreen />
            ) : (
                <Redirecter>
                    <Suspense fallback={<PageLoader />}>
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
                            {/* Страница списка мероприятий */}
                            <Route path={'/events'} element={<EventsListPage />} />
                            {/* Страница деталей мероприятия */}
                            <Route path={'/events/:eventId/details'} element={<EventDetailsPage />} />
                            {/* Страница покупки билета на мероприятие */}
                            <Route path={'/events/:eventId/purchase'} element={<EventPurchasePage />} />
                            {/* Страница успешной оплаты билета на мероприятие */}
                            <Route path={'/events/payment-success/:orderId'} element={<EventPaymentSuccessPage />} />
                            {/* Бронирование мероприятия */}
                            <Route path={'/events/:eventId/booking'} element={<EventBookingPage />} />

                            {/* Страница Hospitality Heroes */}
                            <Route path={'/hospitality-heroes'} element={<HospitalityHeroesPage />} />
                            <Route
                                path={'/hospitality-heroes/application'}
                                element={<HospitalityHeroesApplicationFormPage />}
                            />
                            {/* Страница привилегий */}
                            <Route path={'/privilege'} element={<PrivilegePage />} />
                            {/* Мои билеты */}
                            <Route path={'/tickets'} element={<UserTicketsPage />} />
                            {/* Информация о билете */}
                            <Route path={'/tickets/:id'} element={<TicketInfoPage />} />
                            {/* Мои бронирования */}
                            <Route path={'/myBookings'} element={<MyBookingsPage />} />
                            {/* Информация о бронировании */}
                            <Route path={'/myBookings/:id'} element={<BookingInfoPage />} />

                            {/* Страница ресторана */}
                            <Route path={'/restaurant/:restaurantId'} element={<RestaurantPage />} />
                            {/* Бронирование ресторана */}
                            <Route path={'/restaurant/:restaurantId/booking'} element={<RestaurantBookingPage />} />
                            {/* Меню ресторана */}
                            <Route path={'/restaurant/:id/menu'} element={<RestaurantMenuPage />} />
                            {/* Страница деталей блюда */}
                            <Route path={'/restaurant/:id/menu/dish/:dishId'} element={<RestaurantDishDetailsPage />} />

                            {/* Бронирование */}
                            <Route path={'/booking'} element={<BookingPage />} />
                            {/* Подтверждение бронирования */}
                            <Route path={'/bookingConfirmation'} element={<BookingConfirmationPage />} />

                            {/* Неподдерживаемая среда */}
                            <Route path={'/unsupported'} element={<EnvUnsupported />} />

                            {/* Возврат платежа */}
                            <Route path={'/paymentReturn'} element={<PaymentReturnPage />} />
                            
                            {/* Сканнер */}
                            <Route path={'/scanner'} element={<AdminScannerPage />} />

                            {/* Онбординг */}
                            <Route path={'/onboarding'} element={<OnboardingPage />}>
                                <Route path={'/onboarding/1'} element={<StageOne />} />
                                <Route path={'/onboarding/2'} element={<StageTwo />} />
                                <Route path={'/onboarding/3'} element={<StageThree />} />
                                <Route path={'/onboarding/4'} element={<StageFour />} />
                            </Route>
                            {/* Подтверждение телефона */}
                            <Route path={'/phoneConfirmation'} element={<UserPhoneConfirmationPage />} />

                            {/* Предпочтения */}
                            <Route path={'/preferences'} element={<PreferencesPage />}>
                                <Route path={'/preferences/1'} element={<PreferencesOne />} />
                                <Route path={'/preferences/2'} element={<PreferencesTwo />} />
                                <Route path={'/preferences/3'} element={<PreferencesThree />} />
                            </Route>

                            {/* Банкеты */}
                            {/* Страница выбора ресторана для банкета */}
                            <Route path={'banquets/:restaurantId/address'} element={<BanquetAddressPage />} />
                            {/* Выбор опций банкета */}
                            <Route path={'banquets/:restaurantId/choose'} element={<ChooseBanquetOptionsPage />} />
                            {/* Страница опции банкета */}
                            <Route path={'banquets/:restaurantId/option/:optionId'} element={<BanquetOptionPage />} />
                            {/* Страница дополнительных услуг */}
                            <Route path={'banquets/:restaurantId/additional-services/:optionId'} element={<BanquetAdditionalServicesPage />} />
                            {/* Страница бронирования банкета */}
                            <Route path={'banquets/:restaurantId/reservation'} element={<BanquetReservationPage />} />

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
                    </Suspense>
                </Redirecter>
            )}
        </BrowserRouter>
    );
};

/**
 * Компонент приложения.
 *
 * Обеспечивает запуск приложения в Telegram WebApp.
 *
 * @component
 * @returns {JSX.Element} Компонент приложения
 */
export const App: React.FC = (): JSX.Element => {
    // Получаем параметры запуска приложения
    const lp = useLaunchParams();
    // Монтируем поведение свайпа
    useEffect(() => {
        swipeBehavior.mount();
    }, []);
    // Получаем состояние пользователя
    const userState = useAtomValue(userAtom);
    // Возвращаем компонент приложения
    return (
        <AppRoot appearance={'light'} platform={['macos', 'ios'].includes(lp.tgWebAppPlatform) ? 'ios' : 'base'}>
            {!userState ? <AppLoadingScreen /> : <AppRouter />}
        </AppRoot>
    );
};
