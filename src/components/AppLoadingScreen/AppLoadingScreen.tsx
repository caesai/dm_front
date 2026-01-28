import React, { useEffect } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { useLaunchParams, useRawInitData } from '@telegram-apps/sdk-react';
// APIs
import { APIUserAuth, APIUserInfo } from '@/api/auth.api.ts';
// Atoms
import { authAtom, userAtom } from '@/atoms/userAtom.ts';
// Styles
import css from '@/components/AppLoadingScreen/AppLoadingScreen.module.css';

/**
 * Компонент загрузки.
 *
 * @component
 * @returns {JSX.Element} Компонент загрузки
 */
export const Loader: React.FC = (): JSX.Element => {
    return <div className={css.loader} data-testid="loader" />;
};
/**
 * Экран загрузки приложения.
 *
 * @component
 * @returns {JSX.Element} Компонент экрана загрузки
 */
export const AppLoadingScreen: React.FC = (): JSX.Element => {
    const auth = useAtomValue(authAtom);
    const setUser = useSetAtom(userAtom);
    const setAuth = useSetAtom(authAtom);
    const lp = useLaunchParams();
    const rawLp = useRawInitData();
    // Авторизация пользователя
    useEffect(() => {
        if (!auth?.access_token) {
            APIUserAuth(rawLp, lp.tgWebAppStartParam)
                .then((res) => {
                    setAuth(res.data);
                    return res.data.access_token;
                })
                .then((token) => {
                    APIUserInfo(token).then((res) => {
                        setUser(res.data);
                    });
                })
                .catch((err) => {
                    console.error('[AppLoadingScreen] Ошибка авторизации:', err);
                });
        }
    }, [auth, setAuth, setUser, rawLp, lp.tgWebAppStartParam]);

    return (
        <div className={css.screen}>
            <Loader />
        </div>
    );
};
