import React, { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import css from './EventConfirmationOutlet.module.css';
import { IEventBookingContext } from '@/utils.ts';
import { UniversalButton } from '@/components/Buttons/UniversalButton/UniversalButton.tsx';
import moment from 'moment';
import classNames from 'classnames';
import { useAtom } from 'jotai/index';
import { guestCountAtom } from '@/atoms/eventBookingAtom.ts';
import { userAtom } from '@/atoms/userAtom.ts';
import { ITimeSlot } from '@/pages/BookingPage/BookingPage.types.ts';
import { bookingDateAtom, timeslotAtom } from '@/atoms/bookingInfoAtom.ts';
import { PlaceholderBlock } from '@/components/PlaceholderBlock/PlaceholderBlock.tsx';

export const EventConfirmationOutlet: React.FC = () => {
    const navigate = useNavigate();
    const [bookingInfo] = useOutletContext<IEventBookingContext>();
    const [hideAbout, setHideAbout] = useState(true);
    const [guestCount, setGuestCount] = useAtom(guestCountAtom);
    const [user] = useAtom(userAtom);
    const [, setCurrentSelectedTime] = useAtom<ITimeSlot | null>(timeslotAtom);
    const [, setBookingDate] = useAtom(bookingDateAtom);

    const incCounter = () => {
        if (guestCount !== bookingInfo.event?.tickets_left)
            setGuestCount((prev: number) => (prev < Number(bookingInfo.event?.tickets_left) ? prev + 1 : prev));
    };
    const decCounter = () => {
        setGuestCount((prev: number) => (prev - 1 >= 1 ? prev - 1 : prev));
    };
    const next = () => {
        if (guestCount === 0) return;
        if (user?.complete_onboarding) {
            if (bookingInfo.event?.ticket_price === 0) {
                setBookingDate({
                    title: moment(bookingInfo.event?.date_start).format('YYYY-MM-DD'),
                    value: moment(bookingInfo.event?.date_start).format('YYYY-MM-DD'),
                });
                setCurrentSelectedTime({
                    start_datetime: String(bookingInfo.event?.date_start),
                    end_datetime: moment(bookingInfo.event?.date_start).add(2, 'hours').toISOString(),
                    is_free: true,
                });
                console.log('end_datetime: String(bookingInfo.event?.date_start): ', bookingInfo.event.id)

                navigate('/booking?id=' + bookingInfo.restaurant?.id + '&free_event=' + bookingInfo.event.name + '&event_id=' + bookingInfo.event.id);
                return;
            }
            navigate(`/events/${bookingInfo.event?.id}/confirm`);
        } else {
            navigate(`/onboarding/4`);
        }
    };
    return (
        <div className={css.content}>
            {bookingInfo.event?.image_url == undefined ? (
                <PlaceholderBlock
                    width={'100%'}
                    rounded={'20px'}
                    aspectRatio={'3/2'}
                />
            ) : (
                <div
                    className={css.event_img}
                    style={{
                        backgroundImage: `url(${bookingInfo.event?.image_url ? bookingInfo.event?.image_url : 'https://storage.yandexcloud.net/bottec-dreamteam/event_placeholder.png'}`,
                    }}
                />
            )}
            <div className={css.content_description}>
                {bookingInfo.event?.name == undefined ? (
                    <PlaceholderBlock
                        width={'100%'}
                        height={'40px'}
                        rounded={'20px'}
                    />
                ) : (
                    <h2 className={css.content_description__title}>{bookingInfo.event?.name}</h2>
                )}

                <span className={classNames(
                    css.content_description__info,
                    hideAbout ? css.trimLines : null,
                )}>
                    {bookingInfo.event?.description.split(/\n|\r\n/).map((segment, index) => (
                        <>
                            {index > 0 && <br />}
                            {segment}
                        </>
                    ))}
                </span>
                {bookingInfo.event?.description && bookingInfo.event?.description.length > 100 &&
                    (
                        <div
                            className={css.trimLinesButton}
                            onClick={() => setHideAbout((prev) => !prev)}
                        >
                                <span className={css.text}>
                                    {hideAbout ? 'Читать больше' : 'Скрыть'}
                                </span>
                        </div>
                    )
                }
            </div>
            <div className={css.event_params}>
                <div className={css.event_params_row}>
                    {bookingInfo.event?.date_start ? (
                        <div className={css.event_params_col}>
                            <span className={css.event_params_col__title}>
                                Дата
                            </span>
                            <span className={css.event_params_col__data}>
                                {moment(bookingInfo.event.date_start).format('DD.MM.YYYY')}
                            </span>
                        </div>
                    ) : (
                        <PlaceholderBlock
                            width={'100%'}
                            height={'40px'}
                            rounded={'20px'}
                        />
                    )}
                    {bookingInfo.event?.date_start ? (
                        <div className={css.event_params_col}>
                            <span className={css.event_params_col__title}>
                                Время
                            </span>
                                <span className={css.event_params_col__data}>
                                {moment(
                                    bookingInfo.event?.date_start,
                                ).format('HH:mm')}
                            </span>
                        </div>
                    ) : (
                        <PlaceholderBlock
                            width={'100%'}
                            height={'40px'}
                            rounded={'20px'}
                        />
                    )}
                    {!isNaN(Number(bookingInfo.event?.ticket_price)) && Number(bookingInfo.event?.ticket_price) > 0 ? (
                        <div className={css.event_params_col}>
                            <span className={css.event_params_col__title}>
                                Цена
                            </span>
                                <span className={css.event_params_col__data}>
                                {Number(bookingInfo.event?.ticket_price) == 0 ? 'Бесплатно' : bookingInfo.event?.ticket_price + ' ₽'}
                            </span>
                        </div>
                    ): Number(bookingInfo.event?.ticket_price) !== 0 ? (
                        <PlaceholderBlock
                            width={'100%'}
                            height={'40px'}
                            rounded={'20px'}
                        />
                    ) : null}
                </div>
                <div className={css.event_params_row} style={{ justifyContent: 'space-between' }}>
                    {Number(bookingInfo.event?.tickets_left) >= 0 ? (
                        <div className={css.event_params_col}>
                            <span className={css.event_params_col__title}>
                                Осталось мест
                            </span>
                                <span className={css.event_params_col__data}>
                                {bookingInfo.event?.tickets_left}
                            </span>
                        </div>
                    ) : (
                        <PlaceholderBlock
                            width={'100%'}
                            height={'40px'}
                            rounded={'20px'}
                        />
                    )}

                    {!isNaN(Number(bookingInfo.event?.ticket_price)) && Number(bookingInfo.event?.ticket_price) !== 0 && (
                        <div className={css.event_params_col}>
                            <div className={css.roundedText}>
                                <span>предоплата</span>
                            </div>
                        </div>
                    )}
                </div>
                {Number(bookingInfo.event?.tickets_left) >= 0 ? (
                    <div className={css.personsContainer}>
                    <span className={css.personsContainer__title}>
                        Количество мест
                    </span>
                        <div className={css.personCounter}>
                        <span className={css.clickableSpan} onClick={decCounter}>
                            -
                        </span>
                            <span>{guestCount}</span>
                            <span className={css.clickableSpan} onClick={incCounter}>
                        +
                        </span>
                        </div>
                    </div>
                ) : (
                    <PlaceholderBlock
                        width={'100%'}
                        height={'40px'}
                        rounded={'20px'}
                    />
                )}
            </div>
            {bookingInfo.event && Number(bookingInfo.event?.tickets_left) > 0 && (
                <div className={css.absoluteBottom}>
                    <div className={css.bottomWrapper}>
                        <UniversalButton
                            width={'full'}
                            title={!isNaN(Number(bookingInfo.event?.ticket_price)) && Number(bookingInfo.event?.ticket_price) > 0 ? 'Купить билет' : 'Забронировать'}
                            theme={'red'}
                            action={() => next()}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};
