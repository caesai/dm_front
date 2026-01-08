import React, { useMemo } from 'react';
import classNames from 'classnames';
// Components
import { MoneyIcon } from '@/components/Icons/MoneyIcon.tsx';
import { TimeCircleIcon } from '@/components/Icons/TimeCircleIcon.tsx';
import { PlaceholderBlock } from '@/components/PlaceholderBlock/PlaceholderBlock.tsx';
// Atoms
import { useGetRestaurantById } from '@/atoms/restaurantsListAtom.ts';
// Utils
import { getCurrentTimeShort, getCurrentWeekdayShort, getRestaurantStatusTyped } from '@/utils.ts';
// Styles
import css from '@/components/RestaurantTopPreview/RestaurantTopPreview.module.css';

/**
 * Пропсы компонента RestaurantTopPreview.
 *
 * @interface IRestaurantTopPreviewProps
 */
interface IRestaurantTopPreviewProps {
    /**
     * ID ресторана.
     */
    restaurantId: string;
}

/**
 * Компонент для отображения верхнего превью ресторана.
 *
 * @component
 * @example
 * <RestaurantTopPreview restaurantId="1" />
 */
export const RestaurantTopPreview: React.FC<IRestaurantTopPreviewProps> = ({ restaurantId }): JSX.Element => {
    /**
     * Ресторан.
     */
    const restaurant = useGetRestaurantById(restaurantId);
    const avgCheque = useMemo(() => restaurant?.avg_cheque || 0, [restaurant?.avg_cheque]);
    /**
     * Если ресторан не найден, то возвращаем placeholder.
     */
    if (!restaurant) {
        return (
            <div className={css.previewContainer}>
                <PlaceholderBlock width="100%" height="100%" rounded="0 0 20px 20px" />
            </div>
        );
    }
    /**
     * Возвращаем верхнее превью ресторана.
     */
    return (
        <figure     
            className={classNames(css.previewContainer, css.bgImage)}
            style={{ backgroundImage: `url(${restaurant?.thumbnail_photo})` }}
        >
            <div className={css.halfBlackWrapper}>
                <div className={css.previewContainerContent}>
                    <div className={css.previewMainInfo}>
                        <h1 className={css.title}>{restaurant?.title}</h1>
                        <address className={css.location}>{restaurant?.address}</address>
                    </div>
                    <figcaption className={css.previewExtra}>
                        <div className={css.extraItem}>
                            <MoneyIcon color={'white'} size={24} />
                            <div className={css.extraItemContent}>
                                <span className={css.extraTop}>{avgCheque} ₽</span>
                                <span className={css.extraBottom}>Средний чек</span>
                            </div>
                        </div>
                        <div className={css.splitter}></div>
                        <time className={css.extraItem}>
                            <TimeCircleIcon color={'white'} size={24} />
                            {restaurant?.worktime ? (
                                getRestaurantStatusTyped(
                                    restaurant?.worktime,
                                    getCurrentWeekdayShort(),
                                    getCurrentTimeShort()
                                ).status == 'open' ? (
                                    <div className={css.extraItemContent}>
                                        <span className={css.extraTop}>Открыто</span>
                                        <span className={css.extraBottom}>
                                            до{' '}
                                            {
                                                getRestaurantStatusTyped(
                                                    restaurant?.worktime,
                                                    getCurrentWeekdayShort(),
                                                    getCurrentTimeShort()
                                                ).interval
                                            }
                                        </span>
                                    </div>
                                ) : (
                                    <div className={css.extraItemContent}>
                                        <span className={css.extraTop}>Закрыто</span>
                                        <span className={css.extraBottom}>
                                            до{' '}
                                            {
                                                getRestaurantStatusTyped(
                                                    restaurant?.worktime,
                                                    getCurrentWeekdayShort(),
                                                    getCurrentTimeShort()
                                                ).interval
                                            }
                                        </span>
                                    </div>
                                )
                            ) : null}
                        </time>
                    </figcaption>
                </div>
            </div>
        </figure>
    );
};
