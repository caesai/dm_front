import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAtom } from 'jotai';
// Atoms
import { authAtom, userAtom } from '@/atoms/userAtom.ts';

/**
 * URL-адреса, исключённые из проверки редиректа на подтверждение телефона.
 * Пользователь не будет перенаправлен с этих страниц.
 */
const EXCLUDED_URLS = ['/phoneConfirmation', '/onboarding', '/gdpr'];

/**
 * URL-адреса страниц онбординга, которые не требуют проверки завершения онбординга.
 */
const ONBOARDING_EXCLUDED = [
    '/onboarding',
    '/onboarding/1',
    '/onboarding/2',
    '/onboarding/3',
    '/onboarding/4',
    '/onboarding/5',
    '/onboarding/6',
];

/**
 * Части URL-адресов, которые доступны пользователям без завершённого онбординга.
 * Используется для проверки через `pathname.includes()`.
 */
const ALLOWED_WITHOUT_ONBOARDING = [
    'events',
    'restaurant',
    'booking',
    'certificates',
    'banquets',
    'tickets',
    'gastronomy',
];

/**
 * Результат работы хука useRedirectLogic.
 */
interface UseRedirectLogicResult {
    /**
     * Флаг, указывающий, что начальная проверка редиректа завершена.
     * Используется для предотвращения рендеринга страниц до определения целевого маршрута.
     */
    isInitialRedirectComplete: boolean;
}

/**
 * Хук для управления логикой редиректов в приложении.
 *
 * @description
 * Обрабатывает следующие сценарии:
 *
 * 1. **Параметры Telegram Web App** (`tgWebAppStartParam`):
 *    - `hospitality_heroes` → `/events/super`
 *    - `banquet` → `/banquets/:id/address`
 *    - `gastronomy` → `/gastronomy/choose`
 *    - `certificates` → `/certificates/1`
 *    - `restaurantId_*`, `eventId_*`, `ticketId_*`, `certificateId_*` → соответствующие страницы
 *
 * 2. **Проверка телефона**:
 *    - Если пользователь завершил онбординг, но не указал телефон → `/phoneConfirmation`
 *
 * 3. **Проверка онбординга**:
 *    - Если пользователь не завершил онбординг и находится на защищённой странице → `/onboarding/1`
 *    - Страницы из {@link ALLOWED_WITHOUT_ONBOARDING} доступны без онбординга
 *
 * @returns {UseRedirectLogicResult} Объект с флагом завершения начальной проверки
 *
 * @example
 * ```tsx
 * const { isInitialRedirectComplete } = useRedirectLogic();
 *
 * if (!isInitialRedirectComplete) {
 *   return <LoadingScreen />;
 * }
 *
 * return <Routes>...</Routes>;
 * ```
 *
 * @see {@link EXCLUDED_URLS} - URL-адреса, исключённые из проверки телефона
 * @see {@link ONBOARDING_EXCLUDED} - URL-адреса страниц онбординга
 * @see {@link ALLOWED_WITHOUT_ONBOARDING} - URL-адреса, доступные без онбординга
 */
export const useRedirectLogic = (): UseRedirectLogicResult => {
    const navigate = useNavigate();
    const location = useLocation();
    const [user] = useAtom(userAtom);
    const [auth] = useAtom(authAtom);
    const [params] = useSearchParams();
    const state = location?.state;
    const tgWebAppStartParam = params.get('tgWebAppStartParam');

    /** Флаг для отслеживания завершения начальной проверки (триггерит ре-рендер) */
    const [isInitialRedirectComplete, setIsInitialRedirectComplete] = useState(false);

    /** Ref для отслеживания выполнения начальной проверки (не триггерит ре-рендер) */
    const initialCheckDoneRef = useRef(false);

    /**
     * Обрабатывает навигацию на основе параметра `tgWebAppStartParam`.
     *
     * @param param - Параметр запуска из Telegram Web App в формате `{type}Id_{id}`
     *
     * @example
     * ```ts
     * handleNavigation('restaurantId_123'); // → /restaurant/123?shared=true
     * handleNavigation('eventId_456');      // → /events/456/details?shared=true
     * ```
     */
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

    /**
     * Проверяет, разрешён ли указанный путь без завершённого онбординга.
     *
     * @param pathname - Путь для проверки
     * @returns `true` если путь доступен без онбординга, `false` в противном случае
     *
     * @example
     * ```ts
     * isPathAllowedWithoutOnboarding('/onboarding/1');     // true
     * isPathAllowedWithoutOnboarding('/events/123');       // true
     * isPathAllowedWithoutOnboarding('/profile');          // false
     * ```
     */
    const isPathAllowedWithoutOnboarding = useCallback((pathname: string) => {
        return (
            ONBOARDING_EXCLUDED.includes(pathname) || ALLOWED_WITHOUT_ONBOARDING.some((path) => pathname.includes(path))
        );
    }, []);

    /**
     * Основной эффект для обработки логики редиректов.
     *
     * Порядок проверок:
     * 1. Обработка `tgWebAppStartParam` (только при первом запуске)
     * 2. Проверка телефона для пользователей с завершённым онбордингом
     * 3. Проверка необходимости онбординга для незавершивших его пользователей
     */
    useEffect(() => {
        const { pathname } = location;
        if (tgWebAppStartParam && !initialCheckDoneRef.current) {
            initialCheckDoneRef.current = true;
            switch (tgWebAppStartParam) {
                case 'hospitality_heroes':
                    navigate(`/hospitality-heroes?shared=true`, { replace: true });
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
                // Если начальная проверка ещё не выполнена, отмечаем её как выполненную
                if (!initialCheckDoneRef.current) {
                    initialCheckDoneRef.current = true;
                }
                // Перенаправляем на страницу онбординга
                navigate('/onboarding/1', { replace: true });
                setIsInitialRedirectComplete(true);
                return;
            }
        }

        // Если все проверки пройдены, отмечаем начальную проверку как завершённую
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
        isPathAllowedWithoutOnboarding,
    ]);

    return { isInitialRedirectComplete };
};
