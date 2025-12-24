import React, { Fragment, useEffect, useState } from 'react';
import { useNavigate, useOutletContext, useParams } from 'react-router-dom';
import { useAtom } from 'jotai/index';
import moment from 'moment';
import classNames from 'classnames';
// Types
import { IEvent, IEventBooking, IEventBookingContext } from '@/types/events.types.ts';
// Atoms
import { userAtom } from '@/atoms/userAtom.ts';
import { eventsListAtom, guestCountAtom } from '@/atoms/eventListAtom.ts';
// Components
import { UniversalButton } from '@/components/Buttons/UniversalButton/UniversalButton.tsx';
import { PlaceholderBlock } from '@/components/PlaceholderBlock/PlaceholderBlock.tsx';
// Styles
import css from '@/pages/EventsPage/EventDetailsPage/EventDetailsPage.module.css';

export const EventDetailsPage: React.FC = () => {
    const navigate = useNavigate();
    const { eventId } = useParams();
    const [eventBookingInfo, setEventBookingInfo] = useOutletContext<IEventBookingContext>();
    const [events] = useAtom<IEvent[] | null>(eventsListAtom);
    const [hideAbout, setHideAbout] = useState(true);
    const [guestCount, setGuestCount] = useAtom(guestCountAtom);
    const [user] = useAtom(userAtom);

    // Получаем информацию о мероприятии
    useEffect(() => {
        if (eventId) {
            const event = events?.find((e) => e.id === Number(eventId));
            if (event) {
                setEventBookingInfo(event as IEventBooking);
            }
        }
    }, [eventId, events, setEventBookingInfo]);

    // Увеличиваем количество гостей
    const incCounter = () => {
        if (guestCount !== eventBookingInfo?.tickets_left)
            setGuestCount((prev: number) => (prev < Number(eventBookingInfo?.tickets_left) ? prev + 1 : prev));
    };
    // Уменьшаем количество гостей
    const decCounter = () => {
        setGuestCount((prev: number) => (prev - 1 >= 1 ? prev - 1 : prev));
    };

    // Переход на страницу бронирования
    const next = () => {
        if (guestCount === 0 || !eventBookingInfo) return;
        let sharedState = {};
        if (eventBookingInfo.ticket_price === 0) {
            sharedState = {
                eventName: eventBookingInfo.name,
                eventId: eventBookingInfo.id,
                eventDate: {
                    title: moment(eventBookingInfo.date_start).format('YYYY-MM-DD'),
                    value: moment(eventBookingInfo.date_start).format('YYYY-MM-DD'),
                },
                eventTime: {
                    start_datetime: String(eventBookingInfo.date_start),
                    end_datetime: moment(eventBookingInfo.date_start).add(2, 'hours').toISOString(),
                    is_free: true,
                },
                eventGuestCount: guestCount,
            };
        }
        if (user?.complete_onboarding) {
            if (eventBookingInfo.ticket_price === 0) {
                navigate('/events/' + eventBookingInfo.restaurant?.id + '/booking', {
                    state: { ...sharedState },
                });
                return;
            }
            navigate(`/events/${eventBookingInfo.id}/confirm`);
        } else {
            navigate(`/onboarding/3`, { state: { id: eventBookingInfo.id, sharedEvent: true, ...sharedState } });
        }
    };
    // Если данные не загружены, то показываем skeleton из placeholder блоков
    if (!eventBookingInfo?.id || !eventBookingInfo?.tickets_left || !eventBookingInfo?.image_url) {
        return (
            <div className={css.content}>
                <PlaceholderBlock width={'100%'} rounded={'20px'} aspectRatio={'3/2'} />
                <PlaceholderBlock width={'100%'} height={'40px'} rounded={'20px'} />
                <PlaceholderBlock width={'100%'} height={'40px'} rounded={'20px'} />
            </div>
        );
    }

    return (
        <div className={css.content}>
            <div
                className={css.event_img}
                style={{
                    backgroundImage: `url(${eventBookingInfo.image_url ? eventBookingInfo.image_url : 'https://storage.yandexcloud.net/dreamteam-storage/67f296fadfab49a1a9bfd98a291821d5.png'}`,
                }}
            />
            <div className={css.content_description}>
                <h2 className={css.content_description__title}>{eventBookingInfo.name}</h2>

                <span className={classNames(css.content_description__info, hideAbout ? css.trimLines : null)}>
                    {eventBookingInfo.description.split(/\n|\r\n/).map((segment, index) => (
                        <Fragment key={index}>
                            {index > 0 && <br />}
                            {segment}
                        </Fragment>
                    ))}
                </span>
                {eventBookingInfo.description.length > 100 && (
                    <div className={css.trimLinesButton} onClick={() => setHideAbout((prev) => !prev)}>
                        <span className={css.text}>{hideAbout ? 'Читать больше' : 'Скрыть'}</span>
                    </div>
                )}
            </div>
            <div className={css.event_params}>
                <div className={css.event_params_row}>
                    <div className={css.event_params_col}>
                        <span className={css.event_params_col__title}>Дата</span>
                        <span className={css.event_params_col__data}>
                            {moment(eventBookingInfo.date_start).format('DD.MM.YYYY')}
                        </span>
                    </div>

                    <div className={css.event_params_col}>
                        <span className={css.event_params_col__title}>Время</span>
                        <span className={css.event_params_col__data}>
                            {eventBookingInfo.ticket_price == 0
                                ? `${moment(eventBookingInfo.date_start).format('HH:mm')} - ${moment(eventBookingInfo.date_end).format('HH:mm')}`
                                : moment(eventBookingInfo.date_start).format('HH:mm')}
                        </span>
                    </div>

                    {!isNaN(Number(eventBookingInfo.ticket_price)) && Number(eventBookingInfo.ticket_price) > 0 && (
                        <div className={css.event_params_col}>
                            <span className={css.event_params_col__title}>Цена</span>
                            <span className={css.event_params_col__data}>
                                {Number(eventBookingInfo.ticket_price) == 0
                                    ? 'Бесплатно'
                                    : eventBookingInfo.ticket_price + ' ₽'}
                            </span>
                        </div>
                    )}
                </div>
                <div className={css.event_params_row} style={{ justifyContent: 'space-between' }}>
                    {Number(eventBookingInfo.ticket_price) !== 0 && Number(eventBookingInfo.tickets_left) >= 0 && (
                        <div className={css.event_params_col}>
                            <span className={css.event_params_col__title}>Осталось мест</span>
                            <span className={css.event_params_col__data}>{eventBookingInfo.tickets_left}</span>
                        </div>
                    )}

                    {!isNaN(Number(eventBookingInfo.ticket_price)) && Number(eventBookingInfo.ticket_price) !== 0 && (
                        <div className={css.event_params_col}>
                            <div className={css.roundedText}>
                                <span>предоплата</span>
                            </div>
                        </div>
                    )}
                </div>
                {Number(eventBookingInfo.tickets_left) >= 0 && (
                    <div className={css.personsContainer}>
                        <span className={css.personsContainer__title}>Количество мест</span>
                        <div className={css.personCounter}>
                            <span className={css.clickableSpan} onClick={decCounter}>
                                -
                            </span>
                            <span data-testid="guest-count">{guestCount}</span>
                            <span className={css.clickableSpan} onClick={incCounter}>
                                +
                            </span>
                        </div>
                    </div>
                )}
            </div>
            {eventBookingInfo && Number(eventBookingInfo.tickets_left) > 0 && (
                <div className={css.absoluteBottom}>
                    <div className={css.bottomWrapper}>
                        <UniversalButton
                            width={'full'}
                            title={
                                !isNaN(Number(eventBookingInfo.ticket_price)) &&
                                Number(eventBookingInfo.ticket_price) > 0
                                    ? 'Купить билет'
                                    : 'Забронировать'
                            }
                            theme={'red'}
                            action={next}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};
