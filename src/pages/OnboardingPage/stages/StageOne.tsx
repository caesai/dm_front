import css from '../OnboardingPage.module.css';
import classNames from 'classnames';
import { useNavigate } from 'react-router-dom';
import blackChops from "/img/onboarding/blackchops.png";
// import anchovus from "/img/onboarding/anchovys.png";
import smoke from "/img/onboarding/smoke.png";
import trappist from "/img/onboarding/trappist.png";
import poly from "/img/onboarding/poly.png"
import pame from "/img/onboarding/pame.png";
import BBQNEW from "/img/onboarding/bbqnew.png";
import self from "/img/onboarding/self.png";
// import restaurants_logo from "/img/onboarding/restaurants_logo.png";

interface StageOneProps {
    isStory?: boolean;
}

export const StageOne: React.FC<StageOneProps> = ({ isStory }) => {
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
                    {!isStory && (
                        <div className={css.button_container}>
                            <div
                                className={css.redButton}
                                onClick={() => navigate('/onboarding/2')}
                            >
                                <span>Продолжить</span>
                            </div>
                        </div>
                    )}
                </div>
                <div className={css.stageOne_wrapper}>
                    {/*<div className={css.stageOne_icons} style={{ backgroundImage: `url(${restaurants_logo})`, backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'center' }}  >*/}
                        <div className={css.stageOne_icons} >
                        {/*<img src={restaurants_logo} className={css.stageOne_icon} style={{ maxWidth: '100%'}} alt="restaurants_logo" />*/}
                        <img
                            src={blackChops}
                            style={{ visibility: "hidden" }}
                            alt=""
                            className={classNames(
                                css.stageOne_icon,
                                css.stageOne_icons_1
                            )}
                        />
                        <img
                            src={self}
                            alt=""
                            className={classNames(
                                css.stageOne_icon,
                                css.stageOne_icons_2
                            )}
                        />
                        <img
                            src={smoke}
                            alt=""
                            className={classNames(
                                css.stageOne_icon,
                                css.stageOne_icons_3
                            )}
                        />
                        <img
                            src={trappist}
                            alt=""
                            className={classNames(
                                css.stageOne_icon,
                                css.stageOne_icons_4
                            )}
                        />
                        <img
                            src={poly}
                            alt=""
                            className={classNames(
                                css.stageOne_icon,
                                css.stageOne_icons_5
                            )}
                        />
                        <img
                            src={pame}
                            alt=""
                            className={classNames(
                                css.stageOne_icon,
                                css.stageOne_icons_6
                            )}
                        />
                        <img
                            src={blackChops}
                            alt=""
                            className={classNames(
                                css.stageOne_icon,
                                css.stageOne_icons_7
                            )}
                        />
                            <img
                                src={BBQNEW}
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
