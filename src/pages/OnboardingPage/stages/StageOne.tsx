import React from 'react';
import css from '../OnboardingPage.module.css';
import classNames from 'classnames';
import stage_logos from "/img/stage_logos.png";

export const StageOne: React.FC = () => {
    return (
        <div className={css.stage_page}>
            <div className={css.stage_page_wrapper}>
                <div className={css.stage_footer}>
                    <div className={css.stage_description}>
                        <h2 className={css.stage_description_title}>
                            Выберите подходящий ресторан
                        </h2>
                        <span className={css.stage_description_subtitle}>
                            Забронируйте стол, делитесь впечатлениями, участвуйте в мероприятиях
                        </span>
                    </div>
                </div>
                <div className={css.stageOne_wrapper}>
                        <div className={css.stageOne_icons} >
                        <img
                            src={stage_logos}
                            alt=""
                            className={classNames(
                                css.stageOne_icon,
                            )}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
