import React, { useMemo, useRef, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useAtom } from 'jotai';
import moment from 'moment';
import classNames from 'classnames';
// Types
import { IEventBookingContext } from '@/types/events.types';
// Atoms
import { authAtom, userAtom } from '@/atoms/userAtom.ts';
import { guestCountAtom } from '@/atoms/eventListAtom.ts';
// Components
import { AppLoadingScreen } from '@/components/AppLoadingScreen/AppLoadingScreen.tsx';
// Utils
import { getDataFromLocalStorage, removeDataFromLocalStorage } from '@/utils.ts';
// Icons
import { CalendarIcon } from '@/components/Icons/CalendarIcon.tsx';
import { TextInput } from '@/components/TextInput/TextInput.tsx';
import { UniversalButton } from '@/components/Buttons/UniversalButton/UniversalButton.tsx';
import { APICreateInvoice } from '@/api/events.api.ts';
import { ClockIcon } from '@/components/Icons/ClockIcon.tsx';
import { HomeIcon } from '@/components/Icons/HomeIcon.tsx';
import { PinIcon } from '@/components/Icons/PinIcon.tsx';
// Styles
import css from '@/pages/EventsPage/EventBookingPage/EventBookingPage.module.css';

export const EventBookingPage: React.FC = () => {
    const navigate = useNavigate();
    const [eventBookingInfo] = useOutletContext<IEventBookingContext>();
    const [guestCount] = useAtom(guestCountAtom);

    const [auth] = useAtom(authAtom);
    const [user] = useAtom(userAtom);
    const [userInfo, setUserInfo] = useState({
        name: `${user?.first_name}`,
        phone: `${user?.phone_number}`,
        commentary: '',
    });
    const [loading, setLoading] = useState(false);

    const bookingBtn = useRef<HTMLDivElement>(null);

    const calculateTotal = useMemo(() => {
        const ticketPrice = eventBookingInfo?.ticket_price;
        if (ticketPrice === undefined) {
            return null;
        }
        return guestCount * ticketPrice;
    }, [eventBookingInfo]);

    const validate = useMemo(() => {
        return (
            eventBookingInfo?.restaurant &&
            eventBookingInfo?.date_start &&
            userInfo.name &&
            userInfo.phone &&
            auth?.access_token
        );
    }, [eventBookingInfo, userInfo, auth]);

    const createInvoice = () => {
        if (
            eventBookingInfo?.restaurant &&
            eventBookingInfo?.date_start &&
            userInfo.name &&
            userInfo.phone &&
            auth?.access_token &&
            guestCount
        ) {
            setLoading(true);
            APICreateInvoice(
                eventBookingInfo?.restaurant?.id,
                eventBookingInfo?.id,
                {
                    start_datetime: eventBookingInfo?.date_start,
                    end_datetime: eventBookingInfo?.date_start,
                    is_free: true,
                },
                userInfo.name,
                userInfo.phone,
                '',
                userInfo.commentary,
                'В Telegram',
                guestCount,
                auth?.access_token
            )
                .then((res) => {
                    const sharedEvent = getDataFromLocalStorage('sharedEvent');
                    if (sharedEvent) {
                        removeDataFromLocalStorage('sharedEvent');
                    }
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

    if (loading) {
        return <AppLoadingScreen />;
    }

    return (
        <div>
            <div className={css.contentContainer__top}>
                <div className={css.contentItem}>
                    <h2 className={css.contentItem__title}>Детали заказа</h2>

                    <div className={css.goodsItems}>
                        <div className={css.itemContainer}>
                            <div className={css.goodsItems_item}>
                                <span className={css.goodsItems_item__title}>{eventBookingInfo?.name}</span>
                            </div>
                        </div>
                    </div>
                    <div className={css.dateInfoContainer}>
                        <div className={css.dateInfoContainer_dates}>
                            <div className={css.dateInfoContainer_dates__times}>
                                <ClockIcon size={16} color={'#989898'} />
                                <span>{moment(eventBookingInfo?.date_start).format('HH:mm')} </span>
                            </div>
                            <div className={css.dateInfoContainer_dates__date}>
                                <CalendarIcon size={18} color={'#989898'} />
                                <span>
                                    {eventBookingInfo?.date_start &&
                                        moment(eventBookingInfo?.date_start).format('DD.MM.YYYY')}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className={css.contentContainer}>
                <div className={css.contentItem}>
                    {/*<h2 className={css.contentItem__title}>Услуги</h2>*/}
                    <div className={css.dateInfoContainer_title}>
                        <div className={css.dateInfoContainer_dates__times}>
                            <HomeIcon size={18} color={'#989898'} />
                            <span>{eventBookingInfo?.restaurant?.title}</span>
                        </div>
                        <div className={css.dateInfoContainer_dates__date}>
                            <PinIcon size={18} />
                            <span>{eventBookingInfo?.restaurant?.address}</span>
                        </div>
                    </div>
                    <div className={css.hr} />
                    <div className={classNames(css.goodsItems_item, css.aic)}>
                        <span className={css.goodsItems_item__total}>Количество билетов</span>
                        <span className={css.goodsItems_item__price}>{guestCount}</span>
                    </div>
                    <div className={classNames(css.goodsItems_item, css.aic)}>
                        <span className={css.goodsItems_item__total}>Предоплата</span>
                        <span className={css.goodsItems_item__price}>{calculateTotal + ' ₽'}</span>
                    </div>
                </div>
            </div>
            <div className={css.contentContainer}>
                <div className={css.contentItem}>
                    <h2 className={css.contentItem__title}>Контакты</h2>
                    <div className={css.form}>
                        <TextInput
                            value={userInfo.name}
                            onChange={(e) => setUserInfo((p) => ({ ...p, name: e }))}
                            placeholder={'Имя'}
                        ></TextInput>
                        <TextInput
                            value={userInfo.phone}
                            onChange={(e) => setUserInfo((p) => ({ ...p, phone: e }))}
                            placeholder={'Номер телефона'}
                        ></TextInput>
                    </div>
                </div>
            </div>
            <div className={css.absoluteBottom} ref={bookingBtn}>
                <div className={css.bottomWrapper}>
                    <UniversalButton
                        width={'full'}
                        title={Number(eventBookingInfo?.ticket_price) > 0 ? 'Оплатить' : 'Забронировать'}
                        theme={'red'}
                        action={() => {
                            if (validate) {
                                createInvoice();
                            } else {
                                console.error('TODO: Validation alert');
                            }
                        }}
                    />
                </div>
            </div>
        </div>
    );
};
