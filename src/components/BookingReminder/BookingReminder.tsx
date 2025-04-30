import { FC } from 'react';
import css from './BookingReminder.module.css';
import { TimeCircle } from '@/components/Icons/TimeCircle.tsx';
import { CalendarIcon } from '@/components/Icons/CalendarIcon.tsx';
import { UsersIcon } from '@/components/Icons/UsersIcon.tsx';
import { useNavigate } from 'react-router-dom';

interface BookingReminderProps {
    id: number;
    title: string;
    date: string;
    time: string;
    address: string;
    persons: number;
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
            onClick={() => navigate(`/myBookings/${p.id}`)}
        >
            <div className={css.inner}>
                <span className={css.title}>{p.title}</span>
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
                            {formatDate(p.date)}
                        </span>
                    </div>
                    <div className={css.subItem}>
                        <UsersIcon
                            size={16}
                            color={'var(--dark-grey)'}
                        ></UsersIcon>
                        <span className={css.subText}>{p.persons}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
