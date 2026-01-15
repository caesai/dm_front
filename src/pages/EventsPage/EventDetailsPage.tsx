/**
 * @fileoverview Страница деталей мероприятия.
 *
 * Отображает подробную информацию о мероприятии:
 * - Изображение мероприятия
 * - Название и описание
 * - Дата и время проведения
 * - Цена билета (для платных мероприятий)
 * - Количество оставшихся мест
 * - Счётчик выбора количества гостей
 * - Кнопка перехода к бронированию/покупке
 *
 * @module pages/EventsPage/EventDetailsPage
 *
 * @example
 * // Роут для страницы
 * <Route path="/events/:eventId" element={<EventDetailsPage />} />
 *
 * @see {@link EventBookingPage} - страница бронирования бесплатного мероприятия
 * @see {@link EventPurchasePage} - страница покупки билета на платное мероприятие
 * @see {@link guestCountAtom} - атом для хранения количества гостей
 */

import React, { useCallback, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Atom, useAtomValue, useSetAtom, WritableAtom } from 'jotai/index';
import moment from 'moment';
import classNames from 'classnames';
// APIs
import { BASE_BOT } from '@/api/base.ts';
// Types
import { IEvent } from '@/types/events.types.ts';
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
 * Получает eventId из URL параметров и отображает информацию о мероприятии.
 * Позволяет выбрать количество гостей и перейти к бронированию/покупке.
 *
 * ## Логика навигации:
 * - **Платное мероприятие** + onboarding пройден → `/events/{id}/purchase`
 * - **Бесплатное мероприятие** + onboarding пройден → `/events/{id}/booking`
 * - **Onboarding не пройден** → `/onboarding/3` с state `{ id, sharedEvent: true }`
 *
 * ## Условия отображения skeleton:
 * - Нет `selectedEvent.id`
 * - Нет `selectedEvent.tickets_left`
 * - Нет `selectedEvent.image_url`
 *
 * @component
 * @returns {JSX.Element} Компонент страницы деталей мероприятия
 */
