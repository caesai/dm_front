import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Outlet, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAtom } from 'jotai/index';
// Types
import { IEventBooking, IEvent } from '@/types/events.types.ts';
// APIs
import { BASE_BOT } from '@/api/base.ts';
// Atoms
import { eventsListAtom, guestCountAtom } from '@/atoms/eventListAtom.ts';
// Components
import { Page } from '@/components/Page.tsx';
import { RoundedButton } from '@/components/RoundedButton/RoundedButton.tsx';
import { BackIcon } from '@/components/Icons/BackIcon.tsx';
import { Share } from '@/components/Icons/Share.tsx';
import { PlaceholderBlock } from '@/components/PlaceholderBlock/PlaceholderBlock.tsx';
// Hooks
import { useNavigationHistory } from '@/hooks/useNavigationHistory.ts';
// Styles
import css from './EventsPage.module.css';

export const EventsPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [params] = useSearchParams();

    const [events] = useAtom<IEvent[]>(eventsListAtom);
    const [, setGuestCount] = useAtom(guestCountAtom);
    const [bookingInfo, setBookingInfo] = useState<IEventBooking>({});

    const { goBack } = useNavigationHistory();


    useEffect(() => {
        const pathSegments = location.pathname.split('/');
        if (pathSegments[2] !== undefined) {
            if (events === undefined) return;
            const event = events.find(item => String(item.id) === String(pathSegments[2]));
            if (event !== undefined) {
                setBookingInfo((prev) => ({
                    ...prev,
                    event: event,
                    restaurant: event?.restaurant,
                }));
            }
        }
    }, [location.pathname, events]);

    const isRestaurantsPage = useMemo(() => {
        return location.pathname.split('/').at(-1) === 'restaurant';
    }, [location.pathname]);

    const eventURL = useMemo(() => {
        return location.pathname.split('/')[2] && !location.pathname.includes('confirm');
    }, [location.pathname]);

    const shareEvent = useCallback(() => {
        const url = encodeURI(
            `https://t.me/${BASE_BOT}?startapp=eventId_${bookingInfo.event?.id}`
        );
        const title = encodeURI(String(bookingInfo.event?.name));
        const shareData = {
            title,
            url,
        }
        try {
            if (navigator && navigator.canShare(shareData)) {
                navigator.share(shareData).then().catch((err) => {
                    console.error(JSON.stringify(err));
                });
            }
        } catch (e) {
            window.open(`https://t.me/share/url?url=${url}&text=${title}`, "_blank");
        }
    }, [bookingInfo.event?.id, bookingInfo.event?.name]);

    useEffect(() => {
        // TODO: handling error through Modal Popup
        if (params.get('paymentError')) {
            console.log('Или отмена или платеж еще не прошел');
        }
        if (params.get('error')) {
            alert('Возникла ошибка при оплате мероприятия');
        }
    }, [params]);

    const goPreviousPage = () => {
        if (eventURL) {
            setGuestCount(0);
        }
        if (Boolean(params.get('shared'))) {
            navigate('/', { replace: true });
        } else if (location.pathname.includes('super') && !location.pathname.includes('apply')) {
            navigate('/', { replace: true });
        } else {
            goBack();
        }
    };

    return (
        <Page back={true}>
            <div className={css.page}>
                <div className={css.header}>
                    <RoundedButton
                        bgColor={'var(--primary-background)'}
                        icon={<BackIcon color={'var(--dark-grey)'} />}
                        action={goPreviousPage}
                    />
                    <span className={css.header_title}>
                        {isRestaurantsPage ? 'Выберите ресторан' : 'Мероприятия'}
                    </span>
                    <div className={css.header_spacer}>
                        {(!location.pathname.includes('super')) ? (
                            <RoundedButton
                                icon={
                                    <Share color={'var(--dark-grey)'} />
                                }
                                action={shareEvent}
                            />
                        ) : null}
                    </div>
                </div>
                {events.length === 0 ? (
                    <div>
                        <PlaceholderBlock
                            width={'100%'}
                            aspectRatio={'3/2'}
                        />
                        <div style={{marginTop: 10}}>
                            <PlaceholderBlock
                                width={'100%'}
                                height={'32px'}

                            />
                        </div>
                        <div style={{marginTop: 10}}>
                            <PlaceholderBlock
                                width={'100%'}
                                height={'32px'}

                            />
                        </div>
                    </div>
                ) : (
                    <Outlet context={[bookingInfo, setBookingInfo]} />
                )}
            </div>
        </Page>
    );
};
