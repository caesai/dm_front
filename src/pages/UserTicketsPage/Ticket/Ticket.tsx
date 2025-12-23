import React from 'react';
import { useNavigate } from 'react-router-dom';
import classNames from 'classnames';
import moment from 'moment';
// Types
import { IEventTicket } from '@/types/events.types';
// Styles
import css from '@/pages/UserTicketsPage/Ticket/Ticket.module.css';

interface ITicketProps {
    ticket: IEventTicket;
}

export const Ticket: React.FC<ITicketProps> = ({ ticket }) => {
    const navigate = useNavigate();
    return (
        <div
            className={classNames(
                css.card,
                css.bgImage,
                new Date().getTime() > new Date(ticket.date_start).getTime() ? css.card_date__notActive : null
            )}
            style={{
                backgroundImage: `url(${ticket.event_img || 'https://storage.yandexcloud.net/bottec-dreamteam/707bf240bfd44aefa3117dd5d4352d53.jpg'})`,
            }}
            onClick={() => navigate(`/tickets/${ticket.id}`)}
        >
            <span
                className={classNames(
                    css.card_date,
                    new Date(new Date().setUTCHours(0, 0, 0, 0)).getTime() > new Date(ticket.date_start).getTime()
                        ? css.card_date__notActive
                        : null
                )}
            >
                {moment(ticket.date_start).format('DD.MM.YYYY')} в {moment(ticket.date_start).format('HH:mm')}
            </span>
            <div className={css.footer}>
                <span className={css.footer__title}>{ticket.event_title}</span>
                <span className={css.footer__address}>{ticket.restaurant.title}</span>
            </div>
        </div>
    );
};
