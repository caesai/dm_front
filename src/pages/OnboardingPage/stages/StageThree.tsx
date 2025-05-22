import css from '../OnboardingPage.module.css';
import classNames from 'classnames';
import { useNavigate } from 'react-router-dom';
import event1 from "/img/onboarding/event1.png";
import event2 from "/img/onboarding/event2.jpg";
import event3 from "/img/onboarding/event3.jpg"

export const StageThree = () => {
    const navigate = useNavigate();
    return (
        <div className={classNames(css.stage_page)}>
            <div className={classNames(css.stage_page_wrapper)}>
                <div className={css.stage_footer}>
                    <div className={css.stage_description}>
                        <h2 className={classNames(css.stage_description_title)}>
                            Будьте в курсе всех мероприятий
                        </h2>
                        <span
                            className={classNames(
                                css.stage_description_subtitle
                            )}
                        >
                            Омакасе-ужины, Beef Steak Club, тематические бранчи
                            и многое другое.
                        </span>
                    </div>
                    <div className={css.button_container}>
                        <div
                            className={css.redButton}
                            onClick={() => navigate('/onboarding/4')}
                        >
                            <span>Продолжить</span>
                        </div>
                    </div>
                </div>
                <div className={css.stageThree_wrapper}>
                    <div className={css.stageThree_images}>
                        <img
                            src={event1}
                            alt=""
                            className={classNames(
                                css.stageThree_image,
                                css.stageThree_image_1
                            )}
                        />
                        <img
                            src={event2}
                            alt=""
                            className={classNames(
                                css.stageThree_image,
                                css.stageThree_image_2
                            )}
                        />
                        <img
                            src={event3}
                            alt=""
                            className={classNames(
                                css.stageThree_image,
                                css.stageThree_image_3
                            )}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
