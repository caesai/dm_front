import css from './RestaurantBadge.module.css';

interface RestaurantBadgeProps {
    logo: string;
}

export const RestaurantBadge = ({ logo }: RestaurantBadgeProps) => {
    return (
        <div className={css.badge}>
            <div
                style={{ backgroundImage: `url(${logo})` }}
                className={css.img}
            ></div>
        </div>
    );
};
