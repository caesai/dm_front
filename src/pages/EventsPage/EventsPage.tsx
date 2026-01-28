import React, { useCallback, useState } from 'react';
import { Outlet, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAtomValue, useSetAtom, WritableAtom } from 'jotai/index';
// Types
import { IEventBooking } from '@/types/events.types.ts';
// APIs
import { BASE_BOT } from '@/api/base.ts';
// Atoms
import { guestCountAtom } from '@/atoms/eventListAtom.ts';
// Components
import { Page } from '@/components/Page.tsx';
import { RoundedButton } from '@/components/RoundedButton/RoundedButton.tsx';
import { BackIcon } from '@/components/Icons/BackIcon.tsx';
import { Share } from '@/components/Icons/Share.tsx';
// Hooks
import { useNavigationHistory } from '@/hooks/useNavigationHistory.ts';
// Styles
import css from '@/pages/EventsPage/EventsPage.module.css';
import { getCurrentCity } from '@/atoms/cityListAtom.ts';
/**
 * Страница мероприятий.
 *
 * Позволяет просматривать список мероприятий и детали конкретного мероприятия.
 * Также предоставляет возможность шэринга мероприятия.
 *
 * @component
 * @returns {JSX.Element} Компонент страницы мероприятий
 */
export const EventsPage: React.FC = (): JSX.Element => {
    const navigate = useNavigate();
    const location = useLocation();
    const [params] = useSearchParams();

    const setGuestCount = useSetAtom(guestCountAtom as WritableAtom<number, [number], void>);
    const currentCity = useAtomValue(getCurrentCity);

    const [eventBookingInfo, setEventBookingInfo] = useState<IEventBooking | null>(null);

    const { goBack } = useNavigationHistory();

    // Шэринг мероприятия
    const shareEvent = useCallback(() => {
        let url = '';
        const title = '';
        // Если это страница мероприятия
        if (eventBookingInfo?.name) {
            // title = encodeURI(String(eventBookingInfo?.name));
            url = encodeURI(`https://t.me/${BASE_BOT}?startapp=eventId_${eventBookingInfo?.id}`);
        } else {
            // Если это страница списка мероприятий: ссылка на мероприятия в выбранном городе и ресторан не выбран,
            // то шэрим все мероприятия в выбранном городе, иначе шэрим мероприятие в выбранном ресторане
            if (eventBookingInfo?.restaurantId !== 'unset') {
                url = encodeURI(`https://t.me/${BASE_BOT}?startapp=event_restaurantId_${eventBookingInfo?.restaurantId}`);
                // title = encodeURI(String(eventBookingInfo?.restaurantId));
            } else {
                url = encodeURI(`https://t.me/${BASE_BOT}?startapp=event_cityId_${currentCity.id}`);
                // title = encodeURI(String(currentCityA));
            }
        }
        const shareData = {
            title,
            url,
        };
        try {
            if (navigator && navigator.canShare(shareData)) {
                navigator
                    .share(shareData)
                    .then()
                    .catch((err) => {
                        console.error(JSON.stringify(err));
                    });
            }
        } catch (e) {
            window.open(`https://t.me/share/url?url=${url}&text=${title}`, '_blank');
        }
    }, [eventBookingInfo?.id, eventBookingInfo?.name, eventBookingInfo?.restaurantId, currentCity.id]);


    const goToPreviousPage = useCallback(() => {
        // Если это страница деталей мероприятия, то сбрасываем гостей и информацию о мероприятии и переходим на страницу списка мероприятий
        if (eventBookingInfo && eventBookingInfo?.name) {
            setGuestCount(0);
            setEventBookingInfo(null);
            navigate('/events', { replace: true });
        } else {
            // Если это страница списка мероприятий, то возвращаемся на предыдущую страницу
            goBack();
        }
        // Если на страницу мероприятия перешли из бота, то возвращаемся на главную страницу
        if (Boolean(params.get('shared'))) {
            navigate('/', { replace: true });
        }
    }, [eventBookingInfo, setGuestCount, setEventBookingInfo, navigate, goBack, params]);

    return (
        <Page back={true}>
            <div className={css.page}>
                <div className={css.header}>
                    <RoundedButton
                        bgColor={'var(--primary-background)'}
                        icon={<BackIcon color={'var(--dark-grey)'} />}
                        action={goToPreviousPage}
                    />
                    <span className={css.header_title}>{'Мероприятия'}</span>
                    <div className={css.header_spacer}>
                        {!location.pathname.includes('super') ? (
                            <RoundedButton icon={<Share color={'var(--dark-grey)'} />} action={shareEvent} />
                        ) : null}
                    </div>
                </div>
                <Outlet context={[eventBookingInfo, setEventBookingInfo]} />
            </div>
        </Page>
    );
};
