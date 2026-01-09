import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAtom, useAtomValue } from 'jotai';
import moment from 'moment';
import classNames from 'classnames';
// APIs
import { APICreateInvoice } from '@/api/events.api.ts';
// Atoms
import { authAtom, userAtom } from '@/atoms/userAtom.ts';
import { guestCountAtom, eventsListAtom } from '@/atoms/eventListAtom.ts';
// Components
import { Page } from '@/components/Page.tsx';
import { ContentBlock } from '@/components/ContentBlock/ContentBlock.tsx';
import { Loader } from '@/components/AppLoadingScreen/AppLoadingScreen.tsx';
import { BottomButtonWrapper } from '@/components/BottomButtonWrapper/BottomButtonWrapper.tsx';
import { RoundedButton } from '@/components/RoundedButton/RoundedButton.tsx';
import { HeaderContent } from '@/components/ContentBlock/HeaderContainer/HeaderContent/HeaderContainer.tsx';
import { TextInput } from '@/components/TextInput/TextInput.tsx';
// Icons
import { CalendarIcon } from '@/components/Icons/CalendarIcon.tsx';
import { ClockIcon } from '@/components/Icons/ClockIcon.tsx';
import { HomeIcon } from '@/components/Icons/HomeIcon.tsx';
import { PinIcon } from '@/components/Icons/PinIcon.tsx';
import { BackIcon } from '@/components/Icons/BackIcon.tsx';
import { Share } from '@/components/Icons/Share.tsx';
// Styles
import css from '@/pages/EventsPage/EventsPage.module.css';
import { PageContainer } from '@/components/PageContainer/PageContainer';

/**
 * Страница покупки билета на мероприятие.
 *
 * @component
 * @returns {JSX.Element} Компонент страницы покупки билета на мероприятие
 */
export const EventPurchasePage: React.FC = (): JSX.Element => {
    const navigate = useNavigate();
    const { eventId } = useParams();
    const events = useAtomValue(eventsListAtom);
    const selectedEvent = useMemo(() => events?.find((event) => event.id === Number(eventId)), [events, eventId]);
    const guestCount = useAtomValue(guestCountAtom);

    const [auth] = useAtom(authAtom);
    const [user] = useAtom(userAtom);
    const [userInfo, setUserInfo] = useState({
        name: `${user?.first_name}`,
        phone: `${user?.phone_number}`,
        commentary: '',
    });
    const [loading, setLoading] = useState(false);

    const calculateTotal = useMemo(() => {
        const ticketPrice = selectedEvent?.ticket_price;
        if (ticketPrice === undefined) {
            return null;
        }
        return guestCount * ticketPrice;
    }, [selectedEvent]);

    const validate = useMemo(() => {
        return userInfo.name && userInfo.phone && auth?.access_token;
    }, [userInfo, auth]);

    const createInvoice = () => {
        if (selectedEvent?.date_start && userInfo.name && userInfo.phone && auth?.access_token && guestCount) {
            setLoading(true);
            APICreateInvoice(
                selectedEvent,
                userInfo.name,
                userInfo.phone,
                userInfo.commentary,
                guestCount,
                auth?.access_token
            )
                .then((res) => {
                    res.data.payment_url
                        ? window.location.replace(res.data.payment_url)
                        : navigate('/tickets/' + res.data.booking_id);
                })
                .catch((error) => {
                    setLoading(false);
                    // TODO: Handle Error Using Modal Popup
                    console.error(error);
                });
        }
    };
    const handleGoBack = () => {
        navigate(-1);
    };
    const shareEvent = () => {
        console.log('shareEvent');
    };

    if (loading) {
        return (
            <Page back={true} className={css.eventPurchasePage}>
                <Loader />
            </Page>
        );
    }

    return (
        <Page back={true} >
            <PageContainer className={css.eventPurchasePage}>
                <ContentBlock className={css.header}>
                    <RoundedButton icon={<BackIcon color={'var(--dark-grey)'} />} action={handleGoBack} />
                    <HeaderContent className={css.headerTitle} title="Мероприятия" />
                    <RoundedButton icon={<Share color={'var(--dark-grey)'} />} action={shareEvent} />
                </ContentBlock>
                <HeaderContent className={css.eventPurchasePageTitle} title="Детали заказа" />
                <HeaderContent className={css.eventPurchasePageSubtitle} title={selectedEvent?.name} />
                <ContentBlock className={css.eventPurchasePageDates}>
                    <ContentBlock className={css.eventPurchasePageDataRow}>
                        <ClockIcon size={16} color={'#989898'} />
                        <time>{moment(selectedEvent?.date_start).format('HH:mm')} </time>
                    </ContentBlock>
                    <ContentBlock className={css.eventPurchasePageDataRow}>
                        <CalendarIcon size={18} color={'#989898'} />
                        <time dateTime={selectedEvent?.date_start}>
                            {selectedEvent?.date_start && moment(selectedEvent?.date_start).format('DD.MM.YYYY')}
                        </time>
                    </ContentBlock>
                </ContentBlock>
                <ContentBlock className={css.eventPurchasePageDataRow}>
                    <HomeIcon size={18} color={'#989898'} />
                    <span>{selectedEvent?.restaurant?.title}</span>
                </ContentBlock>
                <ContentBlock className={css.eventPurchasePageDataRow}>
                    <PinIcon size={18} />
                    <span>{selectedEvent?.restaurant?.address}</span>
                </ContentBlock>
                <div className={css.hr} />
                <ContentBlock className={classNames(css.eventPurchasePageDataRow, css.justifyBetween)}>
                    <span className={css.eventPurchasePageDataRowSmall}>Количество билетов</span>
                    <span className={css.eventPurchasePageDataRowBold}>{guestCount}</span>
                </ContentBlock>
                <ContentBlock className={classNames(css.eventPurchasePageDataRow, css.justifyBetween)}>
                    <span className={css.eventPurchasePageDataRowSmall}>Предоплата</span>
                    <span className={css.eventPurchasePageDataRowBold}>{calculateTotal + ' ₽'}</span>
                </ContentBlock>
                <ContentBlock className={css.eventPurchasePageDataRow}>
                    <span className={css.eventPurchaseCancellationPolicy}>
                        Если вы захотите сдать билет менее чем за 3 дня до
                        <br />
                        мероприятия, мы вернем 50% его стоимости.
                    </span>
                </ContentBlock>
                <ContentBlock className={css.contentItem}>
                    <HeaderContent className={css.contentItem__title} title="Контакты" />
                    <ContentBlock className={css.form}>
                        <TextInput
                            value={userInfo.name}
                            onChange={(e) => setUserInfo((p) => ({ ...p, name: e }))}
                            placeholder={'Имя'}
                        />
                        <TextInput
                            value={userInfo.phone}
                            onChange={(e) => setUserInfo((p) => ({ ...p, phone: e }))}
                            placeholder={'Номер телефона'}
                        />
                    </ContentBlock>
                </ContentBlock>
                <BottomButtonWrapper
                    isDisabled={!validate}
                    isLoading={loading}
                    onClick={createInvoice}
                    content={'Оплатить'}
                />
            </PageContainer>
        </Page>
    );
};
