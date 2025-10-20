import css from '../OnboardingPage.module.css';
import classNames from 'classnames';
import { useLocation, useNavigate } from 'react-router-dom';
import {useAtom} from 'jotai';
import { authAtom, userAtom } from '@/atoms/userAtom.ts';
import {TextInput} from "@/components/TextInput/TextInput.tsx";
import {useState} from "react";
import { APICompleteOnboarding, APIUserName } from '@/api/user.ts';

export const StageSix = () => {
    const [user, setUser] = useAtom(userAtom);
    const [auth] = useAtom(authAtom);
    const navigate = useNavigate();
    const [name, setName] = useState<string>();
    const [surname, setSurname] = useState<string>();
    const location = useLocation();
    const state = location?.state;

    const handleConfirm = () => {
        if (!user || !auth?.access_token || !name ) {
            return;
        }
        APIUserName(auth.access_token, name, surname).then();
        APICompleteOnboarding(auth.access_token, true)
            .then((d) => setUser(d.data))
            .then(() => navigate('/', { state } ))
            .catch(() =>
                alert(
                    'При сохранении данных произошла ошибка, пожалуйста, попробуйте перезапустить приложение.'
                )
            );
    };

    return (
        <div className={css.stage_page}>
            <div className={css.stage_page_wrapper}>
                <div className={css.stage_footer}>
                    <div className={css.button_container}>
                        <div
                            className={classNames(css.redButton, {
                                [css.redButton__disabled]: !name,
                            })}
                            onClick={() => handleConfirm()}
                        >
                            <span>Продолжить</span>
                        </div>
                    </div>
                </div>
                <div className={css.stageSix_wrapper}>
                    <h2 className={css.stage_description_title}>
                        Как мы могли бы<br /> к вам обращаться?</h2>
                    <div className={css.form}>
                        <TextInput placeholder={'Имя'} value={name} onChange={(e) => setName(e)} />
                        <TextInput placeholder={'Фамилия'} value={surname} onChange={(e) => setSurname(e)} />
                    </div>
                </div>
            </div>
        </div>
    );
};
