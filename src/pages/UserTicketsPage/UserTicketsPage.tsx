import React, { useEffect, useState } from 'react';
import { useAtom } from 'jotai';
// APIs
import { APIGetTickets } from '@/api/events.api.ts';
// Types
import { IEventTicket } from '@/types/events.types.ts';
// Atoms
import { authAtom } from '@/atoms/userAtom.ts';
// Components
import { Page } from '@/components/Page.tsx';
import { RoundedButton } from '@/components/RoundedButton/RoundedButton.tsx';
import { BackIcon } from '@/components/Icons/BackIcon.tsx';
import { Ticket } from '@/pages/UserTicketsPage/Ticket/Ticket.tsx';
import { PlaceholderBlock } from '@/components/PlaceholderBlock/PlaceholderBlock.tsx';
// Hooks
import { useNavigationHistory } from '@/hooks/useNavigationHistory.ts';
// Styles
import css from '@/pages/UserTicketsPage/UserTicketsPage.module.css';

export const UserTicketsPage: React.FC = () => {
    const [auth] = useAtom(authAtom);
    const { goBack } = useNavigationHistory();
    const [tickets, setTickets] = useState<IEventTicket[]>([]);
    const [eventsLoading, setEventsLoading] = useState(true);

    useEffect(() => {
        if (!auth?.access_token) {
            return;
        }
        setEventsLoading(true);
        APIGetTickets(auth.access_token)
            .then((res) => setTickets(res.data))
            .catch((err) => console.error(err))
            .finally(() => setEventsLoading(false));
    }, []);

    return (
        <Page back={true}>
            <div className={css.page}>
                <div className={css.header}>
                    <RoundedButton
                        icon={<BackIcon size={24} color={'var(--dark-grey)'} />}
                        action={goBack}
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
                                  <PlaceholderBlock key={i} width={'100%'} rounded={'16px'} aspectRatio={'3/2'} />
                              ))
                        : null}
                    {!tickets.length && !eventsLoading ? <span className={css.empty}>Список билетов пуст</span> : null}
                    {tickets
                        .sort(function (a, b) {
                            const aDate = new Date(a.date_start);
                            const bDate = new Date(b.date_start);
                            return bDate.getTime() - aDate.getTime();
                        })
                        .map((ticket, i) => (
                            <Ticket key={i} ticket={ticket} />
                        ))}
                </div>
            </div>
        </Page>
    );
};
