import { Page } from '@/components/Page.tsx';
import css from './TicketInfoPage.module.css';
import { RoundedButton } from '@/components/RoundedButton/RoundedButton.tsx';
import { BackIcon } from '@/components/Icons/BackIcon.tsx';
import { useNavigate, useParams } from 'react-router-dom';
import classNames from 'classnames';
import { RefundIcon } from '@/components/Icons/RefundIcon.tsx';
import { DownloadIcon } from '@/components/Icons/DownloadIcon.tsx';
import { useEffect, useState } from 'react';
import { EventTicket } from '@/types/events.ts';
import { APIGetTicket } from '@/api/events.ts';
import { useAtom } from 'jotai';
import { authAtom } from '@/atoms/userAtom.ts';
import { PlaceholderBlock } from '@/components/PlaceholderBlock/PlaceholderBlock.tsx';
import { formatDateDT } from '@/utils.ts';
import moment from 'moment';
import QRCode from 'react-qr-code';
import jsPDF from "jspdf";
// import {BASE_BOT} from "@/api/base.ts";
import {Buffer} from 'buffer';
import {MontFont} from "@/components/MontFont/Montfont.ts";


export const TicketInfoPage = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [auth] = useAtom(authAtom);
    const [ticket, setTicket] = useState<EventTicket>();

    useEffect(() => {
        if (!auth?.access_token) {
            return;
        }
        APIGetTicket(Number(id), auth.access_token).then((res) => {
            setTicket(res.data);
        });
    }, [id]);

    const sharePdf = () => {
        const doc = new jsPDF("p","pt","a4");
        doc.html(document.getElementById('ticket') as HTMLElement, {
            callback: function (doc) {
                // doc.save('doc.pdf');
                doc.addFileToVFS('/fonts/mont/Mont-Regular.ttf', MontFont);
                doc.addFont('/fonts/mont/Mont-Regular.ttf', 'Mont-Regular', 'normal');
                doc.setFont('Mont-Regular');
                // const jpegUrl = document.getElementById('qr').toDataURL("image/jpeg");
                // doc.addImage(jpegUrl, 'JPEG', 0, 0);
                const buffer = Buffer.from(doc.output(), 'utf-8')
                const pdf = new File([buffer], "hello.pdf", { type: "application/pdf" });
                const files = [pdf];
                navigator.share({
                    files
                }).then();
            },
            html2canvas: {
                scale: 0.8, // Adjust scaling factor if needed
            },
            // fontFaces: ['Mont']
        });
    }
    return (
        <Page back={true}>
            <div className={css.body}>
                <div className={css.header}>
                    <div className={css.header_group}>
                        <RoundedButton
                            icon={
                                <BackIcon
                                    size={24}
                                    color={'var(--dark-grey)'}
                                />
                            }
                            action={() => navigate('/tickets')}
                            bgColor={'var(--primary-background)'}
                        />
                        <div className={css.header_spacer} />
                    </div>
                    <span className={css.header_title}>Мои билеты</span>
                    <div className={css.header_group}>
                        <RoundedButton
                            icon={<RefundIcon />}
                            action={() => alert('refund')}
                            bgColor={'var(--primary-background)'}
                        />

                        <RoundedButton
                            icon={<DownloadIcon />}
                            action={sharePdf}
                            bgColor={'var(--primary-background)'}
                        />
                    </div>
                </div>

                <div className={css.ticket} id={'ticket'}>
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
                                        moment(ticket?.date_start).format(
                                            'HH:mm'
                                        )
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
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'center',
                        }}
                    >
                        {ticket ? (
                            <QRCode size={128} value={String(`${ticket.id}`)} id={'qr'} />
                        ) : (
                            <PlaceholderBlock
                                width={'128px'}
                                height={'128px'}
                            />
                        )}
                    </div>
                </div>
            </div>
        </Page>
    );
};
