import React, { useEffect } from 'react';
import { useAtom } from 'jotai';
import { useLaunchParams, useRawInitData } from '@telegram-apps/sdk-react';
// APIs
import { APIUserAuth, APIUserInfo } from '@/api/auth.api.ts';
// Atoms
import { authAtom, userAtom } from '@/atoms/userAtom.ts';
// Styles
import css from '@/components/AppLoadingScreen/AppLoadingScreen.module.css';

export const Loader = () => {
    return <div className={css.loader} data-testid="loader"></div>;
};

export const AppLoadingScreen: React.FC = () => {
    const [, setUser] = useAtom(userAtom);
    const [auth, setAuth] = useAtom(authAtom);
    const lp = useLaunchParams();
    const rawLp = useRawInitData();
    useEffect(() => {
        if (!auth?.access_token) {
            console.log('lp.tgWebAppStartParam: ', lp.tgWebAppStartParam)
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
