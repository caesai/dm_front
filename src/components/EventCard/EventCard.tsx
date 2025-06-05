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
    event_address: string;
    event_dates: IEventDate[];
    event_restaurant: string;
    onClick: () => void;
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
                                          }) => {
    return (
        <div onClick={() => onClick()} style={{ cursor: 'pointer'}}>
            <div
                className={classNames(css.card, css.bgImage)}
                style={{
                    backgroundImage: `url(${event_img ? event_img : 'https://storage.yandexcloud.net/bottec-dreamteam/event_placeholder.png'})`,
                }}
            >
                <div className={css.footer}>
                    <span className={classNames(css.card_date)}>{event_price} ₽</span>
                    {/*<span className={css.footer__title}>{event_name}</span>*/}
                    {/*<span className={css.footer__address}>{event_desc}</span>*/}
                </div>
            </div>
            <div className={css.resInfo}>
                <div className={css.resTitleWrapper}>
                    <h2 className={css.resTitle}>{event_name}</h2>
                    <span className={css.resSlogan}>
                        {moment(event_dates[0].date_start).format('DD.MM.YYYY')} {event_restaurant}
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
