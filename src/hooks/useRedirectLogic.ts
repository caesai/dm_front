import { useCallback, useEffect, useRef, useState } from 'react';
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

// Пути, которые доступны без онбординга
const ALLOWED_WITHOUT_ONBOARDING = [
    'events',
    'restaurant',
    'booking',
    'certificates',
    'banquets',
    'tickets',
    'gastronomy',
];

export const useRedirectLogic = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [user] = useAtom(userAtom);
    const [auth] = useAtom(authAtom);
    const [params] = useSearchParams();
    const state = location?.state;
    const tgWebAppStartParam = params.get('tgWebAppStartParam');
    const [isInitialRedirectComplete, setIsInitialRedirectComplete] = useState(false);
    const initialCheckDoneRef = useRef(false);

    // Функция для обработки навигации на основе параметров при старте приложения из бота
    const handleNavigation = useCallback(
        (param: string) => {
            const paths = ['restaurant', 'event', 'ticket', 'certificate', 'event_city', 'event_restaurant'];
            const path = param.substring(0, param.indexOf('Id_'));
            if (paths.includes(path)) {
                const id = param.replace(`${path}Id_`, '');
                switch (path) {
                    case 'restaurant':
                        navigate(`/${path}/${id}?shared=true`, { replace: true });
                        break;
                    case 'event':
                        navigate(`/events/${id}/details?shared=true`, { replace: true });
                        break;
                    case 'ticket':
                        navigate(`/tickets/${id}?shared=true`, { replace: true });
                        break;
                    case 'certificate':
                        navigate(`/certificates/landing/${id}?shared=true`, { replace: true });
                        break;
                    case 'event_city':
                        navigate(`/events/?city=${id}&shared=true`, { replace: true });
                        break;
                    case 'event_restaurant':
                        navigate(`/events/?restaurant=${id}&shared=true`, { replace: true });
                        break;
                }
            } else {
                navigate('/', { replace: true });
            }
        },
        [navigate]
    );

    // Проверка, разрешён ли путь без онбординга
    const isPathAllowedWithoutOnboarding = useCallback((pathname: string) => {
        return ONBOARDING_EXCLUDED.includes(pathname) || 
               ALLOWED_WITHOUT_ONBOARDING.some(path => pathname.includes(path));
    }, []);

    useEffect(() => {
        const { pathname } = location;
        // Обработка tgWebAppStartParam - только при первом запуске
        if (tgWebAppStartParam && !initialCheckDoneRef.current) {
            initialCheckDoneRef.current = true;
            switch (tgWebAppStartParam) {
                case 'hospitality_heroes':
                    navigate(`/events/super?shared=true`, { replace: true });
                    break;
                case 'banquet':
                    navigate('/banquets/:id/address', { replace: true });
                    break;
                case 'gastronomy':
                    navigate('/gastronomy/choose?shared=true', { replace: true });
                    break;
                case 'certificates':
                    navigate('/certificates/1?shared=true', { replace: true });
                    break;
                default:
                    handleNavigation(tgWebAppStartParam);
                    break;
            }
            setIsInitialRedirectComplete(true);
            return;
        }

        // Проверка авторизации и онбординга
        if (auth?.access_token) {
            // Проверка телефона (только для завершивших онбординг)
            if (!user?.phone_number && user?.complete_onboarding && !EXCLUDED_URLS.includes(pathname)) {
                if (!initialCheckDoneRef.current) {
                    initialCheckDoneRef.current = true;
                }
                navigate('/phoneConfirmation', { state });
                setIsInitialRedirectComplete(true);
                return;
            }

            // Проверка онбординга - редирект только если путь НЕ разрешён без онбординга
            const needsOnboarding = !user?.complete_onboarding && !isPathAllowedWithoutOnboarding(pathname);
            
            if (needsOnboarding) {
                if (!initialCheckDoneRef.current) {
                    initialCheckDoneRef.current = true;
                }
                navigate('/onboarding/1', { replace: true });
                setIsInitialRedirectComplete(true);
                return;
            }
        }

        // Отмечаем начальную проверку как завершённую
        if (!initialCheckDoneRef.current) {
            initialCheckDoneRef.current = true;
        }
        setIsInitialRedirectComplete(true);
    }, [
        auth?.access_token, 
        user?.phone_number, 
        user?.complete_onboarding, 
        location.pathname, 
        navigate, 
        state, 
        tgWebAppStartParam, 
        handleNavigation,
        isPathAllowedWithoutOnboarding
    ]);

    return { isInitialRedirectComplete };
};
