import css from '../OnboardingPage.module.css';
import classNames from 'classnames';
import { useNavigate } from 'react-router-dom';
import bg from '/img/onboarding/background.png';

interface StageTwoProps {
    isStory?: boolean;
}

export const StageTwo: React.FC<StageTwoProps> = ({isStory}) => {
    const navigate = useNavigate();
    return (
        <div className={classNames(css.stage_page)}>
            <div className={css.stage_page_wrapper}>
                <div className={css.stage_footer}>

                    <div className={css.stage_description}>
                        <h2
                            className={classNames(
                                css.stage_description_title,
                            )}
                        >
                            ЗАБРОНИРУЙТЕ СТОЛ
                        </h2>
                        <span
                            className={classNames(
                                css.stage_description_subtitle,
                            )}
                        >
                            Учтем все пожелания, отправим подтверждение в чат и
                            ждем встречи с вами.
                        </span>
                    </div>
                    {!isStory && (
                        <div className={css.button_container}>
                        <div
                            className={css.redButton}
                            onClick={() => navigate('/onboarding/3')}
                        >
                            <span>Продолжить</span>
                        </div>
                    </div>
                    )}
                </div>
                <div className={css.stageTwo_wrapper} style={{ borderRadius: 12 }}>
                    <img src={bg} alt={''} style={{maxWidth: '100%', borderRadius: 12}} />
                </div>
            </div>
        </div>
    );
};
