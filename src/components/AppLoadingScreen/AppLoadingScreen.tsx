import css from './AppLoadingScreen.module.css';
import {authAtom, userAtom} from '@/atoms/userAtom.ts';
import {useEffect} from 'react';
import {useAtom} from 'jotai';
import {APIUserAuth, APIUserInfo} from '@/api/auth.ts';
import {useLaunchParams, useRawInitData} from '@telegram-apps/sdk-react';

export const Loader = () => {
    return <div className={css.loader} data-testid="loader"></div>;
};

export const AppLoadingScreen = () => {
    const [, setUser] = useAtom(userAtom);
    const [auth, setAuth] = useAtom(authAtom);
    const lp = useLaunchParams();
    const rawLp = useRawInitData();
    useEffect(() => {
        if (!auth?.access_token) {
            console.log('[AppLoadingScreen] Начало авторизации...');
            console.log('[AppLoadingScreen] rawLp:', rawLp);
            console.log('[AppLoadingScreen] startParam:', lp.tgWebAppStartParam);
            
            APIUserAuth(rawLp, lp.tgWebAppStartParam)
                .then((res) => {
                    console.log('[AppLoadingScreen] Авторизация успешна:', res.data);
                    setAuth(res.data);
                    return res.data.access_token;
                })
                .then((token) => {
                    console.log('[AppLoadingScreen] Получение информации о пользователе...');
                    return APIUserInfo(token);
                })
                        .then((res) => {
                    console.log('[AppLoadingScreen] Информация о пользователе получена:', res.data);
                        setUser(res.data);
                })
                .catch(err => {
                    console.error('[AppLoadingScreen] Ошибка авторизации:', err);
                    console.error('[AppLoadingScreen] Детали ошибки:', err.response?.data);
                });
        }
    }, []);

    return (
        <div className={css.screen}>
            <Loader/>
        </div>
    );
};
