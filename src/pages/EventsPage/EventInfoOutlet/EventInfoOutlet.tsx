import classNames from 'classnames';
import css from './EventInfoOutlet.module.css';
import { UniversalButton } from '@/components/Buttons/UniversalButton/UniversalButton.tsx';
import { useNavigate, useOutletContext, useParams } from 'react-router-dom';
import { IEventBookingContext } from '@/utils.ts';

export const EventInfoOutlet = () => {
    const { name } = useParams();
    const navigate = useNavigate();
    const [bookingInfo, setBookingInfo] = useOutletContext<IEventBookingContext>();

    const next = () => {
        // setBookingInfo((prev) => ({ ...prev, eventId: id }));
        if (bookingInfo.event?.restaurants && bookingInfo.event?.restaurants.length > 1) {
            navigate(`/events/${name}/restaurant`);
        } else {
            setBookingInfo((p) => ({
                ...p,
                restaurantId: String(bookingInfo.event?.restaurants[0].id),
                restaurant: bookingInfo.event?.restaurants[0],
            }));
            // navigate(`/events/${name}/restaurant/${bookingInfo.event?.restaurants[0].id}`);
            navigate(`/events/${name}/restaurant/${bookingInfo.event?.restaurants[0].id}/guests`)
        }
    };
    console.log('bookingInfo.: ', bookingInfo);
    return (
        <div className={css.outlet}>
            <div
                className={classNames(css.card, css.bgImage)}
                style={{
                    backgroundImage: `url(${bookingInfo.event?.image_url ? bookingInfo.event.image_url : 'https://storage.yandexcloud.net/bottec-dreamteam/event_placeholder.png'})`,
                }}
            >
                <span className={classNames(css.card_date)}>
                    {bookingInfo.event?.ticket_price} ₽
                </span>
            </div>
            <div className={css.event_info}>
                <span className={css.title}>{bookingInfo.event?.name}</span>
                <span className={css.description}>
                {bookingInfo.event?.description.split(/\n|\r\n/).map((segment, index) => (
                    <>
                        {index > 0 && <br />}
                        {segment}
                    </>
                ))}
                </span>
            </div>
            <div className={css.absoluteBottom}>
                <div className={css.bottomWrapper}>
                    <UniversalButton
                        width={'full'}
                        title={'Купить билет'}
                        theme={'red'}
                        action={() => next()}
                    />
                </div>
            </div>
        </div>
    );
};
