import { FC } from 'react';
import css from './BookingReminder.module.css';
import { TimeCircle } from '@/components/Icons/TimeCircle.tsx';
import { CalendarIcon } from '@/components/Icons/CalendarIcon.tsx';
import { UsersIcon } from '@/components/Icons/UsersIcon.tsx';
import { useNavigate } from 'react-router-dom';
import { ChildrenIcon } from '@/components/Icons/ChildrenIcon.tsx';
import { weekdaysMap } from '@/utils.ts';
import { TicketIcon } from '@/components/Icons/TicketIcon.tsx';

interface BookingReminderProps {
    id: number;
    title: string;
    date: string;
    time: string;
    address: string;
    persons: number;
    children: number;
    booking_type?: string;
    event_title?: string;
}

const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
    });
};

export const BookingReminder: FC<BookingReminderProps> = (p) => {
    const navigate = useNavigate();
    return (
        <div
            className={css.bookingReminder}
            onClick={() => p.booking_type === 'event' ? navigate(`/tickets/${p.id}`) : navigate(`/myBookings/${p.id}`)}
        >
            <div className={css.inner}>
                <span className={css.title}>{p.booking_type === 'event' ? p.event_title : p.title}</span>
                {p.booking_type === 'event' ? <span className={css.subText}>{p.title}</span> : null}
                <span className={css.subText}>{p.address}</span>
                <div className={css.sub}>
                    <div className={css.subItem}>
                        <TimeCircle
                            size={16}
                            color={'var(--dark-grey)'}
                        ></TimeCircle>
                        <span className={css.subText}>{p.time}</span>
                    </div>
                    <div className={css.subItem}>
                        <CalendarIcon
                            size={16}
                            color={'var(--dark-grey)'}
                        ></CalendarIcon>
                        <span className={css.subText}>
                            {formatDate(p.date)}, {weekdaysMap[new Date(p.date).getDay()]}
                        </span>
                    </div>
                    <div className={css.subItem}>
                        {p.booking_type === 'event' ? (
                            <TicketIcon size={16} />
                        ) : (
                            <UsersIcon size={16} color={'var(--dark-grey)'} />
                        )}
                        <span className={css.subText}>{p.persons}</span>
                        {!!p.children && (
                            <>
                                <ChildrenIcon size={16} />
                                <span className={css.subText}>{p.children}</span>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
