import { Page } from '@/components/Page.tsx';
import css from './BookingConfirmationPage.module.css';
import { useAtom } from 'jotai';
import { bookingAtom } from '@/atoms/bookingInfoAtom.ts';
import { RoundedButton } from '@/components/RoundedButton/RoundedButton.tsx';
import { CrossIcon } from '@/components/Icons/CrossIcon.tsx';
import { useNavigate } from 'react-router-dom';
import classNames from 'classnames';
import { TimeCircle } from '@/components/Icons/TimeCircle.tsx';
import { CalendarIcon } from '@/components/Icons/CalendarIcon.tsx';
import { UsersIcon } from '@/components/Icons/UsersIcon.tsx';
import { ChatIcon } from '@/components/Icons/ChatIcon.tsx';
// import { BookingCreatedPopup } from '@/pages/BookingConfirmationPage/BookingCreatedPopup/BookingCreatedPopup.tsx';
import { GoToPathIcon } from '@/components/Icons/GoToPathIcon.tsx';
import { PlaceholderBlock } from '@/components/PlaceholderBlock/PlaceholderBlock.tsx';

export const BookingConfirmationPage = () => {
    const [bookingInfo] = useAtom(bookingAtom);
    bookingInfo?.date && bookingInfo.persons;

    // const [bookingCreatedPopup, setBookingCreatedPopup] = useState(false);

    const navigate = useNavigate();

    return (
        <Page back={true}>
            <div className={css.absolute_footer}>
                <div
                    className={classNames(css.fr, css.absolute_footer_wrapper)}
                ></div>
            </div>
            <div className={classNames(css.fc, css.page)}>
                <div className={classNames(css.main, css.border__bottom)}>
                    <div className={css.header}>
                        <div className={css.wh44}></div>
                        <div className={classNames(css.fc, css.headerContent)}>
                            <h3 className={css.headerContent__title}>
                                Бронирование
                            </h3>
                        </div>
                        <div
                            className={css.headerButtons}
                            onClick={() => navigate(-1)}
                        >
                            <RoundedButton
                                icon={<CrossIcon size={44} color={'black'} />}
                            />
                        </div>
                    </div>
                    <div className={classNames(css.fc, css.content)}>
                        <div
                            className={classNames(
                                css.fc,
                                css.calendarContainer
                            )}
                        >
                            {0 ? (
                                <>
                                    <div
                                        className={classNames(
                                            css.calendar,
                                            css.calendar__month
                                        )}
                                    >
                                        <span>фев</span>
                                    </div>
                                    <div
                                        className={classNames(
                                            css.calendar,
                                            css.calendar__day
                                        )}
                                    >
                                        <span>14</span>
                                    </div>
                                </>
                            ) : (
                                <PlaceholderBlock
                                    width={'45px'}
                                    height={'59px'}
                                />
                            )}
                        </div>
                        <div
                            className={classNames(
                                css.fc,
                                css.bookingInfo_restaurant
                            )}
                        >
                            <h2 className={css.bookingInfo_restaurant__title}>
                                {1 ? (
                                    'SMOKE BBQ'
                                ) : (
                                    <PlaceholderBlock
                                        width={'200px'}
                                        height={'50px'}
                                    />
                                )}
                            </h2>
                            <span
                                className={css.bookingInfo_restaurant__subtitle}
                            >
                                {1 ? (
                                    'Москва, Трубная 8'
                                ) : (
                                    <PlaceholderBlock
                                        width={'120px'}
                                        height={'17px'}
                                    />
                                )}
                            </span>
                        </div>
                        <div
                            className={classNames(
                                css.fc,
                                css.bookingInfoDetails
                            )}
                        >
                            <div
                                className={classNames(
                                    css.fr,
                                    css.bookingInfoDetails_container
                                )}
                            >
                                <div
                                    className={classNames(
                                        css.fr,
                                        css.bookingInfoDetails_item
                                    )}
                                >
                                    <TimeCircle
                                        size={16}
                                        color={'var(--dark-grey)'}
                                    ></TimeCircle>
                                    <span
                                        className={
                                            css.bookingInfoDetails_item__text
                                        }
                                    >
                                        17:00
                                    </span>
                                </div>
                                <div
                                    className={classNames(
                                        css.fr,
                                        css.bookingInfoDetails_item
                                    )}
                                >
                                    <CalendarIcon
                                        size={16}
                                        color={'var(--dark-grey)'}
                                    ></CalendarIcon>
                                    <span
                                        className={
                                            css.bookingInfoDetails_item__text
                                        }
                                    >
                                        14 февраля
                                    </span>
                                </div>
                                <div
                                    className={classNames(
                                        css.fr,
                                        css.bookingInfoDetails_item
                                    )}
                                >
                                    <UsersIcon
                                        size={16}
                                        color={'var(--dark-grey)'}
                                    ></UsersIcon>
                                    <span
                                        className={
                                            css.bookingInfoDetails_item__text
                                        }
                                    >
                                        2
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div
                            className={classNames(
                                css.fc,
                                css.bookingInfoDetails
                            )}
                        >
                            <div
                                className={classNames(
                                    css.fr,
                                    css.bookingInfoDetails_container
                                )}
                            >
                                <div
                                    className={classNames(
                                        css.fr,
                                        css.bookingInfoDetails_item
                                    )}
                                >
                                    <ChatIcon
                                        size={16}
                                        color={'var(--dark-grey)'}
                                    ></ChatIcon>
                                    <span
                                        className={
                                            css.bookingInfoDetails_item__text
                                        }
                                    >
                                        Возможно опоздаем
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className={css.yaTaxi}>
                            <div
                                key={'taxi1'}
                                className="ya-taxi-widget"
                                data-ref="https%3A%2F%2Fdemo.efinskiy.ru%2F"
                                data-proxy-url="https://3.redirect.appmetrica.yandex.com/route?start-lat={start-lat}&amp;start-lon={start-lon}&amp;end-lat={end-lat}&amp;end-lon={end-lon}&amp;tariffClass={tariff}&amp;ref={ref}&amp;appmetrica_tracking_id=1178268795219780156"
                                data-tariff="econom"
                                data-app="3"
                                data-lang="ru"
                                data-redirect="1178268795219780156"
                                data-description="Smoke BBQ"
                                data-size="s"
                                data-theme="normal"
                                data-title="Вызвать такси"
                                data-use-location="true"
                                data-point-a=""
                                data-point-b="39.751934,47.227023"
                            ></div>
                        </div>
                    </div>
                    <div className={classNames(css.fr, css.page)}>
                        <div
                            className={css.redButton}
                            onClick={() =>
                                navigate('/restaurant/1?menuOpen=true')
                            }
                        >
                            <span className={css.text}>Смотреть меню</span>
                        </div>
                        <RoundedButton
                            radius={'50px'}
                            action={() =>
                                window.open('https://maps.yandex.ru/')
                            }
                            icon={
                                <GoToPathIcon
                                    size={24}
                                    color={'var(--dark-grey)'}
                                />
                            }
                        />
                    </div>
                </div>
            </div>
        </Page>
    );
};