export const EventDetailsPage: React.FC = (): JSX.Element => {
    const navigate = useNavigate();
    const location = useLocation();
    /** State из URL параметров */
    const state = location.state;
    /** ID мероприятия из URL параметров */
    const { eventId } = useParams();
    /** Список всех мероприятий из глобального стейта */
    const events = useAtomValue(eventsListAtom as Atom<IEvent[] | null>);
    /** Выбранное мероприятие */
    const selectedEvent = useMemo(() => {
        return events?.find((event) => event.id === Number(eventId));
    }, [events, eventId]);
    /** Сеттер для атома количества гостей */
    const setGuestCount = useSetAtom(guestCountAtom as WritableAtom<number, [number], void>);

    /** Текущее количество гостей из атома */
    const guestCount = useAtomValue(guestCountAtom);

    /** Данные текущего пользователя */
    const user = useAtomValue(userAtom);
    /** Состояние для скрытия/показа полного описания */
    const [hideAbout, setHideAbout] = useState(true);

    /**
     * Увеличивает количество гостей на 1.
     * Ограничение: не больше tickets_left.
     */
    const incCounter = () => {
        if (guestCount < Number(selectedEvent?.tickets_left)) {
            setGuestCount(guestCount + 1);
        }
    };

    /**
     * Уменьшает количество гостей на 1.
     * Ограничение: не меньше 0.
     */
    const decCounter = () => {
        if (guestCount > 0) {
            setGuestCount(guestCount - 1);
        }
    };

    /**
     * Обрабатывает переход на страницу бронирования/покупки.
     *
     * Логика:
     * 1. Если guestCount === 0 или нет selectedEvent → ничего не делать
     * 2. Если пользователь не прошёл onboarding → редирект на /onboarding/3
     * 3. Если бесплатное мероприятие → переход на /events/{id}/booking
     * 4. Если платное мероприятие → переход на /events/{id}/purchase
     */
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
            /**
             * Создаем state для перехода на страницу онбординга
             * id: id мероприятия
             * Если мероприятие бесплатное, то добавляем sharedFreeEvent: true
             * Если мероприятие платное, то добавляем sharedPaidEvent: true
             */
            const state = {
                id: selectedEvent?.id,
                ...(selectedEvent?.ticket_price === 0 ? { sharedFreeEvent: true } : { sharedPaidEvent: true }),
            };
            navigate(`/onboarding/3`, { state });
        }
    };

    /**
     * Возврат на предыдущую страницу.
     */
    const handleGoBack = () => {
        if (state?.shared) {
            navigate('/');
        } else {
            navigate('/events/');
        }
    };

    /**
     * Обработчик шаринга мероприятия.
     * @todo Реализовать функционал шаринга
     */
    const shareEvent = useCallback(() => {
        const title = '';
        const url = encodeURI(`https://t.me/${BASE_BOT}?startapp=eventId_${eventId}`);
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
    }, [eventId]);

    // ============================================
    // Состояние загрузки (Skeleton)
    // ============================================

    /**
     * Показываем skeleton пока данные не загружены.
     * Условия: нет id, нет tickets_left, нет image_url.
     */
    if (!selectedEvent?.id || !selectedEvent?.tickets_left || !selectedEvent?.image_url) {
        return (
            <Page back={!state?.shared}>
                <PageContainer className={css.detailsPage}>
                    <PlaceholderBlock width={'100%'} rounded={'20px'} aspectRatio={'3/2'} />
                    <PlaceholderBlock width={'100%'} height={'40px'} rounded={'20px'} />
                    <PlaceholderBlock width={'100%'} height={'40px'} rounded={'20px'} />
                </PageContainer>
            </Page>
        );
    }

    // ============================================
    // Основной рендер
    // ============================================

    return (
        <Page back={!state?.shared}>
            <PageContainer className={css.detailsPage}>
                {/* Шапка с навигацией */}
                <ContentBlock className={css.header}>
                    <RoundedButton icon={<BackIcon color={'var(--dark-grey)'} />} action={handleGoBack} />
                    <HeaderContent className={css.headerTitle} title="Мероприятия" />
                    <RoundedButton icon={<Share color={'var(--dark-grey)'} />} action={shareEvent} />
                </ContentBlock>

                {/* Изображение мероприятия */}
                <div
                    className={css.detailsPageThumbnail}
                    style={{
                        backgroundImage: `url(${selectedEvent?.image_url ? selectedEvent?.image_url : 'https://storage.yandexcloud.net/dreamteam-storage/67f296fadfab49a1a9bfd98a291821d5.png'}`,
                    }}
                />

                {/* Название и описание */}
                <ContentBlock className={css.detailsPageDescription}>
                    <HeaderContent className={css.detailsPageDescriptionTitle} title={selectedEvent?.name} />

                    <ContentBlock
                        className={classNames(
                            css.detailsPageDescriptionText,
                            hideAbout ? css.detailsPageDescriptionTrimLines : null
                        )}
                    >
                        {selectedEvent?.description.split(/\n|\r\n/).map((segment, index) => (
                            <p key={index}>{segment}</p>
                        ))}
                    </ContentBlock>

                    {/* Кнопка "Читать больше" для длинного описания (>100 символов) */}
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

                {/* Дата, время и цена */}
                <ContentBlock className={css.detailsPageDataRow}>
                    {/* Дата */}
                    <ContentBlock className={css.detailsPageDataCol}>
                        <span className={css.detailsPageDataColTitle}>Дата</span>
                        <span className={css.detailsPageDataColData}>
                            {moment(selectedEvent?.date_start).format('DD.MM.YYYY')}
                        </span>
                    </ContentBlock>

                    {/* Время (для бесплатных показывает диапазон) */}
                    <ContentBlock className={css.detailsPageDataCol}>
                        <span className={css.detailsPageDataColTitle}>Время</span>
                        <span className={css.detailsPageDataColData}>
                            {selectedEvent?.ticket_price == 0
                                ? `${moment(selectedEvent?.date_start).format('HH:mm')} - ${moment(selectedEvent?.date_end).format('HH:mm')}`
                                : moment(selectedEvent?.date_start).format('HH:mm')}
                        </span>
                    </ContentBlock>

                    {/* Цена (только для платных мероприятий) */}
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

                {/* Оставшиеся места и метка "предоплата" */}
                <ContentBlock className={css.detailsPageDataRow} style={{ justifyContent: 'space-between' }}>
                    {/* Оставшиеся места (только для платных) */}
                    {Number(selectedEvent?.ticket_price) !== 0 && Number(selectedEvent?.tickets_left) >= 0 && (
                        <ContentBlock className={css.detailsPageDataCol}>
                            <span className={css.detailsPageDataColTitle}>Осталось мест</span>
                            <span className={css.detailsPageDataColData}>{selectedEvent?.tickets_left}</span>
                        </ContentBlock>
                    )}

                    {/* Метка "предоплата" (только для платных) */}
                    {!isNaN(Number(selectedEvent?.ticket_price)) && Number(selectedEvent?.ticket_price) !== 0 && (
                        <ContentBlock className={css.detailsPageDataCol}>
                            <div className={css.detailsPageRoundedText}>
                                <span>предоплата</span>
                            </div>
                        </ContentBlock>
                    )}
                </ContentBlock>

                {/* Счётчик количества гостей */}
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

                {/* Кнопка бронирования/покупки (скрыта если tickets_left <= 0) */}
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
