import React, { useCallback } from 'react';
import classNames from 'classnames';
import moment from 'moment';
// Types
import { IEvent } from '@/types/events.types';
// Styles
import css from '@/components/EventCard/EventCard.module.css';

export const EventCard: React.FC<IEvent & { onClick: (id: number) => void }> = ({
    name,
    ticket_price,
    image_url,
    date_start,
    restaurant,
    id,
    tickets_left,
    onClick,
}) => {
    const sold = tickets_left === 0;
    const handleClick = useCallback(() => {
        onClick?.(id);
    }, [id, onClick]);
    return (
        <div onClick={handleClick} style={{ cursor: 'pointer', marginBottom: 5 }} data-testid="event-card">
            <div
                className={classNames(css.card, css.bgImage, sold ? css.notActive : null)}
                style={{
                    backgroundImage: `url(${image_url ? image_url : 'https://storage.yandexcloud.net/bottec-dreamteam/707bf240bfd44aefa3117dd5d4352d53.jpg'})`,
                }}
            >
                <div className={css.footer}>
                    {!sold ? (
                        <span className={classNames(css.card_price)}>
                            {Number(ticket_price) == 0 ? 'Заказ по меню' : ticket_price + ' ₽'}
                        </span>
                    ) : (
                        <span className={classNames(css.card_price)}>Sold out</span>
                    )}
                </div>
            </div>
            <div className={css.resInfo}>
                <div className={css.resTitleWrapper}>
                    <h2 className={css.resTitle}>{name}</h2>
                    <span className={css.resSlogan}>
                        {date_start && moment(date_start).format('DD.MM.YYYY')}{' '}
                        <span
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                fontSize: 2,
                                margin: '0 2px',
                                color: 'var(--dark-grey)',
                            }}
                        >
                            {'\u2B24'}
                        </span>{' '}
                        {restaurant?.title}
                    </span>
                    <span className={css.resAddress}>{restaurant?.address}</span>
                </div>
            </div>
        </div>
    );
};
