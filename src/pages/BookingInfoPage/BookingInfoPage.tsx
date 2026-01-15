import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useScript } from 'usehooks-ts';
import { useAtom } from 'jotai';
import { openLink } from '@telegram-apps/sdk-react';
import classNames from 'classnames';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode } from 'swiper/modules';
// API's
import { APICancelBooking, APIGetBooking, APIPOSTCancelReason } from '@/api/restaurants.api.ts';
import { BASE_BOT } from '@/api/base.ts';
// Types
import { IBookingInfo } from '@/types/restaurant.types.ts';
// Atoms
import { authAtom } from '@/atoms/userAtom.ts';
// Components
import { Page } from '@/components/Page.tsx';
import { RoundedButton } from '@/components/RoundedButton/RoundedButton.tsx';
import { CrossIcon } from '@/components/Icons/CrossIcon.tsx';
import { TimeCircle } from '@/components/Icons/TimeCircle.tsx';
import { CalendarIcon } from '@/components/Icons/CalendarIcon.tsx';
import { UsersIcon } from '@/components/Icons/UsersIcon.tsx';
import { GoToPathIcon } from '@/components/Icons/GoToPathIcon.tsx';
import { UniversalButton } from '@/components/Buttons/UniversalButton/UniversalButton.tsx';
import { CancelBookingPopup } from '@/pages/BookingInfoPage/CancelBookingPopup/CancelBookingPopup.tsx';
import { PlaceholderBlock } from '@/components/PlaceholderBlock/PlaceholderBlock.tsx';
import { Taxi } from '@/components/YandexTaxi/Taxi.tsx';
import { ChildrenIcon } from '@/components/Icons/ChildrenIcon.tsx';
import { DoubleCheckIcon } from '@/components/Icons/DoubleCheckIcon.tsx';
import { PhoneCallIcon } from '@/components/Icons/PhoneCallIcon.tsx';
import { CommentaryOptionButton } from '@/components/CommentaryOptionButton/CommentaryOptionButton.tsx';
import BookingCertificate from '@/components/BookingCertificate/BookingCertificate.tsx';
// Utils
import { formatDateDayMonthLong, formatDateDayShort, formatDateMonthShort, weekdaysMap } from '@/utils.ts';
// Styles
import css from '@/pages/BookingInfoPage/BookingInfoPage.module.css';
// Mocks
import { R } from '@/__mocks__/restaurant.mock.ts';
import { BOOKINGCOMMENTMOCK } from '@/mockData.ts';
import { StarPrivilegeIcon } from '@/components/Icons/StarPrivilege';

