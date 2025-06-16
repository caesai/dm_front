import classNames from 'classnames';
import css from './Ticket.module.css';
import { useNavigate } from 'react-router-dom';
import { EventTicket } from '@/types/events.ts';
import moment from 'moment';

interface Props {
    ticket: EventTicket;
}

export const Ticket = ({ ticket }: Props) => {
    const navigate = useNavigate();
    console.log('Dates: ', new Date().getTime() > new Date(ticket.date_start).getTime())
    return (
        <div
            className={classNames(
                css.card,
                css.bgImage,
                new Date().getTime() > new Date(ticket.date_start).getTime() ? css.card_date__notActive : null
                )}
            style={{
                backgroundImage: `url(${ticket.restaurant.thumbnail_photo || 'https://storage.yandexcloud.net/bottec-dreamteam/event_placeholder.png'})`,
            }}
            onClick={() => navigate(`/tickets/${ticket.id}`)}
        >
            <span className={classNames(css.card_date,
                new Date(new Date().setUTCHours(0, 0, 0, 0)).getTime() > new Date(ticket.date_start).getTime() ? css.card_date__notActive : null
                )}>
                {moment(ticket.date_start).format('DD.MM.YYYY')} в{' '}
                {moment(ticket.date_start).format('HH:mm')}
            </span>
            <div className={css.footer}>
                <span className={css.footer__title}>{ticket.event_title}</span>
                <span className={css.footer__address}>
                    {ticket.restaurant.title}
                </span>
            </div>
        </div>
    );
};
