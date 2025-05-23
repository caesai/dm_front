import css from './BookingCard.module.css';
import { FC } from 'react';
import classNames from 'classnames';
import bookingCard from '/img/bookingCard.png';

interface BookingCardProps {
    booking_id: number;
    active: boolean;
    title: string;
    address: string;
    date: string;
    time: string;
    click_callback: (id: number) => void;
}

export const BookingCard: FC<BookingCardProps> = ({
    booking_id,
    active,
    title,
    address,
    date,
    time,
    click_callback,
}) => {
    return (
        <div
            className={classNames(
                css.card,
                css.bgImage,
                !active ? css.notActive : null
            )}
            style={{ backgroundImage: `url(${bookingCard})` }}
            onClick={() => click_callback(booking_id)}
        >
            <span
                className={classNames(
                    css.card_date,
                    !active ? css.card_date__notActive : null
                )}
            >
                {new Date(date).toLocaleDateString()} в {time}
            </span>
            <div className={css.footer}>
                <span className={css.footer__title}>{title}</span>
                <span className={css.footer__address}>{address}</span>
            </div>
        </div>
    );
};
