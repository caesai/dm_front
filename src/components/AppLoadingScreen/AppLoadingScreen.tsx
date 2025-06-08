import css from './AppLoadingScreen.module.css';
import {authAtom, userAtom} from '@/atoms/userAtom.ts';
import {useEffect} from 'react';
import {useAtom} from 'jotai';
import {APIUserAuth, APIUserInfo} from '@/api/auth.ts';
import {useLaunchParams, useRawInitData} from '@telegram-apps/sdk-react';

const Loader = () => {
    return <div className={css.loader}></div>;
};

export const AppLoadingScreen = () => {
    const [, setUser] = useAtom(userAtom);
    const [auth, setAuth] = useAtom(authAtom);
    const lp = useLaunchParams();
    const rawLp = useRawInitData();
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
                .catch(err => {
                    console.error('auth', err);
                    // setUser({
                    //     email: 'caesai@yandex.ru',
                    //     first_name: 'V',
                    //     last_name: 'K',
                    //     phone_number: '998797897',
                    //     early_access: true,
                    //     license_agreement: true,
                    //     advertisement_agreement: true,
                    //     gdpr_agreement: true,
                    //     date_of_birth: '24.04.1988',
                    //     complete_onboarding: true,
                    // });
                });
        }
    }, []);

    return (
        <div className={css.screen}>
            <Loader/>
        </div>
    );
};
