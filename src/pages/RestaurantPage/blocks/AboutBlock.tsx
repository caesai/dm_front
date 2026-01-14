import React, { useMemo, useState } from 'react';
import classNames from 'classnames';
import { UnmountClosed } from 'react-collapse';
// Atoms
import { useGetRestaurantById } from '@/atoms/restaurantsListAtom.ts';
// Components
import { ContentContainer } from '@/components/ContentContainer/ContentContainer.tsx';
import { ContentBlock } from '@/components/ContentBlock/ContentBlock.tsx';
import { HeaderContainer } from '@/components/ContentBlock/HeaderContainer/HeaderContainer.tsx';
import { HeaderContent } from '@/components/ContentBlock/HeaderContainer/HeaderContent/HeaderContainer.tsx';
import { DownArrow } from '@/components/Icons/DownArrow.tsx';
// Utils
import { getCurrentTimeShort, getCurrentWeekdayShort, getRestaurantStatus } from '@/utils.ts';
// Styles
import css from '@/pages/RestaurantPage/RestaurantPage.module.css';

/**
 * Пропсы компонента AboutBlock.
 *
 * @interface IAboutBlockProps
 */
interface IAboutBlockProps {
    /**
     * ID ресторана.
     */
    restaurantId: string;
}

/**
 * Компонент блока информации о ресторане
 */
export const AboutBlock: React.FC<IAboutBlockProps> = ({ restaurantId }): JSX.Element => {
    /**
     * Ресторан.
     */
    const restaurant = useGetRestaurantById(restaurantId);
    /**
     * Время работы.
     */
    const workTime = useMemo(() => restaurant?.worktime || [], [restaurant?.worktime]);
    const aboutText = useMemo(() => restaurant?.about_text || '', [restaurant?.about_text]);
    const aboutKitchen = useMemo(() => restaurant?.about_kitchen || '', [restaurant?.about_kitchen]);
    const aboutFeatures = useMemo(() => restaurant?.about_features || '', [restaurant?.about_features]);
    const avgCheque = useMemo(() => restaurant?.avg_cheque || 0, [restaurant?.avg_cheque]);
    const [isAboutCollapsed, setIsAboutCollapsed] = useState(true);
    const [isWorkHoursCollapsed, setIsWorkHoursCollapsed] = useState(true);

    const toggleAbout = () => setIsAboutCollapsed((prev) => !prev);
    const toggleWorkHours = () => setIsWorkHoursCollapsed((prev) => !prev);

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
        <ContentContainer id="about">
            {/* Блок "О месте" */}
            <HeaderContainer>
                <HeaderContent title="О месте" />
            </HeaderContainer>
            <ContentBlock className={css.aboutContainer}>
                <span
                    className={classNames(css.aboutText, isAboutCollapsed && css.trimLines)}
                    dangerouslySetInnerHTML={{ __html: aboutText.replace(/\\n/g, '\n') }}
                />
                <button
                    className={css.trimLinesButton}
                    onClick={toggleAbout}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && toggleAbout()}
                >
                    <span className={css.text}>{isAboutCollapsed ? 'Читать больше' : 'Скрыть'}</span>
                </button>
            </ContentBlock>

            {/* Блок графика работы */}
            <ContentBlock className={css.infoBlock}>
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
            </ContentBlock>

            {/* Блок деталей */}
            <ContentBlock className={css.infoBlock}>
                <div className={css.top}>
                    <span className={css.title}>Детали</span>
                </div>
                <div className={css.infoBlock}>
                    <div className={css.textRow}>
                        <span className={css.title}>Кухня:</span>
                        <span className={css.value}>{aboutKitchen}</span>
                    </div>
                    <div className={css.textRow}>
                        <span className={css.title}>Особенности:</span>
                        <span className={css.value}>{aboutFeatures}</span>
                    </div>
                    <div className={css.textRow}>
                        <span className={css.title}>Средний чек:</span>
                        <span className={css.value}>{avgCheque} ₽</span>
                    </div>
                </div>
            </ContentBlock>
        </ContentContainer>
    );
};
