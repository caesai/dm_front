import React from 'react';
import classNames from 'classnames';
import { useNavigate } from 'react-router-dom';
// Mocks
import stage_logos from '/img/stage_logos.png';
// Styles
import css from '@/pages/OnboardingPage/OnboardingPage.module.css';

export const StageOne: React.FC = () => {
    const navigate = useNavigate();
    return (
        <div className={css.stage_page}>
            <div className={css.stage_page_wrapper}>
                <div className={css.stage_footer}>
                    <div className={css.stage_description}>
                        <h2 className={css.stage_description_title}>Выберите подходящий ресторан</h2>
                        <span className={css.stage_description_subtitle}>
                            Забронируйте стол, делитесь впечатлениями, участвуйте в мероприятиях
                        </span>
                    </div>
                    <div className={css.button_container}>
                        <div className={css.redButton} onClick={() => navigate('/onboarding/2')}>
                            <span>Продолжить</span>
                        </div>
                    </div>
                </div>
                <div className={css.stageOne_wrapper}>
                    <img src={stage_logos} alt="" className={classNames(css.stageOne_icon)} />
                </div>
            </div>
        </div>
    );
};
