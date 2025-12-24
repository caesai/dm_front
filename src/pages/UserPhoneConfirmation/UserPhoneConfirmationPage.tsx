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

export const UserPhoneConfirmationPage: React.FC = () => {
    const [user, setUser] = useAtom(userAtom);
    const [auth] = useAtom(authAtom);
    const navigate = useNavigate();
    const location = useLocation();
    const state = location?.state;

    const updateUser = () => {
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

    useEffect(() => {
        if (user?.phone_number) {
            if (state) {
                if (state.sharedEvent) {
                    navigate(`/events/${state.id}/booking`, { state });
                }
                if (state.superEvent) {
                    navigate('/events/super', { state });
                }
                if (state.sharedRestaurant) {
                    navigate('/restaurant/' + state.id + '/booking', { state });
                }
                if (state.sharedCertificate) {
                    navigate('/booking', { state });
                }
                if (state.sharedBanquet) {
                    navigate(`/banquets/${state.id}/choose`, { state });
                }
                if (state.sharedGastronomy) {
                    navigate(`/gastronomy/${state.id}/basket`, { state });
                }
                if (state.sharedCertificateCreate) {
                    navigate('/certificates/online', { state });
                }
            } else {
                navigate('/');
            }
        }
    }, [user]);

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

        return () => {
            removeListener();
        };
    }, []);

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
