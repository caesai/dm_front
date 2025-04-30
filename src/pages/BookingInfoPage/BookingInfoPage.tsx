import { Page } from '@/components/Page.tsx';
import { useNavigate, useParams } from 'react-router-dom';
import css from './BookingInfoPage.module.css';
import { openLink } from '@telegram-apps/sdk-react';
import { RoundedButton } from '@/components/RoundedButton/RoundedButton.tsx';
import { CrossIcon } from '@/components/Icons/CrossIcon.tsx';
import { TimeCircle } from '@/components/Icons/TimeCircle.tsx';
import { CalendarIcon } from '@/components/Icons/CalendarIcon.tsx';
import { UsersIcon } from '@/components/Icons/UsersIcon.tsx';
import { ChatIcon } from '@/components/Icons/ChatIcon.tsx';
import { GoToPathIcon } from '@/components/Icons/GoToPathIcon.tsx';
import { UniversalButton } from '@/components/Buttons/UniversalButton/UniversalButton.tsx';
import { useEffect, useState } from 'react';
import { CancelBookingPopup } from '@/pages/BookingInfoPage/CancelBookingPopup/CancelBookingPopup.tsx';
import { InformationPopup } from '@/components/InformationPopup/InformationPopup.tsx';
import { IBookingInfo } from '@/types/restaurant.ts';
import { PlaceholderBlock } from '@/components/PlaceholderBlock/PlaceholderBlock.tsx';
import { useScript } from 'usehooks-ts';
import { APICancelBooking, APIGetBooking } from '@/api/restaurants.ts';
import { useAtom } from 'jotai';
import { authAtom } from '@/atoms/userAtom.ts';
import { Taxi } from '@/components/YandexTaxi/Taxi.tsx';
import {
    formatDateDayMonthLong,
    formatDateDayShort,
    formatDateMonthShort,
} from '@/utils.ts';
import classNames from 'classnames';

