import { useNavigate, useOutletContext, useParams } from 'react-router-dom';
import css from './EventConfirmationOutlet.module.css';
import {
    findCurrentDate,
    formatDateDT,
    IEventBookingContext,
} from '@/utils.ts';
import { UniversalButton } from '@/components/Buttons/UniversalButton/UniversalButton.tsx';
import moment from 'moment';
// import { IEventBooking, IEventDate } from '@/pages/EventsPage/EventsPage.tsx';

export const EventConfirmationOutlet = () => {
    const navigate = useNavigate();
    const { name, res } = useParams();
    const [bookingInfo, setBookingInfo] =
        useOutletContext<IEventBookingContext>();

    const next = () => {
        setBookingInfo((prev) => ({ ...prev }));
        navigate(`/events/${name}/restaurant/${res}/confirm`);
    };

    return (
        <div className={css.content}>
            <div
                className={css.event_img}
                style={{
                    backgroundImage: `url(${bookingInfo.event?.image_url})`,
                }}
            />
            <div className={css.content_description}>
                <h2 className={css.content_description__title}>
                    {bookingInfo.event?.name}
                </h2>
                <span className={css.content_description__info}>
                    {bookingInfo.event?.description}
                </span>
            </div>
            <div className={css.event_params}>
                <div className={css.event_params_row}>
                    <div className={css.event_params_col}>
                        <span className={css.event_params_col__title}>
                            Дата
                        </span>
                        <span className={css.event_params_col__data}>
                            {bookingInfo.date
                                ? formatDateDT(
                                      new Date(bookingInfo.date.start_datetime)
                                  )
                                : null}
                        </span>
                    </div>
                    <div className={css.event_params_col}>
                        <span className={css.event_params_col__title}>
                            Время
                        </span>
                        <span className={css.event_params_col__data}>
                            {bookingInfo.date
                                ? moment(
                                      bookingInfo.date.start_datetime
                                  ).format('HH:mm')
                                : null}
                        </span>
                    </div>
                </div>
                <div className={css.event_params_row}>
                    <div className={css.event_params_col}>
                        <span className={css.event_params_col__title}>
                            Осталось мест
                        </span>
                        <span className={css.event_params_col__data}>
                            {bookingInfo.date
                                ? findCurrentDate(bookingInfo, bookingInfo.date)
                                      ?.tickets_left
                                : null}
                        </span>
                    </div>
                </div>
                {/*<div className={css.event_params_row}>*/}
                {/*    <div className={css.event_params_col}>*/}
                {/*        <span className={css.event_params_col__title}>*/}
                {/*            Ресторан*/}
                {/*        </span>*/}
                {/*        <span className={css.event_params_col__data}>*/}
                {/*            {bookingInfo.restaurant?.title}*/}
                {/*        </span>*/}
                {/*    </div>*/}
                {/*</div>*/}
                {/*<div className={css.event_params_row}>*/}
                {/*    <div className={css.event_params_col}>*/}
                {/*        <span className={css.event_params_col__title}>*/}
                {/*            Адрес*/}
                {/*        </span>*/}
                {/*        <span className={css.event_params_col__data}>*/}
                {/*            {bookingInfo.restaurant?.address}*/}
                {/*        </span>*/}
                {/*    </div>*/}
                {/*</div>*/}
                <div className={css.event_params_row}>
                    <div className={css.event_params_col}>
                        <span className={css.event_params_col__title}>
                            Цена
                        </span>
                        <span className={css.event_params_col__data}>
                            {bookingInfo.event?.ticket_price} ₽
                        </span>
                    </div>
                </div>
                <div className={css.roundedText}>
                    <span>✓ 100% предоплата</span>
                </div>
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
