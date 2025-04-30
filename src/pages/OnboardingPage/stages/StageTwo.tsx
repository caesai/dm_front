import css from '../OnboardingPage.module.css';
import classNames from 'classnames';
import { useNavigate } from 'react-router-dom';

export const StageTwo = () => {
    const navigate = useNavigate();
    return (
        <div className={classNames(css.stage_page, css.stageTwo__background)}>
            <div className={css.stage_page_wrapper}>
                <div className={css.stage_footer}>
                    <div className={css.stage_description}>
                        <h2
                            className={classNames(
                                css.stage_description_title,
                                css.white
                            )}
                        >
                            ЗАБРОНИРУЙТЕ СТОЛ
                        </h2>
                        <span
                            className={classNames(
                                css.stage_description_subtitle,
                                css.white
                            )}
                        >
                            Учтем все пожелания, отправим подтверждение в чат и
                            ждем встречи с вами.
                        </span>
                    </div>
                    <div className={css.button_container}>
                        <div
                            className={css.redButton}
                            onClick={() => navigate('/onboarding/3')}
                        >
                            <span>Продолжить</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
