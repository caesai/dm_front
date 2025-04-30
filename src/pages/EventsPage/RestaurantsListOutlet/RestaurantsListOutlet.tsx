import { useNavigate, useOutletContext, useParams } from 'react-router-dom';
import css from './RestaurantsListOutlet.module.css';
import { RestaurantCard } from '@/pages/EventsPage/RestaurantsListOutlet/RestaurantCard/RestaurantCard.tsx';
import { IEventBookingContext } from '@/utils.ts';
import { IEventRestaurant } from '@/pages/EventsPage/EventsPage.tsx';

export const RestaurantsListOutlet = () => {
    const { name } = useParams();
    const navigate = useNavigate();
    const [bookingInfo, setBookingInfo] =
        useOutletContext<IEventBookingContext>();

    const next = (res: IEventRestaurant) => {
        setBookingInfo((p) => ({
            ...p,
            restaurantId: String(res.id),
            restaurant: res,
        }));
        navigate(`/events/${name}/restaurant/${res.id}`);
    };

    return (
        <>
            <div className={css.list}>
                {bookingInfo.event?.restaurants.map((res) => (
                    <RestaurantCard
                        key={res.id}
                        title={res.title}
                        address={res.address}
                        image={res.thumbnail_photo}
                        onClick={() => next(res)}
                    />
                ))}
            </div>
        </>
    );
};
