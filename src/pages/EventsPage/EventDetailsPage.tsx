import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Atom, useAtomValue, useSetAtom, WritableAtom } from 'jotai/index';
import moment from 'moment';
import classNames from 'classnames';
// Types
import { IEvent, IEventBooking } from '@/types/events.types.ts';
// Atoms
import { userAtom } from '@/atoms/userAtom.ts';
import { eventsListAtom, guestCountAtom } from '@/atoms/eventListAtom.ts';
// Components
import { Page } from '@/components/Page.tsx';
import { PageContainer } from '@/components/PageContainer/PageContainer.tsx';
import { HeaderContent } from '@/components/ContentBlock/HeaderContainer/HeaderContent/HeaderContainer.tsx';
import { BackIcon } from '@/components/Icons/BackIcon.tsx';
import { Share } from '@/components/Icons/Share.tsx';
import { RoundedButton } from '@/components/RoundedButton/RoundedButton.tsx';
import { ContentBlock } from '@/components/ContentBlock/ContentBlock.tsx';
import { PlaceholderBlock } from '@/components/PlaceholderBlock/PlaceholderBlock.tsx';
import { BottomButtonWrapper } from '@/components/BottomButtonWrapper/BottomButtonWrapper.tsx';
// Styles
import css from '@/pages/EventsPage/EventsPage.module.css';

/**
 * Страница деталей мероприятия.
 *
 * @component
 * @returns {JSX.Element} Компонент страницы деталей мероприятия
 */
