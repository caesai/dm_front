import css from './RestaurantBadgePhoto.module.css';

interface Badge {
    url: string;
}

export const RestaurantBadgePhoto = ({ url }: Badge) => {
    return (
        <div
            className={css.badge}
            style={{ backgroundImage: `url(${url})` }}
        ></div>
    );
};