export const BookingInfoPage: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [cancelPopup, setCancelPopup] = useState(false);
    const [booking, setBooking] = useState<IBookingInfo>();
    const [auth] = useAtom(authAtom);

    // Возвращает конечное время бронирования на основе начального времени и продолжительности
    // start имеет формат 'HH:mm'
    // duration в минутах (из данных mock BOOKING_DURATION)
    const getEndTime = useCallback((start: string, duration: number): string => {
        const [hours, minutes] = start.split(':').map(Number);
        const endDate = new Date();
        endDate.setHours(hours, minutes + duration, 0);
        return endDate.toTimeString().slice(0, 5); // возвращает в формате 'HH:mm'
    }, []);

    useEffect(() => {
        document.body.style.overflow = 'hidden';

        return () => {
            document.body.style.overflow = 'scroll';
        };
    }, []);

    const onCancelBooking = async () => {
        await APICancelBooking(String(auth?.access_token), Number(booking?.id));
    };

    const onSendReason = async (reason: string = 'Без причины') => {
        await APIPOSTCancelReason(String(auth?.access_token), Number(booking?.id), reason);
    };

    useScript('https://yastatic.net/taxi-widget/ya-taxi-widget.js', {
        removeOnUnmount: true,
    });

    useEffect(() => {
        if (!auth?.access_token) {
            navigate('/');
            return;
        }
        APIGetBooking(auth.access_token, Number(id)).then((res) => setBooking(res.data));
    }, []);

    const hideApp = () => {
        if (window.Telegram.WebApp) {
            window.location.href = `https://t.me/${BASE_BOT}?start=reserve_id-${Number(booking?.id)}`;
            window.Telegram.WebApp.close();
        } else {
            window.location.href = `https://t.me/${BASE_BOT}?start=reserve_id-${Number(booking?.id)}`;
        }
    };
    console.log('booking.tags: ', booking)
    return (
        <Page back={true}>
            <CancelBookingPopup
                isOpen={cancelPopup}
                setOpen={setCancelPopup}
                onCancel={onCancelBooking}
                onSuccess={() => navigate('/myBookings')}
                onSendReason={onSendReason}
                popupText={'Вы уверены, что хотите отменить бронирование?'}
                successMessage={'Ваше бронирование отменено'}
            />
            <div className={classNames(css.fc, css.page)}>
                <div className={classNames(css.main, css.border__bottom)}>
                    <div className={css.header}>
                        <div className={css.wh44} />
                        <div className={classNames(css.fc, css.headerContent)}>
                            <h3 className={css.headerContent__title}>Бронирование</h3>
                        </div>
                        <div className={css.headerButtons} onClick={() => navigate('/myBookings')}>
                            <RoundedButton icon={<CrossIcon size={44} color={'black'} />} />
                        </div>
                    </div>
                    <div className={classNames(css.fc, css.content)}>
                        <div className={classNames(css.fc, css.calendarContainer)}>
                            {booking ? (
                                <>
                                    <div className={classNames(css.calendar, css.calendar__month)}>
                                        <span>{formatDateMonthShort(booking.booking_date)}</span>
                                    </div>
                                    <div className={classNames(css.calendar, css.calendar__day)}>
                                        <span>{formatDateDayShort(booking.booking_date)}</span>
                                    </div>
                                </>
                            ) : (
                                <PlaceholderBlock width={'45px'} height={'59px'} rounded={'12px'} />
                            )}
                        </div>
                        <div className={classNames(css.fc, css.bookingInfo_restaurant)}>
                            <h2 className={css.bookingInfo_restaurant__title}>
                                {booking ? (
                                    booking.restaurant.title
                                ) : (
                                    <PlaceholderBlock width={'200px'} height={'50px'} />
                                )}
                            </h2>
                            <span className={css.bookingInfo_restaurant__subtitle}>
                                {booking ? (
                                    booking.restaurant.address
                                ) : (
                                    <PlaceholderBlock width={'120px'} height={'17px'} />
                                )}
                            </span>
                        </div>
                        <div className={classNames(css.fc, css.bookingInfoDetails)}>
                            <div className={classNames(css.fr, css.bookingInfoDetails_container)}>
                                {booking?.booking_status == 'waiting' ? (
                                    <>
                                        <PhoneCallIcon size={24} />
                                        <h3>
                                            Мы свяжемся с вами для <br />
                                            подтверждения бронирования
                                        </h3>
                                    </>
                                ) : (
                                    <>
                                        <DoubleCheckIcon />
                                        <h3>
                                            Ваше бронирование{' '}
                                            {booking?.booking_status == 'canceled' ? 'отменено' : 'подтверждено'}
                                        </h3>
                                    </>
                                )}
                            </div>
                        </div>
                        <div className={classNames(css.fc, css.bookingInfoDetails)}>
                            <div className={classNames(css.fr, css.bookingInfoDetails_container)}>
                                <div className={classNames(css.fr, css.bookingInfoDetails_item)}>
                                    <TimeCircle size={16} color={'var(--dark-grey)'} />
                                    {booking ? (
                                        <span className={css.bookingInfoDetails_item__text}>
                                            {`${booking.time}-${getEndTime(booking.time, booking.duration)}`}
                                        </span>
                                    ) : (
                                        <PlaceholderBlock width={'35px'} height={'17px'} />
                                    )}
                                </div>
                                <div className={classNames(css.fr, css.bookingInfoDetails_item)}>
                                    <CalendarIcon size={16} color={'var(--dark-grey)'} />
                                    {booking ? (
                                        <span className={css.bookingInfoDetails_item__text}>
                                            {formatDateDayMonthLong(booking.booking_date)},{' '}
                                            {weekdaysMap[new Date(booking.booking_date).getDay()]}
                                        </span>
                                    ) : (
                                        <PlaceholderBlock width={'80px'} height={'17px'} />
                                    )}
                                </div>
                                <div className={classNames(css.fr, css.bookingInfoDetails_item)}>
                                    <UsersIcon size={16} color={'var(--dark-grey)'} />
                                    {booking ? (
                                        <>
                                            <span className={css.bookingInfoDetails_item__text}>
                                                {Number(booking.guests_count)}
                                            </span>
                                            {!!booking.children_count && (
                                                <>
                                                    <ChildrenIcon size={16} />
                                                    <span className={css.bookingInfoDetails_item__text}>
                                                        {Number(booking.children_count)}
                                                    </span>
                                                </>
                                            )}
                                            {booking.features.includes('hospitality_heroes') && (
                                                <>
                                                    <StarPrivilegeIcon size={16} />
                                                    <span className={css.bookingInfoDetails_item__text}>
                                                        Скидка 40%
                                                    </span>
                                                </>
                                            )}
                                        </>
                                    ) : (
                                        <PlaceholderBlock width={'20px'} height={'17px'} />
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className={classNames(css.fc, css.bookingInfoDetails)}>
                            <div
                                style={{ width: '100%' }}
                                className={classNames(css.fr, css.bookingInfoDetails_container)}
                            >
                                <Swiper slidesPerView="auto" modules={[FreeMode]} freeMode={true} spaceBetween={8}>
                                    {booking &&
                                        booking.tags &&
                                        booking.tags.split(',').map((tag, i) => (
                                            <SwiperSlide key={i} style={{ width: 'max-content' }}>
                                                <CommentaryOptionButton
                                                    disabled={true}
                                                    text={String(
                                                        BOOKINGCOMMENTMOCK.find((mock) => mock.text === tag)?.text
                                                    )}
                                                    icon={String(
                                                        BOOKINGCOMMENTMOCK.find((mock) => mock.text === tag)?.emoji
                                                    )}
                                                />
                                            </SwiperSlide>
                                        ))}
                                </Swiper>
                            </div>
                        </div>
                        {booking && booking.certificate_value && booking.certificate_expired_at && (
                            <BookingCertificate
                                value={booking.certificate_value}
                                expired_at={booking.certificate_expired_at}
                            />
                        )}
                        {booking ? (
                            <Taxi
                                address={booking.restaurant.address}
                                lonlng={String(booking.restaurant.address_lonlng)}
                            />
                        ) : (
                            <PlaceholderBlock width={'354px'} height={'64px'} />
                        )}
                    </div>
                    <div className={css.footer}>
                        <div className={classNames(css.fc, css.footer_wrapper)}>
                            <div className={classNames(css.fr, css.bookingInfoDetails_item)}>
                                {booking ? (
                                    ['new', 'waiting', 'confirmed'].some((v) => v === booking.booking_status) ? (
                                        <>
                                            <UniversalButton width={'full'} title={'Изменить'} action={hideApp} />
                                            <UniversalButton
                                                width={'full'}
                                                title={'Отменить'}
                                                action={() => setCancelPopup(true)}
                                            />
                                        </>
                                    ) : null
                                ) : (
                                    <>
                                        <PlaceholderBlock width={'100%'} height={'52px'} rounded={'15px'} />
                                        <PlaceholderBlock width={'100%'} height={'52px'} rounded={'15px'} />
                                    </>
                                )}
                            </div>
                            <div className={classNames(css.fr, css.bookingInfoDetails_item)}>
                                {booking ? (
                                    <>
                                        {/** TODO: Убрать условие после 21.12.2025 */}
                                        {/* Если ресторан не SELF_EDGE_SPB_CHINOIS_ID, то показываем кнопку "Смотреть меню" */}
                                        {String(booking.restaurant.id) !== String(R.SELF_EDGE_SPB_CHINOIS_ID) && (
                                            <div
                                                className={css.redButton}
                                                onClick={() =>
                                                    navigate(`/restaurant/${booking?.restaurant.id}?menuOpen=true`)
                                                }
                                            >
                                                <span className={css.text}>Смотреть меню</span>
                                            </div>
                                        )}
                                        <RoundedButton
                                            radius={'50px'}
                                            action={() =>
                                                openLink(
                                                    `https://yandex.ru/maps/?text=${booking?.restaurant.address}`,
                                                    { tryInstantView: false }
                                                )
                                            }
                                            icon={<GoToPathIcon size={24} color={'var(--dark-grey)'} />}
                                        />
                                    </>
                                ) : (
                                    <>
                                        <PlaceholderBlock width={'100%'} height={'52px'} rounded={'15px'} />
                                        <PlaceholderBlock
                                            width={'50px'}
                                            height={'50px'}
                                            rounded={'50%'}
                                            minWidth={'50px'}
                                        />
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Page>
    );
};
