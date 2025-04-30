import classNames from 'classnames';
import css from '@/components/EventCard/EventCard.module.css';

interface Props {
    title: string;
    address: string;
    image: string;
    onClick: () => void;
}

export const RestaurantCard = ({ title, address, image, onClick }: Props) => {
    return (
        <div
            className={classNames(css.card, css.bgImage)}
            style={{ backgroundImage: `url(${image})` }}
            onClick={() => onClick()}
        >
            <span />
            <div className={css.footer}>
                <span className={css.footer__title}>{title}</span>
                <span className={css.footer__address}>{address}</span>
            </div>
        </div>
    );
};
