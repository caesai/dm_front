import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import classNames from 'classnames';
import { useAtom } from 'jotai';
// API's
import { APICompleteOnboarding, APIUserName } from '@/api/user.api.ts';
// Atoms
import { authAtom, userAtom } from '@/atoms/userAtom.ts';
// Components
import { TextInput } from '@/components/TextInput/TextInput.tsx';
// Styles
import css from '@/pages/OnboardingPage/OnboardingPage.module.css';

export const StageFour: React.FC = () => {
    const [user, setUser] = useAtom(userAtom);
    const [auth] = useAtom(authAtom);
    const navigate = useNavigate();
    const [name, setName] = useState<string>();
    const [surname, setSurname] = useState<string>();
    const location = useLocation();
    const state = location?.state;

    const handleConfirm = () => {
        if (!user || !auth?.access_token || !name) {
            return;
        }
        APIUserName(auth.access_token, name, surname).then();
        APICompleteOnboarding(auth.access_token, true)
            .then((d) => {
                setUser(d.data);
                // Если у пользователя нет телефона — сразу на подтверждение телефона
                // Иначе — на главную или целевую страницу из state
                if (!d.data.phone_number) {
                    navigate('/phoneConfirmation', { state });
                } else {
                    navigate('/', { state });
                }
            })
            .catch(() =>
                alert('При сохранении данных произошла ошибка, пожалуйста, попробуйте перезапустить приложение.')
            );
    };

    const handleNameChange = (value: string) => {
        setName(value);
    };

    const handleSurnameChange = (value: string) => {
        setSurname(value);
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
                            onClick={handleConfirm}
                        >
                            <span>Продолжить</span>
                        </div>
                    </div>
                </div>
                <div className={css.stageSix_wrapper}>
                    <h2 className={css.stage_description_title}>
                        Как мы могли бы
                        <br /> к вам обращаться?
                    </h2>
                    <div className={css.form}>
                        <TextInput placeholder={'Имя'} value={name} onChange={handleNameChange} />
                        <TextInput placeholder={'Фамилия'} value={surname} onChange={handleSurnameChange} />
                    </div>
                </div>
            </div>
        </div>
    );
};
