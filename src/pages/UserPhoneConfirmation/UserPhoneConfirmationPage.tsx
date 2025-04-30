import { Page } from '@/components/Page.tsx';
import css from './UserPhoneConfirmationPage.module.css';
import { useEffect } from 'react';
import { mainButton } from '@telegram-apps/sdk-react';
import { requestPhone } from '@/components/RequestPermissions/utils.ts';
import { useAtom } from 'jotai/index';
import { authAtom, userAtom } from '@/atoms/userAtom.ts';
import { APIUserInfo } from '@/api/auth.ts';
import { useNavigate } from 'react-router-dom';

export const UserPhoneConfirmationPage = () => {
    const [user, setUser] = useAtom(userAtom);
    const [auth] = useAtom(authAtom);
    const navigate = useNavigate();

    const updateUser = () => {
        if (!auth?.access_token) {
            // type guard
            return;
        }
        mainButton.setParams({
            isLoaderVisible: true,
        });
        setTimeout(
            () =>
                APIUserInfo(auth.access_token).then((data) =>
                    setUser(data.data)
                ),
            5000
        );
    };

    useEffect(() => {
        if (user?.phone_number) {
            navigate('/');
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
            requestPhone().then((res) => (res === 'sent' ? updateUser() : null))
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
                    Чтобы начать пользоваться приложением, просто отправьте свой
                    номер телефона, нажав на кнопку <b>«Поделиться»</b>.
                </span>
            </div>
        </Page>
    );
};
