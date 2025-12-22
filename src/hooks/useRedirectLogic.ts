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

export const useRedirectLogic = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [user] = useAtom(userAtom);
    const [auth] = useAtom(authAtom);
    const [params] = useSearchParams();
    const state = location?.state;
    const paramsObject = Object.fromEntries(params.entries());

    // Функция для обработки навигации на основе параметров при старте приложения из бота
    // param - это параметр при старте приложения из бота
    // paths - это массив путей, на которые можно перенаправить
    // path - это путь, на который нужно перенаправить
    // id - это id объекта, на который нужно перенаправить
    // navigate - это функция для перенаправления
    const handleNavigation = useCallback(
        (param: string) => {
            const paths = ['restaurant', 'event', 'ticket', 'certificate', 'event_city'];
            // param - это параметр при старте приложения из бота
            const path = param.substring(0, param.indexOf('Id_'));
            if (paths.includes(path)) {
                const id = param.replace(`${path}Id_`, '');
                switch (path) {
                    // Перенаправление на страницу ресторана
                    case 'restaurant':
                        navigate(`/${path}/${id}?shared=true`, { replace: true });
                        break;
                    // Перенаправление на страницу деталей мероприятия
                    case 'event':
                        navigate(`/events/${id}/details?shared=true`, { replace: true });
                        break;
                    // Перенаправление на страницу информации о билете
                    case 'ticket':
                        navigate(`/tickets/${id}?shared=true`, { replace: true });
                        break;
                    // Перенаправление на страницу информации о сертификате
                    case 'certificate':
                        navigate(`/certificates/landing/${id}?shared=true`, { replace: true });
                        break;
                    case 'event_city':
                        navigate(`/events/?city=${id}&shared=true`, { replace: true });
                        break;
                }
            } else {
                navigate('/', { replace: true });
            }
        },
        [navigate]
    );

    useEffect(() => {
        const { pathname } = location;

        // Обработка специфичных параметров Telegram Web App при старте приложения из бота
        // с каким либо из параметров
        // hospitality_heroes - направляем на страницу супер-мероприятия
        // banquet - направляем на страницу выбора адреса для банкета
        // gastronomy - направляем на страницу выбора блюд для кулинарии
        // certificates - направляем на страницу выбора сертификата
        // tgWebAppStartParam - параметр при старте приложения из бота
        if (paramsObject.tgWebAppStartParam) {
            switch (paramsObject.tgWebAppStartParam) {
                case 'hospitality_heroes':
                    navigate(`/events/super?shared=true`, { replace: true });
                    break;
                case 'banquet':
                    // страница выбора адреса для банкета
                    navigate('/banquets/:id/address', { replace: true });
                    break;
                case 'gastronomy':
                    // страница выбора блюд для кулинарии
                    navigate('/gastronomy/choose?shared=true', { replace: true });
                    break;
                case 'certificates':
                    // первая страница создания сертификата
                    navigate('/certificates/1?shared=true', { replace: true });
                    break;
                default:
                    handleNavigation(paramsObject.tgWebAppStartParam);
                    break;
            }
        }

        // Проверяем, авторизован ли пользователь и прошел ли он онбординг
        // Если пользователь не авторизован, то перенаправляем на страницу авторизации
        // Если пользователь авторизован, но не прошел онбординг, то перенаправляем на страницу онбординга
        // Если пользователь авторизован и прошел онбординг, то проверяем, чтобы у пользователя был установлен телефон
        // Если телефон не установлен, то перенаправляем на страницу подтверждения телефона
        // Если телефон установлен, то проверяем, чтобы пользователь прошел лицензионное соглашение
        // Если лицензионное соглашение не пройдено, то перенаправляем на страницу лицензионного соглашения
        // Если лицензионное соглашение пройдено, то проверяем, чтобы пользователь прошел онбординг
        if (auth?.access_token) {
            if (!user?.phone_number && user?.complete_onboarding && !EXCLUDED_URLS.includes(pathname)) {
                navigate('/phoneConfirmation', { state });
                return;
            }

            const isUserIncomplete = !user?.license_agreement || !user.complete_onboarding;

            // Если навигация идет не на страницы онбординга, то проверяем, чтобы пользователь прошел онбординг
            const isOnboardingNotExcluded =
                !ONBOARDING_EXCLUDED.includes(pathname) &&
                !pathname.includes('events') &&
                !pathname.includes('restaurant') &&
                !pathname.includes('booking') &&
                !pathname.includes('certificates') &&
                !pathname.includes('banquets') &&
                !pathname.includes('tickets') &&
                !pathname.includes('gastronomy');

            if (isUserIncomplete && isOnboardingNotExcluded) {
                navigate('/onboarding', { replace: true });
                return;
            }
        }
    }, [auth, user, location.pathname, location.search, navigate, state, paramsObject]);
};
