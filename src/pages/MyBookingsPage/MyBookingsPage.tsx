import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAtom } from 'jotai';
import classNames from 'classnames';
// API's
import { APIGetMyBookings } from '@/api/restaurants.api.ts';
// Types
import { IBookingInfo } from '@/types/restaurant.types.ts';
// Atoms
import { authAtom } from '@/atoms/userAtom.ts';
// Components
import { Page } from '@/components/Page.tsx';
import { RoundedButton } from '@/components/RoundedButton/RoundedButton.tsx';
import { BackIcon } from '@/components/Icons/BackIcon.tsx';
import { BookingCard } from '@/components/BookingCard/BookingCard.tsx';
import { PlaceholderBlock } from '@/components/PlaceholderBlock/PlaceholderBlock.tsx';
// Styles
import css from './MyBookingsPage.module.css';
import { useNavigationHistory } from '@/hooks/useNavigationHistory.ts';

export const MyBookingsPage: React.FC = () => {
    const { goBack, getPreviousPath } = useNavigationHistory();
    const navigate = useNavigate();

    const [auth] = useAtom(authAtom);
    const [bookings, setBookings] = useState<IBookingInfo[]>([]);
    const [loading, setLoading] = useState(true);

    const clickOnActiveBooking = (id: string) => {
        navigate(`/myBookings/${id}`);
    };

    const handleGoBack = () => {
        const prevPath = getPreviousPath();
        prevPath?.includes('/myBookings/') ? navigate('/') : goBack();
    };

    useEffect(() => {
        if (!auth?.access_token) {
            return;
        }
        APIGetMyBookings(auth.access_token)
            .then((res) => setBookings(res.data))
            .finally(() => setLoading(false));
    }, []);

    return (
        <Page back={true}>
            <div className={classNames(css.page, css.fc)}>
                <div className={classNames(css.fr, css.header)}>
                    <RoundedButton
                        icon={<BackIcon size={24} />}
                        bgColor={'var(--primary-background)'}
                        action={handleGoBack}
                    />
                    <span className={css.header__title}>Мои бронирования</span>
                    <div className={css.wh44}></div>
                </div>
                <div className={css.bookingList}>
                    {!loading ? (
                        <>
                            {!bookings.length && <h2 className={css.header__title}>Список пуст</h2>}
                            {bookings
                                .sort(function (a, b) {
                                    const aDate = new Date(a.booking_date);
                                    const bDate = new Date(b.booking_date);
                                    return bDate.getTime() - aDate.getTime();
                                })
                                .sort((a, b) => {
                                    return (
                                        Number(b.booking_status !== 'canceled') -
                                        Number(a.booking_status !== 'canceled')
                                    );
                                })
                                .map((booking) => (
                                    <BookingCard
                                        key={booking.id}
                                        date={booking.booking_date}
                                        image={booking.restaurant.thumbnail_photo}
                                        time={booking.time}
                                        active={['new', 'waiting', 'confirmed'].some(
                                            (v) => v == booking.booking_status
                                        )}
                                        booking_id={String(booking.id)}
                                        title={booking.restaurant.title}
                                        address={booking.restaurant.address}
                                        click_callback={clickOnActiveBooking}
                                    />
                                ))}
                        </>
                    ) : (
                        <>
                            <PlaceholderBlock width={'100%'} aspectRatio={'3/2'} rounded={'16px'} />
                            <PlaceholderBlock width={'100%'} aspectRatio={'3/2'} rounded={'16px'} />
                            <PlaceholderBlock width={'100%'} aspectRatio={'3/2'} rounded={'16px'} />
                        </>
                    )}
                </div>
            </div>
        </Page>
    );
};
