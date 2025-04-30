import { IConfirmationType } from '@/components/ConfirmationSelect/ConfirmationSelect.types.ts';
import { CalendarIcon } from '@/components/Icons/CalendarIcon.tsx';
import classNames from 'classnames';
import { TextInput } from '@/components/TextInput/TextInput.tsx';
import { ConfirmationSelect } from '@/components/ConfirmationSelect/ConfirmationSelect.tsx';
import { UniversalButton } from '@/components/Buttons/UniversalButton/UniversalButton.tsx';
import css from './EventBookingOutlet.module.css';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { formatDateDT, IEventBookingContext } from '@/utils.ts';
import { useMemo, useState } from 'react';
import moment from 'moment';
import { APICreateInvoice } from '@/api/events.ts';
import { useAtom } from 'jotai';
import { authAtom, userAtom } from '@/atoms/userAtom.ts';
import { guestCountAtom } from '@/atoms/eventBookingAtom.ts';

const confirmationList: IConfirmationType[] = [
    {
        id: 'telegram',
        text: 'В Telegram',
    },
    {
        id: 'phone',
        text: 'По телефону',
    },
    {
        id: 'none',
        text: 'Без подтверждения',
    },
];

export const EventBookingOutlet = () => {
    const navigate = useNavigate();
    const [bookingInfo] = useOutletContext<IEventBookingContext>();
    const [guestCount] = useAtom(guestCountAtom);
    const [confirmation, setConfirmation] = useState<IConfirmationType>({
        id: 'telegram',
        text: 'В Telegram',
    });
    const [auth] = useAtom(authAtom);
    const [user] = useAtom(userAtom);
    const [userInfo, setUserInfo] = useState({
        name: `${user?.first_name}`,
        phone: `${user?.phone_number}`,
        email: `${user?.email}`,
        commentary: '',
    });

    const calculateTotal = useMemo(() => {
        const ticketPrice = bookingInfo.event_date?.ticket_price;
        if (!ticketPrice) {
            return null;
        }
        return guestCount * ticketPrice;
    }, [bookingInfo]);

    const validate = useMemo(() => {
        return (
            bookingInfo.restaurant &&
            bookingInfo.event_date &&
            bookingInfo.date &&
            userInfo.name &&
            userInfo.phone &&
            userInfo.email &&
            confirmation.text &&
            auth?.access_token
        );
    }, [bookingInfo, userInfo, confirmation, auth]);

    const createInvoice = () => {
        if (
            bookingInfo.restaurant &&
            bookingInfo.event_date &&
            bookingInfo.date &&
            userInfo.name &&
            userInfo.phone &&
            userInfo.email &&
            confirmation.text &&
            auth?.access_token &&
            guestCount
        ) {
            APICreateInvoice(
                bookingInfo.restaurant.id,
                bookingInfo.event_date?.id,
                bookingInfo.date,
                userInfo.name,
                userInfo.phone,
                userInfo.email,
                userInfo.commentary,
                confirmation.text,
                guestCount,
                auth?.access_token
            ).then((res) => {
                res.data.payment_url
                    ? window.location.replace(res.data.payment_url)
                    : navigate('/events');
            });
        }
    };

    return (
        <div>
            <div className={css.contentContainer__top}>
                <div className={css.contentItem}>
                    <h2 className={css.contentItem__title}>Детали заказа</h2>
                    <div className={css.dateInfoContainer}>
                        <div className={css.cubicIconContainer}>
                            <CalendarIcon size={22} />
                        </div>
                        <div className={css.dateInfoContainer_dates}>
                            <span className={css.dateInfoContainer_dates__date}>
                                {bookingInfo.date
                                    ? formatDateDT(
                                          new Date(
                                              bookingInfo.date.start_datetime
                                          )
                                      )
                                    : '...'}
                            </span>
                            <span
                                className={css.dateInfoContainer_dates__times}
                            >
                                {moment(
                                    bookingInfo.date?.start_datetime
                                ).format('HH:mm')}{' '}
                                -{' '}
                                {moment(bookingInfo.date?.end_datetime).format(
                                    'HH:mm'
                                )}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            <div className={css.contentContainer}>
                <div className={css.contentItem}>
                    <h2 className={css.contentItem__title}>Услуги</h2>
                    <div className={css.goodsItems}>
                        <div className={css.itemContainer}>
                            <div className={css.goodsItems_item}>
                                <span className={css.goodsItems_item__title}>
                                    {bookingInfo.event?.name}
                                </span>
                                <span className={css.goodsItems_item__price}>
                                    {bookingInfo.event_date?.ticket_price} ₽
                                </span>
                            </div>
                            <div className={css.roundedText}>
                                <span>✓ 100% предоплата</span>
                            </div>
                        </div>
                    </div>
                    <div className={css.hr} />
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
                                setUserInfo((p) => ({ ...p, name: e }))
                            }
                            placeholder={'Имя'}
                        ></TextInput>
                        <TextInput
                            value={userInfo.phone}
                            onChange={(e) =>
                                setUserInfo((p) => ({ ...p, phone: e }))
                            }
                            placeholder={'Номер телефона'}
                        ></TextInput>
                        <TextInput
                            value={userInfo.email}
                            onChange={(e) =>
                                setUserInfo((p) => ({ ...p, email: e }))
                            }
                            placeholder={'Email'}
                        ></TextInput>
                        <TextInput
                            value={userInfo.commentary}
                            onChange={(e) =>
                                setUserInfo((p) => ({ ...p, commentary: e }))
                            }
                            placeholder={'Комментарий'}
                        ></TextInput>
                    </div>
                    <ConfirmationSelect
                        options={confirmationList}
                        currentValue={confirmation}
                        onChange={setConfirmation}
                    />
                </div>
            </div>
            <div className={css.absoluteBottom}>
                <div className={css.bottomWrapper}>
                    <UniversalButton
                        width={'full'}
                        title={'Оплатить'}
                        theme={'red'}
                        action={() =>
                            validate
                                ? createInvoice()
                                : alert('TODO: Validation alert')
                        }
                    />
                </div>
            </div>
        </div>
    );
};
