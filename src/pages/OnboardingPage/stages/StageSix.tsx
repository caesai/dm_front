import css from '../OnboardingPage.module.css';
import classNames from 'classnames';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { APICompleteOnboarding } from '@/api/user.ts';
import { useAtom } from 'jotai';
import { authAtom, userAtom } from '@/atoms/userAtom.ts';

export const StageSix = () => {
    const [agree, setAgree] = useState(false);
    const [user, setUser] = useAtom(userAtom);
    const [auth] = useAtom(authAtom);
    const navigate = useNavigate();

    const handleConfirm = () => {
        if (!agree || !user || !auth?.access_token) {
            return;
        }
        APICompleteOnboarding(auth.access_token, agree)
            .then((d) => setUser(d.data))
            .then(() => navigate('/'))
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
                    <div className={css.agreeCheckbox_container}>
                        <input
                            type="checkbox"
                            id={'agree'}
                            className={css.agreeCheckbox}
                            checked={agree}
                            onChange={() => setAgree(!agree)}
                        />
                        <label
                            htmlFor="agree"
                            className={css.agreeCheckbox_label}
                        >
                            Принимаю{' '}
                            <span className={css.redUnderline}>
                                Условия пользовательского соглашения
                            </span>{' '}
                            и{' '}
                            <span className={css.redUnderline}>
                                Политику конфиденциальности
                            </span>
                        </label>
                    </div>
                    <div className={css.button_container}>
                        <div
                            className={classNames(css.redButton, {
                                [css.redButton__disabled]: !agree,
                            })}
                            onClick={() => handleConfirm()}
                        >
                            <span>Продолжить</span>
                        </div>
                    </div>
                </div>
                <div className={css.stageSix_wrapper}>
                    <p className={css.agreement}>
                        1. ОБЩИЕ ПОЛОЖЕНИЯ <br />
                        1.1. Настоящее Пользовательское соглашение (далее –
                        Соглашение) относится к сайту «НАЗВАНИЕ САЙТА»,
                        расположенному по адресу АДРЕС САЙТА. <br />
                        1.2. Сайт «НАЗВАНИЕ САЙТА» (далее – Сайт) является
                        собственностью юридического лица ОРГАНИЗАЦИЯ (ОГРН:
                        НОМЕР, ИНН: НОМЕР, адрес регистрации: ЮР.АДРЕС) <br />
                        1.3. Настоящее Соглашение регулирует отношения между
                        Администрацией сайта «НАЗВАНИЕ САЙТА» (далее –
                        Администрация сайта) и Пользователем данного Сайта.{' '}
                        <br />
                        1.4. Администрация сайта оставляет за собой право в
                        любое время изменять, добавлять или удалять пункты
                        настоящего Соглашения без уведомления Пользователя.
                    </p>
                </div>
            </div>
        </div>
    );
};
