import { IWorkTime } from '@/types/restaurant.types.ts';
import React, { useState } from 'react';
import { ContentContainer } from '@/components/ContentContainer/ContentContainer.tsx';
import { ContentBlock } from '@/components/ContentBlock/ContentBlock.tsx';
import { HeaderContainer } from '@/components/ContentBlock/HeaderContainer/HeaderContainer.tsx';
import { HeaderContent } from '@/components/ContentBlock/HeaderContainer/HeaderContent/HeaderContainer.tsx';
import css from '@/pages/RestaurantPage/RestaurantPage.module.css';
import classNames from 'classnames';
import { getCurrentTimeShort, getCurrentWeekdayShort, getRestaurantStatus } from '@/utils.ts';
import { DownArrow } from '@/components/Icons/DownArrow.tsx';
import { UnmountClosed } from 'react-collapse';

interface AboutBlockProps {
    about_text: string;
    workTime: IWorkTime[] | undefined;
    about_kitchen: string;
    about_dishes: string;
    about_features: string;
    avg_cheque: string;
}

/**
 * Компонент блока информации о ресторане
 */
export const AboutBlock: React.FC<AboutBlockProps> = ({
    about_text,
    workTime,
    about_dishes,
    about_kitchen,
    about_features,
    avg_cheque,
}) => {
    const [isAboutCollapsed, setIsAboutCollapsed] = useState(true);
    const [isWorkHoursCollapsed, setIsWorkHoursCollapsed] = useState(true);

    const toggleAbout = () => setIsAboutCollapsed((prev) => !prev);
    const toggleWorkHours = () => setIsWorkHoursCollapsed((prev) => !prev);

    const getKitchenInfo = () => [about_kitchen, about_dishes].filter(Boolean).join(', ').replace(/\\n/g, '\n');

    const renderWorkHours = () => {
        if (!workTime?.length) return null;

        return (
            <UnmountClosed isOpened={!isWorkHoursCollapsed} className={css.collapse}>
                <div className={css.workHours}>
                    {workTime.map((schedule) => (
                        <span key={`weekday-${schedule.weekday}`} className={css.text}>
                            {schedule.weekday}: {schedule.time_start}-{schedule.time_end}
                        </span>
                    ))}
                </div>
            </UnmountClosed>
        );
    };

    const getRestaurantStatusText = () => {
        if (!workTime) return '';
        return getRestaurantStatus(workTime, getCurrentWeekdayShort(), getCurrentTimeShort());
    };

    return (
        <ContentContainer>
            {/* Блок "О месте" */}
            <ContentBlock>
                <HeaderContainer>
                    <HeaderContent id="about" title="О месте" />
                </HeaderContainer>
                <div className={css.aboutContainer}>
                    <span className={classNames(css.aboutText, isAboutCollapsed && css.trimLines)} dangerouslySetInnerHTML={{ __html: about_text.replace(/\\n/g, '\n') }}></span>
                    <div
                        className={css.trimLinesButton}
                        onClick={toggleAbout}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === 'Enter' && toggleAbout()}
                    >
                        <span className={css.text}>{isAboutCollapsed ? 'Читать больше' : 'Скрыть'}</span>
                    </div>
                </div>
            </ContentBlock>

            {/* Блок графика работы */}
            <ContentBlock>
                <div className={css.infoBlock}>
                    <div className={css.top}>
                        <span className={css.title}>{getRestaurantStatusText()}</span>
                        <div
                            className={css.right}
                            onClick={toggleWorkHours}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => e.key === 'Enter' && toggleWorkHours()}
                        >
                            <span className={css.expandButton}>График</span>
                            <div className={classNames(css.right, css.opened, { [css.closed]: isWorkHoursCollapsed })}>
                                <DownArrow size={20} color="var(--grey)" />
                            </div>
                        </div>
                    </div>
                    {renderWorkHours()}
                </div>
            </ContentBlock>

            {/* Блок деталей */}
            <ContentBlock>
                <div className={css.infoBlock}>
                    <div className={css.top}>
                        <span className={css.title}>Детали</span>
                    </div>
                    <div className={css.infoBlock}>
                        <div className={css.textRow}>
                            <span className={css.title}>Кухня:</span>
                            <span className={css.value}>{getKitchenInfo()}</span>
                        </div>
                        <div className={css.textRow}>
                            <span className={css.title}>Особенности:</span>
                            <span className={css.value}>{about_features}</span>
                        </div>
                        <div className={css.textRow}>
                            <span className={css.title}>Средний чек:</span>
                            <span className={css.value}>{avg_cheque} ₽</span>
                        </div>
                    </div>
                </div>
            </ContentBlock>
        </ContentContainer>
    );
};
