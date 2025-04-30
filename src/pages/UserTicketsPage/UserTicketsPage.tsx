import { Page } from '@/components/Page.tsx';
import css from './UserTicketsPage.module.css';
import { RoundedButton } from '@/components/RoundedButton/RoundedButton.tsx';
import { BackIcon } from '@/components/Icons/BackIcon.tsx';
import { useNavigate } from 'react-router-dom';
import { Ticket } from '@/pages/UserTicketsPage/Ticket/Ticket.tsx';
import { useEffect, useState } from 'react';
import { EventTicket } from '@/types/events.ts';
import { useAtom } from 'jotai';
import { authAtom } from '@/atoms/userAtom.ts';
import { APIGetTickets } from '@/api/events.ts';
import { PlaceholderBlock } from '@/components/PlaceholderBlock/PlaceholderBlock.tsx';

export const UserTicketsPage = () => {
    const navigate = useNavigate();
    const [auth] = useAtom(authAtom);

    const [tickets, setTickets] = useState<EventTicket[]>([]);
    const [eventsLoading, setEventsLoading] = useState(true);
    useEffect(() => {
        if (!auth?.access_token) {
            return;
        }
        setEventsLoading(true);
        APIGetTickets(auth.access_token)
            .then((res) => setTickets(res.data))
            .finally(() => setEventsLoading(false));
    }, []);

    return (
        <Page back={true}>
            <div className={css.page}>
                <div className={css.header}>
                    <RoundedButton
                        icon={<BackIcon size={24} color={'var(--dark-grey)'} />}
                        action={() => navigate('/')}
                        bgColor={'var(--primary-background)'}
                    />
                    <span className={css.header_title}>Мои билеты</span>
                    <div className={css.header_spacer} />
                </div>

                <div className={css.cards}>
                    {eventsLoading
                        ? Array(3)
                              .fill(0)
                              .map((_, i) => (
                                  <PlaceholderBlock
                                      key={i}
                                      width={'100%'}
                                      rounded={'16px'}
                                      aspectRatio={'3/2'}
                                  />
                              ))
                        : null}
                    {!tickets.length && !eventsLoading ? (
                        <span>Список билетов пуст</span>
                    ) : null}
                    {tickets.map((ticket, i) => (
                        <Ticket key={i} ticket={ticket} />
                    ))}
                </div>
            </div>
        </Page>
    );
};
