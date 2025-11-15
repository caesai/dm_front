import { IWorkTime } from '@/types/restaurant.ts';
import React, { useState } from 'react';
import { ContentContainer } from '@/components/ContentContainer/ContentContainer.tsx';
import { ContentBlock } from '@/components/ContentBlock/ContentBlock.tsx';
import { HeaderContainer } from '@/components/ContentBlock/HeaderContainer/HeaderContainer.tsx';
import { HeaderContent } from '@/components/ContentBlock/HeaderContainer/HeaderContent/HeaderContainer.tsx';
import css from '@/pages/Restaurant/Restaurant.module.css';
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

export const AboutBlock: React.FC<AboutBlockProps> = ({
                                                   about_text,
                                                   workTime,
                                                   about_dishes,
                                                   about_kitchen,
                                                   about_features,
                                                   avg_cheque,
                                               }) => {
    const [hideAbout, setHideAbout] = useState(true);
    const [hideWorkHours, setHideWorkHours] = useState(true);
    const toggleAbout = () => {
        setHideAbout((prev) => !prev);
    };
    const toggleWorkHours = () => {
        setHideWorkHours((prev) => !prev);
    };
    return (
        <ContentContainer>
            <ContentBlock>
                <HeaderContainer>
                    <HeaderContent id={'about'} title={'О месте'} />
                </HeaderContainer>
                <div className={css.aboutContainer}>
                    <span className={classNames(css.aboutText, hideAbout ? css.trimLines : null)}>{about_text}</span>
                    <div className={css.trimLinesButton} onClick={toggleAbout}>
                        <span className={css.text}>{hideAbout ? 'Читать больше' : 'Скрыть'}</span>
                    </div>
                </div>
            </ContentBlock>
            <ContentBlock>
                <div className={css.infoBlock}>
                    <div className={css.top}>
                        <span className={css.title}>
                            {workTime
                                ? getRestaurantStatus(workTime, getCurrentWeekdayShort(), getCurrentTimeShort())
                                : ''}
                        </span>
                        <div className={css.right} onClick={toggleWorkHours}>
                            <span className={css.expandButton}>График</span>
                            <div
                                className={classNames(css.right, css.opened, {
                                    [css.closed]: hideWorkHours,
                                })}
                            >
                                <DownArrow size={20} color={'var(--grey)'} />
                            </div>
                        </div>
                    </div>
                    <UnmountClosed isOpened={!hideWorkHours} className={css.collapse}>
                        <div className={css.workHours}>
                            {workTime &&
                                workTime.map((r) => (
                                    <span key={`weekday-${r.weekday}`} className={css.text}>
                                        {r.weekday}: {r.time_start}-{r.time_end}
                                    </span>
                                ))}
                        </div>
                    </UnmountClosed>
                </div>
            </ContentBlock>
            <ContentBlock>
                <div className={css.infoBlock}>
                    <div className={css.top}>
                        <span className={css.title}>Детали</span>
                    </div>
                    <div className={css.infoBlock}>
                        <div className={css.textRow}>
                            <span className={css.title}>Кухня:</span>
                            <span className={css.value}>
                                {about_kitchen}, {about_dishes}
                            </span>
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