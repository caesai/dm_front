import { IWorkTime } from '@/types/restaurant.types.ts';
import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import classNames from 'classnames';
// Atoms
import { useGetRestaurantById } from '@/atoms/restaurantsListAtom.ts';
// Utils
import { workdayIndexMap } from '@/utils.ts';
// Components
import { ContentContainer } from '@/components/ContentContainer/ContentContainer.tsx';
import { ContentBlock } from '@/components/ContentBlock/ContentBlock.tsx';
import { HeaderContainer } from '@/components/ContentBlock/HeaderContainer/HeaderContainer.tsx';
import { HeaderContent } from '@/components/ContentBlock/HeaderContainer/HeaderContent/HeaderContainer.tsx';
import { UniversalButton } from '@/components/Buttons/UniversalButton/UniversalButton.tsx';
// Styles
import css from '@/pages/RestaurantPage/RestaurantPage.module.css';

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
                workTime: sortedWorkTime,
            },
        });
    };

    /**
     * Если нет банкетов, то не отображаем блок
     */
    if (!restaurantBanquets || !restaurantBanquets.length) return <></>;

    return (
        <ContentContainer id="banquet">
            <HeaderContainer>
                <HeaderContent title="Банкеты" />
            </HeaderContainer>
            <ContentBlock className={css.blockContainer}>
                <figure className={css.blockImage}>
                    <div
                        className={classNames(css.blockImage, css.bgImage)}
                        style={{ backgroundImage: `url(${restaurantBanquets[0]?.images?.[0]})` }}
                    />
                </figure>
                <span className={css.blockDescription}>{restaurantBanquets[0]?.description}</span>
                <UniversalButton width="full" title="Подробнее" action={handleNavigateToBanquet} />
            </ContentBlock>
        </ContentContainer>
    );
};
