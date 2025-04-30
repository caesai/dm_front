import { Page } from '@/components/Page.tsx';
import css from './AdminScanner.module.css';
import { RoundedButton } from '@/components/RoundedButton/RoundedButton.tsx';
import { BackIcon } from '@/components/Icons/BackIcon.tsx';
import { useEffect, useState } from 'react';
import { mainButton } from '@telegram-apps/sdk-react';
import { useNavigate } from 'react-router-dom';
import { PlaceholderBlock } from '@/components/PlaceholderBlock/PlaceholderBlock.tsx';
import { formatDateDT } from '@/utils.ts';
import moment from 'moment/moment';
import { IEventTicketScanner } from '@/types/events.ts';
import { qrScanner } from '@telegram-apps/sdk-react';
import classNames from 'classnames';
import axios from 'axios';
import { BASE_URL } from '@/api/base.ts';
import { useAtom } from 'jotai';
import { authAtom } from '@/atoms/userAtom.ts';

export const AdminScannerPage = () => {
    const navigate = useNavigate();
    const [auth] = useAtom(authAtom);
    const [ticket, setTicket] = useState<IEventTicketScanner>();

    const captureQR = async (qr: string) => {
        if (auth?.access_token) {
            const req = await axios.get<IEventTicketScanner>(
                `${BASE_URL}/events/tickets/scanner`,
                {
                    params: {
                        id: Number(qr),
                    },
                    headers: {
                        Authorization: `Bearer ${auth.access_token}`,
                    },
                }
            );
            if (req.status === 200) {
                setTicket(req.data);
            }
            if (req.status === 403) {
                alert('Недостаточно прав.');
            }
            if (req.status === 404) {
                alert('Билет не найден');
            }
        }
    };

    const scanQrCode = async () => {
        if (qrScanner.open.isAvailable()) {
            const prom = qrScanner.open({
                text: 'Сканируйте QR билета',
                capture(qr: string) {
                    captureQR(qr);
                    return true;
                },
            });
            await prom;
            qrScanner.close();
        }
    };

    useEffect(() => {
        if (mainButton.mount.isAvailable()) {
            mainButton.mount();
            mainButton.setParams({
                backgroundColor: '#F52A2D',
                hasShineEffect: false,
                isEnabled: true,
                isLoaderVisible: false,
                isVisible: true,
                text: 'Сканировать',
                textColor: '#ffffff',
            });
        }

        const removeListener = mainButton.onClick(() => scanQrCode());

        return () => {
            removeListener();
        };
    }, []);

    useEffect(() => {
        return () => {
            mainButton.setParams({ isVisible: false });
            mainButton.unmount();
        };
    }, []);

    useEffect(() => {
        if (ticket && auth?.access_token) {
            axios
                .post(
                    `${BASE_URL}/events/tickets/scanner/confirm`,
                    {},
                    {
                        params: {
                            id: ticket.id,
                        },
                        headers: {
                            Authorization: `Bearer ${auth.access_token}`,
                        },
                    }
                )
                .then(() => null);
        }
    }, [ticket]);

    return (
        <Page back={true}>
            <div className={css.page}>
                <div className={css.pageWrapper}>
                    <div className={css.header}>
                        <RoundedButton
                            icon={
                                <BackIcon
                                    size={24}
                                    color={'var(--dark-grey)'}
                                />
                            }
                            action={() => navigate(-1)}
                        />
                        <span className={css.headerTitle}>Сканер билетов</span>
                        <div className={css.spacer}></div>
                    </div>
                    {!ticket ? (
                        <h3>Билет не отсканирован</h3>
                    ) : (
                        <div className={css.ticket}>
                            {ticket.is_confirmed ? (
                                <div>
                                    <h3>Билет уже погашен</h3>
                                </div>
                            ) : null}
                            <div className={css.ticket_header}>
                                <div
                                    className={classNames(
                                        css.ticket_header_img,
                                        css.bgImage
                                    )}
                                    style={{
                                        backgroundImage: `url(${ticket?.event_img || 'https://storage.yandexcloud.net/bottec-dreamteam/event_placeholder.png'})`,
                                    }}
                                />
                                <div className={css.ticket_header_details}>
                                    <span
                                        className={classNames(
                                            css.mont,
                                            css.ticket_header_details__title
                                        )}
                                    >
                                        {ticket?.event_title || (
                                            <PlaceholderBlock
                                                width={'170px'}
                                                height={'19px'}
                                            />
                                        )}
                                    </span>
                                    <span
                                        className={classNames(
                                            css.mont,
                                            css.ticket_header_details__res
                                        )}
                                    >
                                        {ticket?.restaurant.title || (
                                            <PlaceholderBlock
                                                width={'170px'}
                                                height={'19px'}
                                            />
                                        )}
                                    </span>
                                </div>
                            </div>
                            <div className={css.ticket_details}>
                                <div className={css.ticket_details_row}>
                                    <div className={css.ticket_details_row_obj}>
                                        <span
                                            className={classNames(
                                                css.mont,
                                                css.ticket_details_row_obj__title
                                            )}
                                        >
                                            Адрес
                                        </span>
                                        <span
                                            className={classNames(
                                                css.mont,
                                                css.ticket_details_row_obj_cont
                                            )}
                                        >
                                            {ticket?.restaurant.address || (
                                                <PlaceholderBlock
                                                    width={'170px'}
                                                    height={'19px'}
                                                />
                                            )}
                                        </span>
                                    </div>
                                </div>
                                <div className={css.ticket_details_row}>
                                    <div className={css.ticket_details_row_obj}>
                                        <span
                                            className={classNames(
                                                css.mont,
                                                css.ticket_details_row_obj__title
                                            )}
                                        >
                                            Имя
                                        </span>
                                        <span
                                            className={classNames(
                                                css.mont,
                                                css.ticket_details_row_obj_cont
                                            )}
                                        >
                                            {ticket ? (
                                                ticket.user.first_name
                                            ) : (
                                                <PlaceholderBlock
                                                    width={'50px'}
                                                    height={'19px'}
                                                />
                                            )}
                                        </span>
                                    </div>
                                    <div className={css.ticket_details_row_obj}>
                                        <span
                                            className={classNames(
                                                css.mont,
                                                css.ticket_details_row_obj__title
                                            )}
                                        >
                                            Номер телефона
                                        </span>
                                        <span
                                            className={classNames(
                                                css.mont,
                                                css.ticket_details_row_obj_cont
                                            )}
                                        >
                                            {ticket ? (
                                                ticket.user.phone_number
                                            ) : (
                                                <PlaceholderBlock
                                                    width={'50px'}
                                                    height={'19px'}
                                                />
                                            )}
                                        </span>
                                    </div>
                                </div>
                                <div className={css.ticket_details_row}>
                                    <div className={css.ticket_details_row_obj}>
                                        <span
                                            className={classNames(
                                                css.mont,
                                                css.ticket_details_row_obj__title
                                            )}
                                        >
                                            Дата рождения
                                        </span>
                                        <span
                                            className={classNames(
                                                css.mont,
                                                css.ticket_details_row_obj_cont
                                            )}
                                        >
                                            {ticket ? (
                                                ticket.user.date_of_birth
                                            ) : (
                                                <PlaceholderBlock
                                                    width={'50px'}
                                                    height={'19px'}
                                                />
                                            )}
                                        </span>
                                    </div>
                                </div>
                                <div className={css.ticket_details_row}>
                                    <div className={css.ticket_details_row_obj}>
                                        <span
                                            className={classNames(
                                                css.mont,
                                                css.ticket_details_row_obj__title
                                            )}
                                        >
                                            Дата
                                        </span>
                                        <span
                                            className={classNames(
                                                css.mont,
                                                css.ticket_details_row_obj_cont
                                            )}
                                        >
                                            {ticket ? (
                                                formatDateDT(
                                                    new Date(ticket?.date_start)
                                                )
                                            ) : (
                                                <PlaceholderBlock
                                                    width={'50px'}
                                                    height={'19px'}
                                                />
                                            )}
                                        </span>
                                    </div>
                                    <div className={css.ticket_details_row_obj}>
                                        <span
                                            className={classNames(
                                                css.mont,
                                                css.ticket_details_row_obj__title
                                            )}
                                        >
                                            Время
                                        </span>
                                        <span
                                            className={classNames(
                                                css.mont,
                                                css.ticket_details_row_obj_cont
                                            )}
                                        >
                                            {ticket ? (
                                                moment(
                                                    ticket?.date_start
                                                ).format('HH:mm')
                                            ) : (
                                                <PlaceholderBlock
                                                    width={'50px'}
                                                    height={'19px'}
                                                />
                                            )}
                                        </span>
                                    </div>
                                </div>
                                <div className={css.ticket_details_row}>
                                    <div className={css.ticket_details_row_obj}>
                                        <span
                                            className={classNames(
                                                css.mont,
                                                css.ticket_details_row_obj__title
                                            )}
                                        >
                                            Количество гостей
                                        </span>
                                        <span
                                            className={classNames(
                                                css.mont,
                                                css.ticket_details_row_obj_cont
                                            )}
                                        >
                                            {ticket?.guest_count || (
                                                <PlaceholderBlock
                                                    width={'50px'}
                                                    height={'19px'}
                                                />
                                            )}
                                        </span>
                                    </div>
                                    <div className={css.ticket_details_row_obj}>
                                        <span
                                            className={classNames(
                                                css.mont,
                                                css.ticket_details_row_obj__title
                                            )}
                                        >
                                            Стоимость
                                        </span>
                                        <span
                                            className={classNames(
                                                css.mont,
                                                css.ticket_details_row_obj_cont
                                            )}
                                        >
                                            {ticket ? (
                                                `${ticket?.total} ₽`
                                            ) : (
                                                <PlaceholderBlock
                                                    width={'70px'}
                                                    height={'19px'}
                                                />
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Page>
    );
};
