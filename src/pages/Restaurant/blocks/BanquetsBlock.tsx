import { IBanquet } from '@/types/banquets.types.ts';
import { IWorkTime } from '@/types/restaurant.ts';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { workdayIndexMap } from '@/utils.ts';
import { ContentContainer } from '@/components/ContentContainer/ContentContainer.tsx';
import { ContentBlock } from '@/components/ContentBlock/ContentBlock.tsx';
import { HeaderContainer } from '@/components/ContentBlock/HeaderContainer/HeaderContainer.tsx';
import { HeaderContent } from '@/components/ContentBlock/HeaderContainer/HeaderContent/HeaderContainer.tsx';
import css from '@/pages/Restaurant/Restaurant.module.css';
import classNames from 'classnames';
import { UniversalButton } from '@/components/Buttons/UniversalButton/UniversalButton.tsx';

interface BanquetsBlockProps {
    image: string;
    description: string;
    restaurant_id: number;
    restaurant_title: string;
    banquets: IBanquet;
    workTime: IWorkTime[] | undefined;
}

export const BanquetsBlock: React.FC<BanquetsBlockProps> = ({
                                                                description,
                                                                image,
                                                                restaurant_id,
                                                                restaurant_title,
                                                                banquets,
                                                                workTime,
                                                            }) => {
    const navigate = useNavigate();

    /**
     * Сортирует время работы ресторана по дням недели
     * @returns {IWorkTime[] | undefined} Отсортированный массив времени работы
     */
    const getSortedWorkTime = (): IWorkTime[] | undefined => {
        if (!workTime) return undefined;
        return workTime.sort((a, b) => workdayIndexMap[a.weekday] - workdayIndexMap[b.weekday]);
    };

    /**
     * Обрабатывает навигацию на страницу выбора банкета
     * Передает необходимые данные в состояние навигации
     */
    const handleNavigateToBanquet = () => {
        const sortedWorkTime = getSortedWorkTime();
        navigate(`/banquets/${restaurant_id}/choose`, {
            state: {
                restaurant_title,
                banquets,
                workTime: sortedWorkTime
            },
        });
    };

    return (
        <ContentContainer>
            <ContentBlock>
                <HeaderContainer>
                    <HeaderContent title="Банкеты" id="banquet" />
                </HeaderContainer>
                <div className={css.blockContainer}>
                    <div className={css.blockImage}>
                        <div
                            className={classNames(css.blockImage, css.bgImage)}
                            style={{ backgroundImage: `url(${image})` }}
                        />
                    </div>
                    <span className={css.blockDescription}>{description}</span>
                    <UniversalButton
                        width="full"
                        title="Подробнее"
                        action={handleNavigateToBanquet}
                    />
                </div>
            </ContentBlock>
        </ContentContainer>
    );
};