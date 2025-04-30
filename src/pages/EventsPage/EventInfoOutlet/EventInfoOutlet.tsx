import classNames from 'classnames';
import css from './EventInfoOutlet.module.css';
import { UniversalButton } from '@/components/Buttons/UniversalButton/UniversalButton.tsx';
import { useNavigate, useOutletContext, useParams } from 'react-router-dom';
import { IEventBookingContext } from '@/utils.ts';

export const EventInfoOutlet = () => {
    const { name } = useParams();
    const navigate = useNavigate();
    const [bookingInfo] = useOutletContext<IEventBookingContext>();

    const next = () => {
        // setBookingInfo((prev) => ({ ...prev, eventId: id }));
        navigate(`/events/${name}/restaurant`);
    };

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
                    {bookingInfo.event?.description}
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
