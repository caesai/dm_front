import css from '../OnboardingPage.module.css';
import classNames from 'classnames';
import { useNavigate } from 'react-router-dom';

export const StageOne = () => {
    const navigate = useNavigate();
    return (
        <div className={css.stage_page}>
            <div className={css.stage_page_wrapper}>
                <div className={css.stage_footer}>
                    <div className={css.stage_description}>
                        <h2 className={css.stage_description_title}>
                            Выберите подходящий ресторан
                        </h2>
                        <span className={css.stage_description_subtitle}>
                            Собрали все рестораны Dreamteam в одном месте.
                        </span>
                    </div>
                    <div className={css.button_container}>
                        <div
                            className={css.redButton}
                            onClick={() => navigate('/onboarding/2')}
                        >
                            <span>Продолжить</span>
                        </div>
                    </div>
                </div>
                <div className={css.stageOne_wrapper}>
                    <div className={css.stageOne_icons}>
                        <img
                            src="/img/onboarding/blackchops.png"
                            alt=""
                            className={classNames(
                                css.stageOne_icon,
                                css.stageOne_icons_1
                            )}
                        />
                        <img
                            src="/img/onboarding/anchovys.png"
                            alt=""
                            className={classNames(
                                css.stageOne_icon,
                                css.stageOne_icons_2
                            )}
                        />
                        <img
                            src="/img/onboarding/smoke.png"
                            alt=""
                            className={classNames(
                                css.stageOne_icon,
                                css.stageOne_icons_3
                            )}
                        />
                        <img
                            src="/img/onboarding/trappist.png"
                            alt=""
                            className={classNames(
                                css.stageOne_icon,
                                css.stageOne_icons_4
                            )}
                        />
                        <img
                            src="/img/onboarding/poly.png"
                            alt=""
                            className={classNames(
                                css.stageOne_icon,
                                css.stageOne_icons_5
                            )}
                        />
                        <img
                            src="/img/onboarding/pame.png"
                            alt=""
                            className={classNames(
                                css.stageOne_icon,
                                css.stageOne_icons_6
                            )}
                        />
                        <img
                            src="/img/onboarding/beer.png"
                            alt=""
                            className={classNames(
                                css.stageOne_icon,
                                css.stageOne_icons_7
                            )}
                        />
                        <img
                            src="/img/onboarding/self.png"
                            alt=""
                            className={classNames(
                                css.stageOne_icon,
                                css.stageOne_icons_8
                            )}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
