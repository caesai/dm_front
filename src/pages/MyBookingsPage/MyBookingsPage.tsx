import { Page } from '@/components/Page.tsx';
import css from './MyBookingsPage.module.css';
import classNames from 'classnames';
import { RoundedButton } from '@/components/RoundedButton/RoundedButton.tsx';
import { BackIcon } from '@/components/Icons/BackIcon.tsx';
import { useNavigate } from 'react-router-dom';
import { BookingCard } from '@/components/BookingCard/BookingCard.tsx';
import { useEffect, useState } from 'react';
import { IBookingInfo } from '@/types/restaurant.ts';
import { PlaceholderBlock } from '@/components/PlaceholderBlock/PlaceholderBlock.tsx';
import { useAtom } from 'jotai';
import { authAtom } from '@/atoms/userAtom.ts';
import { APIGetMyBookings } from '@/api/restaurants.ts';

export const MyBookingsPage = () => {
    const navigate = useNavigate();
    const [auth] = useAtom(authAtom);
    const [bookings, setBookings] = useState<IBookingInfo[]>([]);
    const [loading, setLoading] = useState(true);

    const clickOnActiveBooking = (id: number) => {
        navigate(`/myBookings/${id}`);
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
                        action={() => navigate('/profile')}
                    />
                    <span className={css.header__title}>Мои бронирования</span>
                    <div className={css.wh44}></div>
                </div>
                <div className={css.bookingList}>
                    {!loading ? (
                        <>
                            {!bookings.length && <h2>Список пуст</h2>}
                            {bookings.map((booking) => (
                                <BookingCard
                                    key={booking.id}
                                    date={booking.booking_date}
                                    time={booking.time}
                                    active={[
                                        'new',
                                        'waiting',
                                        'confirmed',
                                    ].some((v) => v == booking.booking_status)}
                                    booking_id={booking.id}
                                    title={booking.restaurant.title}
                                    address={booking.restaurant.address}
                                    click_callback={clickOnActiveBooking}
                                />
                            ))}
                        </>
                    ) : (
                        <>
                            <PlaceholderBlock
                                width={'100%'}
                                aspectRatio={'3/2'}
                                rounded={'16px'}
                            />
                            <PlaceholderBlock
                                width={'100%'}
                                aspectRatio={'3/2'}
                                rounded={'16px'}
                            />
                            <PlaceholderBlock
                                width={'100%'}
                                aspectRatio={'3/2'}
                                rounded={'16px'}
                            />
                        </>
                    )}
                </div>
            </div>
        </Page>
    );
};
