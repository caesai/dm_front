/**
 * @fileoverview страница подтверждения телефона
 * пользователю необходимо подтвердить свой номер телефона, чтобы начать пользоваться приложением
 * после подтверждения номер телефона, пользователь будет перенаправлен на главную страницу
 * 
 */
import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAtom } from 'jotai/index';
import { mainButton } from '@telegram-apps/sdk-react';
// API's
import { APIUserInfo } from '@/api/auth.api.ts';
// Atoms
import { authAtom, userAtom } from '@/atoms/userAtom.ts';
// Components
import { Page } from '@/components/Page.tsx';
import { requestPhone } from '@/components/RequestPermissions/utils.ts';
// Styles
import css from '@/pages/UserPhoneConfirmation/UserPhoneConfirmationPage.module.css';

/**
 * Страница подтверждения телефона
 * @returns {JSX.Element}
 */
export const UserPhoneConfirmationPage: React.FC = (): JSX.Element => {
    const [user, setUser] = useAtom(userAtom);
    const [auth] = useAtom(authAtom);
    const navigate = useNavigate();
    const location = useLocation();
    // state для передачи данных из предыдущей страницы
    const state = location?.state;

    /**
     * Обновление пользователя
     */
    const updateUser = (): void => {
        if (!auth?.access_token) {
            // type guard
            return;
        }
        mainButton.setParams({
            isLoaderVisible: true,
        });
        setTimeout(() => {
            APIUserInfo(auth.access_token)
                .then((data) => setUser(data.data))
                .catch((error) => {
                    console.log(error);
                });
        }, 5000);
    };

    /**
     * Перенаправление на страницу в зависимости от state, который задется в useRedirectLogic
     * Если пользователь открыл приложение по ссылке и при этом не прошел онбординг, 
     * то он будет перенаправлен на страницу онбординга
     * Затем в зависимости от state будет перенаправлен на соответствующую страницу или на главную страницу.
     */
    useEffect(() => {
        if (user?.phone_number) {
            // если пользователь подтвердил номер телефона, то перенаправляем на соответствующую страницу в зависимости от state
            if (state) {
                // переход на страницу бронирования бесплатного мероприятия
                if (state.sharedEvent) {
                    navigate(`/events/${state.id}/booking`, { state });
                }
                // переход на страницу бронирования ресторана
                if (state.sharedRestaurant) {
                    navigate('/restaurant/' + state.id + '/booking', { state });
                }
                // переход на страницу бронирования после получения сертификата
                if (state.sharedCertificate) {
                    navigate('/booking', { state });
                }
                // переход на страницу выбора банкета
                if (state.sharedBanquet) {
                    navigate(`/banquets/${state.id}/choose`, { state });
                }
                // переход на страницу выбора блюд кулинарии
                if (state.sharedGastronomy) {
                    navigate(`/gastronomy/${state.id}/basket`, { state });
                }
                // переход на страницу создания сертификата
                if (state.sharedCertificateCreate) {
                    navigate('/certificates/online', { state });
                }
                // переход на страницу заполнения анкеты Hospitality Heroes
                if (state.hospitalityHeroes) {
                    navigate('/hospitality-heroes/application', { state });
                }
            } else {
                navigate('/');
            }
        }
    }, [user]);

    /**
     * Монтирование кнопки "Поделиться"
     */
    useEffect(() => {
        if (mainButton.mount.isAvailable()) {
            mainButton.mount();
            mainButton.setParams({
                backgroundColor: '#F52A2D',
                hasShineEffect: false,
                isEnabled: true,
                isLoaderVisible: false,
                isVisible: true,
                text: 'Поделиться',
                textColor: '#ffffff',
            });
        }

        // обработчик нажатия на кнопку "Поделиться"
        const removeListener = mainButton.onClick(() =>
            requestPhone()
                .then((res) => {
                    console.log(res);
                    return res === 'sent' ? updateUser() : null;
                })
                .catch((error) => {
                    console.log(error);
                })
        );

        // удаление обработчика нажатия на кнопку "Поделиться"
        return () => {
            removeListener();
        };
    }, []);

    /**
     * Удаление кнопки "Поделиться"
     */
    useEffect(() => {
        return () => {
            mainButton.setParams({ isVisible: false });
            mainButton.unmount();
        };
    }, []);

    return (
        <Page back={false}>
            <div className={css.page}>
                <span className={css.header}>Подтверждение телефона</span>
                <span className={css.content}>
                    Чтобы начать пользоваться приложением, просто отправьте свой номер телефона, нажав на кнопку{' '}
                    <b>«Поделиться»</b>.
                </span>
            </div>
        </Page>
    );
};
