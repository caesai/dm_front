import css from './EventCard.module.css';
import classNames from 'classnames';
import {FC} from 'react';
import {IEventDate} from "@/pages/EventsPage/EventsPage.tsx";
import moment from "moment";
// import {InfoTag} from "@/components/InfoTag/InfoTag.tsx";
// import {getCurrentTimeShort, getCurrentWeekdayShort, getRestaurantStatus} from "@/utils.ts";

interface IEventCard {
    event_name: string;
    event_price: number;
    event_img?: string;
    event_desc: string;
    event_address?: string;
    event_dates: IEventDate[];
    event_restaurant: string;
    onClick: () => void;
    sold?: boolean;
}

export const EventCard: FC<IEventCard> = ({
  event_name,
  event_price,
  // event_desc,
  event_img,
  event_dates,
  event_address,
  event_restaurant,
  onClick,
  sold,
}) => {
    console.log('sold: ', sold);
    return (
        <div onClick={() => {
            if (sold) {
                return;
            }
            onClick();
        }} style={{cursor: 'pointer', marginBottom: 5}}>
            <div
                className={classNames(css.card, css.bgImage,
                    sold ? css.notActive : null
                )}
                style={{
                    backgroundImage: `url(${event_img ? event_img : 'https://storage.yandexcloud.net/bottec-dreamteam/event_placeholder.png'})`,
                }}
            >
                <div className={css.footer}>
                    {!sold ? <span className={classNames(css.card_price)}>{Number(event_price) == 0 ? 'Бесплатно' : event_price + ' ₽'}</span> :
                        (
                            <span className={classNames(css.card_price)}>Sold out</span>
                        )}
                    {/*<span className={css.footer__title}>{event_name}</span>*/}
                    {/*<span className={css.footer__address}>{event_desc}</span>*/}
                </div>
            </div>
            <div className={css.resInfo}>
                <div className={css.resTitleWrapper}>
                    <h2 className={css.resTitle}>{event_name}</h2>
                    <span className={css.resSlogan}>
                        {event_dates.length > 0 && moment(event_dates[0].date_start).format('DD.MM.YYYY')} &bull; {event_restaurant}
                    </span>
                    <span className={css.resAddress}>{event_address}</span>
                    {/*<span className={css.resSlogan}>{restaurant.address}</span>*/}
                </div>
                {/*<div className={css.tags}>*/}
                {/*    <InfoTag*/}
                {/*        text={getRestaurantStatus(*/}
                {/*            restaurant.worktime,*/}
                {/*            getCurrentWeekdayShort(),*/}
                {/*            getCurrentTimeShort()*/}
                {/*        )}*/}
                {/*    />*/}
                {/*    <InfoTag text={`Ср. чек ${restaurant.avg_cheque}₽`}/>*/}
                {/*</div>*/}
            </div>
        </div>
    );
};
