import { IWorkTime } from '@/types/restaurant.types.ts';
import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import classNames from 'classnames';
import { workdayIndexMap } from '@/utils.ts';
import { ContentContainer } from '@/components/ContentContainer/ContentContainer.tsx';
import { ContentBlock } from '@/components/ContentBlock/ContentBlock.tsx';
import { HeaderContainer } from '@/components/ContentBlock/HeaderContainer/HeaderContainer.tsx';
import { HeaderContent } from '@/components/ContentBlock/HeaderContainer/HeaderContent/HeaderContainer.tsx';
import { UniversalButton } from '@/components/Buttons/UniversalButton/UniversalButton.tsx';
import css from '@/pages/RestaurantPage/RestaurantPage.module.css';
import { useGetRestaurantById } from '@/atoms/restaurantsListAtom';

/**
 * Пропсы компонента BanquetsBlock.
 *
 * @interface IBanquetsBlockProps
 */
interface IBanquetsBlockProps {
    /**
     * ID ресторана.
     */
    restaurantId: string;
}

/**
 * Компонент для отображения банкетных блоков.
 *
 * @component
 * @example
 * <BanquetsBlock restaurantId="1" />
 */
export const BanquetsBlock: React.FC<IBanquetsBlockProps> = ({ restaurantId }): JSX.Element => {
    /**
     * Навигация.
     */
    const navigate = useNavigate();
    /**
     * Ресторан.
     */
    const restaurant = useGetRestaurantById(restaurantId);
    /**
     * Банкеты ресторана.
     */
    const restaurantBanquets = useMemo(() => restaurant?.banquets.banquet_options || [], [restaurant]);
    /**
     * Сортирует время работы ресторана по дням недели
     * @returns {IWorkTime[] | undefined} Отсортированный массив времени работы
     */
    const getSortedWorkTime = (): IWorkTime[] | undefined => {
        if (!restaurant?.worktime) return undefined;
        return restaurant?.worktime.sort((a, b) => workdayIndexMap[a.weekday] - workdayIndexMap[b.weekday]);
    };

    /**
     * Обрабатывает навигацию на страницу выбора банкета
     * Передает необходимые данные в состояние навигации
     */
    const handleNavigateToBanquet = () => {
        const sortedWorkTime = getSortedWorkTime();
        navigate(`/banquets/${restaurantId}/address`, {
            state: {
                restaurant,
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
                            style={{ backgroundImage: `url(${restaurantBanquets[0]?.images?.[0]})` }}
                        />
                    </div>
                    <span className={css.blockDescription}>{restaurantBanquets[0]?.description}</span>
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
