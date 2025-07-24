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
    image: string;
}

export const BookingCard: FC<BookingCardProps> = ({
    booking_id,
    active,
    title,
    address,
    date,
    time,
    click_callback,
    image,
}) => {
    return (
        <div
            className={classNames(
                css.card,
                css.bgImage,
                !active || new Date(new Date().setUTCHours(0, 0, 0, 0)).getTime() > new Date(date).getTime() ? css.notActive : null
            )}
            style={{ backgroundImage: `url(${image ? image : bookingCard})` }}
            onClick={() => click_callback(booking_id)}
        >
            <span
                className={classNames(
                    css.card_date,
                    !active || new Date(new Date().setUTCHours(0, 0, 0, 0)).getTime() > new Date(date).getTime() ? css.card_date__notActive : null
                )}
            >
                {new Date(date).toLocaleDateString('ru-RU')} в {time}
            </span>
            <div className={css.footer}>
                <span className={css.footer__title}>{title}</span>
                <span className={css.footer__address}>{address}</span>
            </div>
        </div>
    );
};
