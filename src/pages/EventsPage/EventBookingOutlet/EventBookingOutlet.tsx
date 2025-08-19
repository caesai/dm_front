import {CalendarIcon} from '@/components/Icons/CalendarIcon.tsx';
import classNames from 'classnames';
import {TextInput} from '@/components/TextInput/TextInput.tsx';
import {UniversalButton} from '@/components/Buttons/UniversalButton/UniversalButton.tsx';
import css from './EventBookingOutlet.module.css';
import {useNavigate, useOutletContext} from 'react-router-dom';
import {formatDateDT, getDataFromLocalStorage, IEventBookingContext, removeDataFromLocalStorage} from '@/utils.ts';
import {useMemo, useRef, useState} from 'react';
import moment from 'moment';
import {APICreateInvoice} from '@/api/events.ts';
import {useAtom} from 'jotai';
import {authAtom, userAtom} from '@/atoms/userAtom.ts';
import {guestCountAtom} from '@/atoms/eventBookingAtom.ts';
import {AppLoadingScreen} from "@/components/AppLoadingScreen/AppLoadingScreen.tsx";

export const EventBookingOutlet = () => {
    const navigate = useNavigate();
    const [bookingInfo] = useOutletContext<IEventBookingContext>();
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
        const ticketPrice = bookingInfo.event?.ticket_price;
        if (ticketPrice === undefined) {
            return null;
        }
        return guestCount * ticketPrice;
    }, [bookingInfo]);

    const validate = useMemo(() => {
        return (
            bookingInfo.restaurant &&
            bookingInfo.event?.date_start &&
            userInfo.name &&
            userInfo.phone &&
            auth?.access_token
        );
    }, [bookingInfo, userInfo, auth]);

    const createInvoice = () => {
        if (
            bookingInfo.restaurant &&
            bookingInfo.event?.date_start &&
            userInfo.name &&
            userInfo.phone &&
            auth?.access_token &&
            guestCount
        ) {
            setLoading(true);
            APICreateInvoice(
                bookingInfo.restaurant.id,
                bookingInfo.event?.id,
                {
                    start_datetime: bookingInfo.event.date_start,
                    end_datetime: bookingInfo.event.date_start,
                    is_free: true,
                },
                userInfo.name,
                userInfo.phone,
                '',
                userInfo.commentary,
                'В Telegram',
                guestCount,
                auth?.access_token
            ).then((res) => {
                const sharedEvent = getDataFromLocalStorage('sharedEvent');
                if (sharedEvent) {
                    removeDataFromLocalStorage('sharedEvent');
                }
                res.data.payment_url
                    ? window.location.replace(res.data.payment_url)
                    : navigate('/tickets/' + res.data.booking_id );
            }).catch(error => {
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
                    <div className={css.dateInfoContainer}>
                        <div className={css.cubicIconContainer}>
                            <CalendarIcon size={22}/>
                        </div>
                        <div className={css.dateInfoContainer_dates}>
                            <span className={css.dateInfoContainer_dates__date}>
                                {/*{bookingInfo.date*/}
                                {/*    ? formatDateDT(*/}
                                {/*          new Date(*/}
                                {/*              bookingInfo.date.start_datetime*/}
                                {/*          )*/}
                                {/*      )*/}
                                {/*    : '...'}*/}
                                {bookingInfo.event?.date_start && formatDateDT(
                                    new Date(bookingInfo.event?.date_start)
                                )}
                            </span>
                            <span
                                className={css.dateInfoContainer_dates__times}
                            >
                                {moment(
                                    bookingInfo.event?.date_start
                                ).format('HH:mm')}{' '}
                                {/*-{' '}*/}
                                {/*{moment(bookingInfo.date?.end_datetime).format(*/}
                                {/*    'HH:mm'*/}
                                {/*)}*/}
                            </span>
                        </div>
                        <div className={css.dateInfoContainer_dates}>
                            <span
                                className={css.dateInfoContainer_dates__times}
                            >{bookingInfo.restaurant?.title}</span>
                            <span className={css.dateInfoContainer_dates__date}>
                                {bookingInfo.restaurant?.address}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            <div className={css.contentContainer}>
                <div className={css.contentItem}>
                    {/*<h2 className={css.contentItem__title}>Услуги</h2>*/}
                    <div className={css.goodsItems}>
                        <div className={css.itemContainer}>
                            <div className={css.goodsItems_item}>
                                <span className={css.goodsItems_item__title}>
                                    {bookingInfo.event?.name}
                                </span>
                                <span className={css.goodsItems_item__price}>
                                    {bookingInfo.event?.ticket_price} ₽
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className={css.hr}/>
                    <div className={classNames(css.goodsItems_item, css.aic)}>
                        <span className={css.goodsItems_item__total}>
                            Количество билетов
                        </span>
                        <span className={css.goodsItems_item__price}>
                            {guestCount}
                        </span>
                    </div>
                    <div className={classNames(css.goodsItems_item, css.aic)}>
                        <span className={css.goodsItems_item__total}>
                            Предоплата
                        </span>
                        <span className={css.goodsItems_item__price}>
                            {calculateTotal + ' ₽'}
                        </span>
                    </div>
                </div>
            </div>
            <div className={css.contentContainer}>
                <div className={css.contentItem}>
                    <h2 className={css.contentItem__title}>Контакты</h2>
                    <div className={css.form}>
                        <TextInput
                            value={userInfo.name}
                            onChange={(e) =>
                                setUserInfo((p) => ({...p, name: e}))
                            }
                            placeholder={'Имя'}
                        ></TextInput>
                        <TextInput
                            value={userInfo.phone}
                            onChange={(e) =>
                                setUserInfo((p) => ({...p, phone: e}))
                            }
                            placeholder={'Номер телефона'}
                        ></TextInput>
                        {/*<TextInput*/}
                        {/*    value={userInfo.email}*/}
                        {/*    onChange={(e) =>*/}
                        {/*        setUserInfo((p) => ({ ...p, email: e }))*/}
                        {/*    }*/}
                        {/*    placeholder={'Email'}*/}
                        {/*></TextInput>*/}
                        {/*<TextInput*/}
                        {/*    value={userInfo.commentary}*/}
                        {/*    onChange={(e) =>*/}
                        {/*        setUserInfo((p) => ({...p, commentary: e}))*/}
                        {/*    }*/}
                        {/*    onFocus={() => {*/}
                        {/*        if(bookingBtn.current) {*/}
                        {/*            bookingBtn.current.style.position = 'relative';*/}
                        {/*        }*/}
                        {/*    }}*/}
                        {/*    onBlur={() => {*/}
                        {/*        if(bookingBtn.current) {*/}
                        {/*            bookingBtn.current.style.position = 'fixed';*/}
                        {/*        }*/}
                        {/*    }}*/}
                        {/*    placeholder={'Комментарий'}*/}
                        {/*></TextInput>*/}
                    </div>
                    {/*<ConfirmationSelect*/}
                    {/*    options={confirmationList}*/}
                    {/*    currentValue={confirmation}*/}
                    {/*    onChange={setConfirmation}*/}
                    {/*/>*/}
                </div>
            </div>
            <div className={css.absoluteBottom} ref={bookingBtn}>
                <div className={css.bottomWrapper}>
                    <UniversalButton
                        width={'full'}
                        title={'Оплатить'}
                        theme={'red'}
                        action={() => {
                            if (validate) {
                                createInvoice()
                            } else {
                                alert('TODO: Validation alert')
                            }
                        }
                        }
                    />
                </div>
            </div>
        </div>
    );
};