export const EventDetailsPage: React.FC = (): JSX.Element => {
    const navigate = useNavigate();
    const { eventId } = useParams();
    const events = useAtomValue(eventsListAtom as Atom<IEvent[] | null>);
    const [hideAbout, setHideAbout] = useState(true);
    const setGuestCount = useSetAtom(guestCountAtom as WritableAtom<number, [number], void>);
    const guestCount = useAtomValue(guestCountAtom);
    const user = useAtomValue(userAtom);
    const [selectedEvent, setSelectedEvent] = useState<IEvent | null>(null);
    // Получаем информацию о мероприятии
    useEffect(() => {
        if (eventId) {
            const event = events?.find((e) => e.id === Number(eventId));
            if (event) {
                setSelectedEvent(event as IEventBooking);
            }
        }
    }, [eventId, events, setSelectedEvent]);

    // Увеличиваем количество гостей
    const incCounter = () => {
        if (guestCount < Number(selectedEvent?.tickets_left)) {
            setGuestCount(guestCount + 1);
        }
    };
    // Уменьшаем количество гостей
    const decCounter = () => {
        if (guestCount > 0) {
            setGuestCount(guestCount - 1);
        }
    };

    // Переход на страницу бронирования
    const next = () => {
        if (guestCount === 0 || !selectedEvent) return;
        
        if (user?.complete_onboarding) {
            if (selectedEvent?.ticket_price === 0) {
                // Переход на страницу бронирования бесплатного мероприятия
                navigate('/events/' + selectedEvent?.id + '/booking');
                return;
            }
            // Переход на страницу покупки билета на мероприятие
            navigate(`/events/${selectedEvent?.id}/purchase`);
        } else {
            navigate(`/onboarding/3`, { state: { id: selectedEvent?.id, sharedEvent: true} });
        }
    };
    // Если данные не загружены, то показываем skeleton из placeholder блоков
    if (!selectedEvent?.id || !selectedEvent?.tickets_left || !selectedEvent?.image_url) {
        return (
            <Page back={true}>
                <PageContainer className={css.detailsPage}>
                    <PlaceholderBlock width={'100%'} rounded={'20px'} aspectRatio={'3/2'} />
                    <PlaceholderBlock width={'100%'} height={'40px'} rounded={'20px'} />
                    <PlaceholderBlock width={'100%'} height={'40px'} rounded={'20px'} />
                </PageContainer>
            </Page>
        );
    }

    const handleGoBack = () => {
        navigate(-1);
    };

    const shareEvent = () => {
        console.log('shareEvent');
    };

    return (
        <Page back={true}>
            <PageContainer className={css.detailsPage}>
                <ContentBlock className={css.header}>
                    <RoundedButton icon={<BackIcon color={'var(--dark-grey)'} />} action={handleGoBack} />
                    <HeaderContent className={css.headerTitle} title="Мероприятия" />
                    <RoundedButton icon={<Share color={'var(--dark-grey)'} />} action={shareEvent} />
                </ContentBlock>
                <div
                    className={css.detailsPageThumbnail}
                    style={{
                        backgroundImage: `url(${selectedEvent?.image_url ? selectedEvent?.image_url : 'https://storage.yandexcloud.net/dreamteam-storage/67f296fadfab49a1a9bfd98a291821d5.png'}`,
                    }}
                />
                <ContentBlock className={css.detailsPageDescription}>
                    <HeaderContent className={css.detailsPageDescriptionTitle} title={selectedEvent?.name} />

                    <ContentBlock
                        className={classNames(
                            css.detailsPageDescriptionText,
                            hideAbout ? css.detailsPageDescriptionTrimLines : null
                        )}
                    >
                        {selectedEvent?.description
                            .split(/\n|\r\n/)
                            .map((segment, index) => <p key={index}>{segment}</p>)}
                    </ContentBlock>
                    {selectedEvent?.description && selectedEvent?.description.length > 100 && (
                        <button
                            className={css.detailsPageDescriptionTrimLinesButton}
                            onClick={() => setHideAbout((prev) => !prev)}
                        >
                            <span className={css.detailsPageDescriptionTrimLinesButtonText}>
                                {hideAbout ? 'Читать больше' : 'Скрыть'}
                            </span>
                        </button>
                    )}
                </ContentBlock>
                <ContentBlock className={css.detailsPageDataRow}>
                    <ContentBlock className={css.detailsPageDataCol}>
                        <span className={css.detailsPageDataColTitle}>Дата</span>
                        <span className={css.detailsPageDataColData}>
                            {moment(selectedEvent?.date_start).format('DD.MM.YYYY')}
                        </span>
                    </ContentBlock>

                    <ContentBlock className={css.detailsPageDataCol}>
                        <span className={css.detailsPageDataColTitle}>Время</span>
                        <span className={css.detailsPageDataColData}>
                            {selectedEvent?.ticket_price == 0
                                ? `${moment(selectedEvent?.date_start).format('HH:mm')} - ${moment(selectedEvent?.date_end).format('HH:mm')}`
                                : moment(selectedEvent?.date_start).format('HH:mm')}
                        </span>
                    </ContentBlock>

                    {!isNaN(Number(selectedEvent?.ticket_price)) && Number(selectedEvent?.ticket_price) > 0 && (
                        <ContentBlock className={css.detailsPageDataCol}>
                            <span className={css.detailsPageDataColTitle}>Цена</span>
                            <span className={css.detailsPageDataColData}>
                                {Number(selectedEvent?.ticket_price) == 0
                                    ? 'Бесплатно'
                                    : selectedEvent?.ticket_price + ' ₽'}
                            </span>
                        </ContentBlock>
                    )}
                </ContentBlock>
                <ContentBlock className={css.detailsPageDataRow} style={{ justifyContent: 'space-between' }}>
                    {Number(selectedEvent?.ticket_price) !== 0 && Number(selectedEvent?.tickets_left) >= 0 && (
                        <ContentBlock className={css.detailsPageDataCol}>
                            <span className={css.detailsPageDataColTitle}>Осталось мест</span>
                            <span className={css.detailsPageDataColData}>{selectedEvent?.tickets_left}</span>
                        </ContentBlock>
                    )}

                    {!isNaN(Number(selectedEvent?.ticket_price)) && Number(selectedEvent?.ticket_price) !== 0 && (
                        <ContentBlock className={css.detailsPageDataCol}>
                            <div className={css.detailsPageRoundedText}>
                                <span>предоплата</span>
                            </div>
                        </ContentBlock>
                    )}
                </ContentBlock>

                {Number(selectedEvent?.tickets_left) >= 0 && (
                    <ContentBlock className={css.detailsPageGuestCounterContainer}>
                        <span className={css.detailsPageGuestCounterTitle}>Количество мест</span>
                        <ContentBlock className={css.detailsPageGuestCounter}>
                            <span className={css.detailsPageGuestCounterButton} onClick={decCounter}>
                                -
                            </span>
                            <span data-testid="guest-count">{guestCount}</span>
                            <span className={css.detailsPageGuestCounterButton} onClick={incCounter}>
                                +
                            </span>
                        </ContentBlock>
                    </ContentBlock>
                )}
                {selectedEvent && Number(selectedEvent?.tickets_left) > 0 && (
                    <BottomButtonWrapper
                        onClick={next}
                        content={
                            !isNaN(Number(selectedEvent?.ticket_price)) && Number(selectedEvent?.ticket_price) > 0
                                ? 'Купить билет'
                                : 'Забронировать'
                        }
                        isDisabled={guestCount === 0 || !selectedEvent}
                        isLoading={false}
                    />
                )}
            </PageContainer>
        </Page>
    );
};
