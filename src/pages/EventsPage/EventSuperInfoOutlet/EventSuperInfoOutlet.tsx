import React, { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import css from './EventSuperInfoOutlet.module.css';
import { IEventBookingContext } from '@/utils.ts';
import { UniversalButton } from '@/components/Buttons/UniversalButton/UniversalButton.tsx';
import classNames from 'classnames';
import { useAtom } from 'jotai/index';
import { guestCountAtom } from '@/atoms/eventBookingAtom.ts';
import { userAtom } from '@/atoms/userAtom.ts';
import hh from '/img/hh.jpg';

export const EventSuperInfoOutlet: React.FC = () => {
    const navigate = useNavigate();
    const [bookingInfo] = useOutletContext<IEventBookingContext>();
    const [hideAbout, setHideAbout] = useState(true);
    const [guestCount] = useAtom(guestCountAtom);
    const [user] = useAtom(userAtom);

    const next = () => {
        if (guestCount === 0) return;
        if (user?.complete_onboarding) {
            navigate(`/events/${bookingInfo.event?.id}/confirm`);
        } else {
            navigate(`/onboarding/4`);
        }
    };

    const description = 'Hospitality Heroes — ежеквартальное образовательное мероприятие Dreamteam, которое мы  делаем открытым для всех профессионалов индустрии гостеприимства.';
    return (
        <div className={css.content}>
                <div
                    className={css.event_img}
                    style={{
                        backgroundImage: `url(${hh})`,
                    }}
                />
            <div className={css.content_description}>
                <h2 className={css.content_description__title}>Hospitality Heroes</h2>

                <span className={classNames(
                    css.content_description__info,
                    hideAbout ? css.trimLines : null,
                )}>
                    {description.split(/\n|\r\n/).map((segment, index) => (
                        <>
                            {index > 0 && <br />}
                            {segment}
                        </>
                    ))}
                </span>
                {description.length > 100 &&
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
                    <div className={css.event_params_col}>
                        <span className={css.event_params_col__title}>
                            Дата
                        </span>
                        <span className={css.event_params_col__data}>
                            17.09.2025
                        </span>
                    </div>

                    <div className={css.event_params_col}>
                        <span className={css.event_params_col__title}>
                            Время
                        </span>
                        <span className={css.event_params_col__data}>
                            18:00
                        </span>
                    </div>
                </div>
                <div className={css.event_params_row}>
                    <div className={css.event_params_col}>
                        <span className={css.event_params_col__title}>
                            Адрес
                        </span>
                        <span className={css.event_params_col__data}>
                                Барочная улица, дом 4а, строение 1
                            </span>
                    </div>
                </div>
                <div className={css.event_params_row}>
                    <div className={css.event_params_col}>
                        <span className={css.event_params_col__title}>
                            Место
                        </span>
                        <span className={css.event_params_col__data}>
                            Левашовский хлебзавод
                        </span>
                    </div>
                </div>

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
