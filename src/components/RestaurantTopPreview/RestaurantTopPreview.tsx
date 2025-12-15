import React from 'react';
import classNames from 'classnames';
// Components
import { MoneyIcon } from '@/components/Icons/MoneyIcon.tsx';
import { TimeCircleIcon } from '@/components/Icons/TimeCircleIcon.tsx';
// Types
import { IRestaurant } from '@/types/restaurant.types.ts';
// Utils
import { getCurrentTimeShort, getCurrentWeekdayShort, getRestaurantStatusTyped } from '@/utils.ts';
// Styles
import css from '@/components/RestaurantTopPreview/RestaurantTopPreview.module.css';
import { R } from '@/__mocks__/restaurant.mock';

interface IRestaurantTopPreviewProps {
    restaurant?: IRestaurant;
}

export const RestaurantTopPreview: React.FC<IRestaurantTopPreviewProps> = ({ restaurant }) => {
    return (
        <div
            className={classNames(css.previewContainer, css.bgImage)}
            style={{ backgroundImage: `url(${restaurant?.thumbnail_photo})` }}
        >
            <div className={css.halfBlackWrapper}>
                <div className={css.previewContainerContent}>
                    <div className={css.previewMainInfo}>
                        <h1 className={css.title}>{restaurant?.title}</h1>
                        <span className={css.location}>{restaurant?.address}</span>
                    </div>
                    <div className={css.previewExtra}>
                        <div className={css.extraItem}>
                            <MoneyIcon color={'white'} size={24} />
                            <div className={css.extraItemContent}>
                                <span className={css.extraTop}>{restaurant?.avg_cheque} ₽</span>
                                <span className={css.extraBottom}>Средний чек</span>
                            </div>
                        </div>
                        <div className={css.splitter}></div>
                        <div className={css.extraItem}>
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
                                            {restaurant.id === Number(R.SELF_EDGE_SPB_CHINOIS_ID) && '21.12.2025'}
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
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
