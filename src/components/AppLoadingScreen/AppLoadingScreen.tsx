import css from './AppLoadingScreen.module.css';
import { authAtom, userAtom } from '@/atoms/userAtom.ts';
import { useEffect } from 'react';
import { useAtom } from 'jotai';
import { APIUserAuth, APIUserInfo } from '@/api/auth.ts';
import { useLaunchParams, useRawInitData } from '@telegram-apps/sdk-react';

const Loader = () => {
    return <div className={css.loader}></div>;
};

export const AppLoadingScreen = () => {
    const [, setUser] = useAtom(userAtom);
    const [auth, setAuth] = useAtom(authAtom);
    const lp = useLaunchParams();
    const rawLp = useRawInitData();
    console.log(rawLp);
    useEffect(() => {
        if (!auth?.access_token) {
            APIUserAuth(rawLp, lp.tgWebAppStartParam)
                .then((res) => {
                    setAuth(res.data);
                    return res.data.access_token;
                })
                .then((token) => {
                    APIUserInfo(token).then((res) => setUser(res.data));
                });
        }
    }, []);

    return (
        <div className={css.screen}>
            <Loader />
        </div>
    );
};