export const BookingInfoPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [cancelPopup, setCancelPopup] = useState(false);
    const [canceledPopup, setCanceledPopup] = useState(false);
    const [booking, setBooking] = useState<IBookingInfo>();
    const [auth] = useAtom(authAtom);

    useEffect(() => {
        document.body.style.overflow = 'hidden';

        return () => {
            document.body.style.overflow = 'scroll';
        };
    }, []);

    const onCancel = () => {
        if (!auth?.access_token || !booking) {
            // navigate('/');
            return;
        }
        setCancelPopup(false);
        APICancelBooking(auth.access_token, booking.id)
            .then(() => {
                setCanceledPopup(true);
            })
            .catch(() => alert('Произошла ошибка при отмене брони.'));
    };
    useScript('https://yastatic.net/taxi-widget/ya-taxi-widget.js', {
        removeOnUnmount: true,
    });

    useEffect(() => {
        if (!auth?.access_token) {
            navigate('/');
            return;
        }
        APIGetBooking(auth.access_token, Number(id)).then((res) =>
            setBooking(res.data)
        );
    }, []);

    return (
        <Page back={true}>
            <CancelBookingPopup
                isOpen={cancelPopup}
                setOpen={setCancelPopup}
                onSubmit={() => onCancel()}
            />
            <InformationPopup
                isOpen={canceledPopup}
                setOpen={setCanceledPopup}
                text={'Ваше бронирование отменено'}
            />
            <div className={css.absolute_footer}>
                <div
                    className={classNames(css.fc, css.absolute_footer_wrapper)}
                >
                    <div
                        className={classNames(
                            css.fr,
                            css.bookingInfoDetails_item
                        )}
                    >
                        {booking ? (
                            ['new', 'waiting', 'confirmed'].some(
                                (v) => v == booking.booking_status
                            ) ? (
                                <UniversalButton
                                    width={'full'}
                                    title={'Изменить'}
                                    action={() => alert('В разработке')}
                                />
                            ) : null
                        ) : (
                            <PlaceholderBlock
                                width={'100%'}
                                height={'52px'}
                                rounded={'15px'}
                            />
                        )}
                        {booking ? (
                            ['new', 'waiting', 'confirmed'].some(
                                (v) => v == booking.booking_status
                            ) ? (
                                <UniversalButton
                                    width={'full'}
                                    title={'Отменить'}
                                    action={() => setCancelPopup(true)}
                                />
                            ) : null
                        ) : (
                            <PlaceholderBlock
                                width={'100%'}
                                height={'52px'}
                                rounded={'15px'}
                            />
                        )}
                    </div>
                    <div
                        className={classNames(
                            css.fr,
                            css.bookingInfoDetails_item
                        )}
                    >
                        {booking ? (
                            <div
                                className={css.redButton}
                                onClick={() =>
                                    navigate(
                                        `/restaurant/${booking?.restaurant.id}?menuOpen=true`
                                    )
                                }
                            >
                                <span className={css.text}>Смотреть меню</span>
                            </div>
                        ) : (
                            <PlaceholderBlock
                                width={'100%'}
                                height={'52px'}
                                rounded={'15px'}
                            />
                        )}
                        {booking ? (
                            <RoundedButton
                                radius={'50px'}
                                action={() =>
                                    openLink(
                                        `https://yandex.ru/maps/?text=${booking?.restaurant.address}`,
                                        { tryInstantView: false }
                                    )
                                }
                                icon={
                                    <GoToPathIcon
                                        size={24}
                                        color={'var(--dark-grey)'}
                                    />
                                }
                            />
                        ) : (
                            <PlaceholderBlock
                                width={'50px'}
                                height={'50px'}
                                rounded={'50%'}
                                minWidth={'50px'}
                            />
                        )}
                    </div>
                </div>
            </div>
            <div className={classNames(css.fc, css.page)}>
                <div className={classNames(css.main, css.border__bottom)}>
                    <div className={css.header}>
                        <div className={css.wh44} />
                        <div className={classNames(css.fc, css.headerContent)}>
                            <h3 className={css.headerContent__title}>
                                Бронирование
                            </h3>
                        </div>
                        <div
                            className={css.headerButtons}
                            onClick={() => navigate('/myBookings')}
                        >
                            <RoundedButton
                                icon={<CrossIcon size={44} color={'black'} />}
                            />
                        </div>
                    </div>
                    <div className={classNames(css.fc, css.content)}>
                        <div
                            className={classNames(
                                css.fc,
                                css.calendarContainer
                            )}
                        >
                            {booking ? (
                                <>
                                    <div
                                        className={classNames(
                                            css.calendar,
                                            css.calendar__month
                                        )}
                                    >
                                        <span>
                                            {formatDateMonthShort(
                                                booking.booking_date
                                            )}
                                        </span>
                                    </div>
                                    <div
                                        className={classNames(
                                            css.calendar,
                                            css.calendar__day
                                        )}
                                    >
                                        <span>
                                            {formatDateDayShort(
                                                booking.booking_date
                                            )}
                                        </span>
                                    </div>
                                </>
                            ) : (
                                <PlaceholderBlock
                                    width={'45px'}
                                    height={'59px'}
                                    rounded={'12px'}
                                />
                            )}
                        </div>
                        <div
                            className={classNames(
                                css.fc,
                                css.bookingInfo_restaurant
                            )}
                        >
                            <h2 className={css.bookingInfo_restaurant__title}>
                                {booking ? (
                                    booking.restaurant.title
                                ) : (
                                    <PlaceholderBlock
                                        width={'200px'}
                                        height={'50px'}
                                    />
                                )}
                            </h2>
                            <span
                                className={css.bookingInfo_restaurant__subtitle}
                            >
                                {booking ? (
                                    booking.restaurant.address
                                ) : (
                                    <PlaceholderBlock
                                        width={'120px'}
                                        height={'17px'}
                                    />
                                )}
                            </span>
                        </div>
                        <div
                            className={classNames(
                                css.fc,
                                css.bookingInfoDetails
                            )}
                        >
                            <div
                                className={classNames(
                                    css.fr,
                                    css.bookingInfoDetails_container
                                )}
                            >
                                <div
                                    className={classNames(
                                        css.fr,
                                        css.bookingInfoDetails_item
                                    )}
                                >
                                    <TimeCircle
                                        size={16}
                                        color={'var(--dark-grey)'}
                                    ></TimeCircle>
                                    {booking ? (
                                        <span
                                            className={
                                                css.bookingInfoDetails_item__text
                                            }
                                        >
                                            {booking.time}
                                        </span>
                                    ) : (
                                        <PlaceholderBlock
                                            width={'35px'}
                                            height={'17px'}
                                        />
                                    )}
                                </div>
                                <div
                                    className={classNames(
                                        css.fr,
                                        css.bookingInfoDetails_item
                                    )}
                                >
                                    <CalendarIcon
                                        size={16}
                                        color={'var(--dark-grey)'}
                                    ></CalendarIcon>
                                    {booking ? (
                                        <span
                                            className={
                                                css.bookingInfoDetails_item__text
                                            }
                                        >
                                            {formatDateDayMonthLong(
                                                booking.booking_date
                                            )}
                                        </span>
                                    ) : (
                                        <PlaceholderBlock
                                            width={'80px'}
                                            height={'17px'}
                                        />
                                    )}
                                </div>
                                <div
                                    className={classNames(
                                        css.fr,
                                        css.bookingInfoDetails_item
                                    )}
                                >
                                    <UsersIcon
                                        size={16}
                                        color={'var(--dark-grey)'}
                                    ></UsersIcon>

                                    {booking ? (
                                        <span
                                            className={
                                                css.bookingInfoDetails_item__text
                                            }
                                        >
                                            {booking.guests_count}
                                        </span>
                                    ) : (
                                        <PlaceholderBlock
                                            width={'20px'}
                                            height={'17px'}
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                        <div
                            className={classNames(
                                css.fc,
                                css.bookingInfoDetails
                            )}
                        >
                            <div
                                className={classNames(
                                    css.fr,
                                    css.bookingInfoDetails_container
                                )}
                            >
                                <div
                                    className={classNames(
                                        css.fr,
                                        css.bookingInfoDetails_item
                                    )}
                                >
                                    <ChatIcon
                                        size={16}
                                        color={'var(--dark-grey)'}
                                    ></ChatIcon>
                                    {booking ? (
                                        <span
                                            className={
                                                css.bookingInfoDetails_item__text
                                            }
                                        >
                                            {booking.user_comments}
                                        </span>
                                    ) : (
                                        <PlaceholderBlock
                                            width={'120px'}
                                            height={'17px'}
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                        {booking ? (
                            <Taxi
                                address={booking.restaurant.address}
                                lonlng={booking.restaurant.address_lonlng}
                            />
                        ) : (
                            <PlaceholderBlock width={'354px'} height={'64px'} />
                        )}
                    </div>
                    <div className={classNames(css.fr, css.page)}></div>
                </div>
            </div>
        </Page>
    );
};
