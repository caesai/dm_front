import css from '../OnboardingPage.module.css';
import classNames from 'classnames';
import { useNavigate } from 'react-router-dom';

export const StageFive = () => {
    const navigate = useNavigate();

    return (
        <div className={css.stage_page}>
            <div className={css.stage_page_wrapper}>
                <div className={css.stage_footer}>
                    <div className={css.stage_description}>
                        <h2 className={css.stage_description_title}>
                            Всегда рядом
                        </h2>
                        <div
                            className={classNames(
                                css.stageFive_footer_description
                            )}
                        >
                            <span
                                className={
                                    css.stageFive_footer_description_text
                                }
                            >
                                1. Нажмите на
                                <svg
                                    width="20"
                                    height="20"
                                    viewBox="0 0 20 20"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <rect
                                        x="0.5"
                                        y="0.5"
                                        width="19"
                                        height="19"
                                        rx="9.5"
                                        stroke="#A6A6A6"
                                    />
                                    <path
                                        fillRule="evenodd"
                                        clipRule="evenodd"
                                        d="M13 11C12.7348 11 12.4804 10.8946 12.2929 10.7071C12.1054 10.5196 12 10.2652 12 10C12 9.73478 12.1054 9.48043 12.2929 9.29289C12.4804 9.10536 12.7348 9 13 9C13.2652 9 13.5196 9.10536 13.7071 9.29289C13.8946 9.48043 14 9.73478 14 10C14 10.2652 13.8946 10.5196 13.7071 10.7071C13.5196 10.8946 13.2652 11 13 11ZM7 11C6.73478 11 6.48043 10.8946 6.29289 10.7071C6.10536 10.5196 6 10.2652 6 10C6 9.73478 6.10536 9.48043 6.29289 9.29289C6.48043 9.10536 6.73478 9 7 9C7.26522 9 7.51957 9.10536 7.70711 9.29289C7.89464 9.48043 8 9.73478 8 10C8 10.2652 7.89464 10.5196 7.70711 10.7071C7.51957 10.8946 7.26522 11 7 11ZM10 11C9.73478 11 9.48043 10.8946 9.29289 10.7071C9.10536 10.5196 9 10.2652 9 10C9 9.73478 9.10536 9.48043 9.29289 9.29289C9.48043 9.10536 9.73478 9 10 9C10.2652 9 10.5196 9.10536 10.7071 9.29289C10.8946 9.48043 11 9.73478 11 10C11 10.2652 10.8946 10.5196 10.7071 10.7071C10.5196 10.8946 10.2652 11 10 11Z"
                                        fill="#A6A6A6"
                                    />
                                </svg>
                                верхней панели.
                            </span>
                            <span
                                className={
                                    css.stageFive_footer_description_text
                                }
                            >
                                2. Выберите «Добавить на экран «Домой».
                            </span>
                        </div>
                    </div>
                    <div className={css.button_container}>
                        <div
                            className={css.redButton}
                            onClick={() => navigate('/onboarding/6')}
                        >
                            <span>Продолжить</span>
                        </div>
                    </div>
                </div>
                <div className={css.stageFive_wrapper}>
                    {/*<div className={css.stageFive_image}>*/}
                    <img
                        src="/img/onboarding/phone.png"
                        className={css.stageFive_phone}
                        alt=""
                    />
                    {/*</div>*/}
                </div>
            </div>
        </div>
    );
};
