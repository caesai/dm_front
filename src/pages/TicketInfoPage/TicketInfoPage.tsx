import { Page } from '@/components/Page.tsx';
import css from './TicketInfoPage.module.css';
import { RoundedButton } from '@/components/RoundedButton/RoundedButton.tsx';
import { BackIcon } from '@/components/Icons/BackIcon.tsx';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import classNames from 'classnames';
// import { RefundIcon } from '@/components/Icons/RefundIcon.tsx';
// import { DownloadIcon } from '@/components/Icons/DownloadIcon.tsx';
import { useEffect, useState } from 'react';
import { EventTicket } from '@/types/events.ts';
import { APIGetSharedTicket, APIGetTicket } from '@/api/events.ts';
import { useAtom } from 'jotai';
import { authAtom } from '@/atoms/userAtom.ts';
import { PlaceholderBlock } from '@/components/PlaceholderBlock/PlaceholderBlock.tsx';
// import { formatDateDT } from '@/utils.ts';
import moment from 'moment';
// import QRCode from 'react-qr-code';
// import jsPDF from "jspdf";
// import {BASE_BOT} from "@/api/base.ts";
// import { Buffer } from 'buffer';
// import {MontFont} from "@/components/MontFont/Montfont.ts";
// import '../../../public/'
// @ts-ignore
import html2pdf from 'html2pdf.js';
import { ModalPopup } from '@/components/ModalPopup/ModalPopup.tsx';
import { useModal } from '@/components/ModalPopup/useModal.ts';
import { BASE_BOT } from '@/api/base.ts';
import { Share } from '@/components/Icons/Share.tsx';
import { getDataFromLocalStorage, setDataToLocalStorage } from '@/utils.ts';


export const TicketInfoPage = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const [auth] = useAtom(authAtom);
    const [ticket, setTicket] = useState<EventTicket>();
    const [isRefund, setIsRefund] = useState(false);
    const { isShowing, toggle } = useModal();
    const shared = Boolean(searchParams.get('shared'));
    const ticket_refund = getDataFromLocalStorage('ticket_refund');
    console.log('refundTicket: ', ticket_refund);
    useEffect(() => {
        if (!auth?.access_token || shared) {
            APIGetSharedTicket(Number(id)).then((res) => {
                setTicket(res.data);
            });
        } else {
            APIGetTicket(Number(id), auth.access_token).then((res) => {
                setTicket(res.data);
            });
        }
    }, [id]);

    // const sharePdf = () => {
    //     const ticketEl = document.getElementById('ticket');
    //     html2pdf().from(ticketEl).output('blob').then((pdfAsString: string) => {
    //         const buffer = Buffer.from(pdfAsString, 'utf-8');
    //         const pdf = new File([buffer], ticket?.event_title + '.pdf', { type: 'application/pdf' });
    //         const files = [pdf];
    //         navigator.share({
    //             files,
    //         }).then();
    //     });
    // };

    const shareTicket = () => {
        const url = encodeURI(
            `https://t.me/${BASE_BOT}?startapp=ticketId_${id}`
        );
        const title = encodeURI(String(ticket?.event_title));
        const shareData = {
            title,
            url,
        }
        try {
            if (navigator && navigator.canShare(shareData)) {
                navigator.share(shareData).then().catch((err) => {
                    alert(JSON.stringify(err));
                });
            }
        } catch (e) {
            window.open(`https://t.me/share/url?url=${url}&text=${title}`, "_blank");
        }
    };

    const refund = () => {
        setIsRefund(true);
        setDataToLocalStorage('ticket_refund', { id });
        console.log('wt', { id });
        setTimeout(() => {
            window.location.href = `https://t.me/${BASE_BOT}?start=refund-${Number(id)}`;
        }, 5000);
    };

    const goBack = () => {
        if (!auth?.access_token) {
            navigate('/onboarding/5');
        } else {
            navigate('/tickets');
        }
    }

    return (
        <Page back={true}>
            <ModalPopup
                isOpen={isShowing}
                setOpen={toggle}
                title={!isRefund ? 'Вы хотите оформить возврат?' : 'Запрос принят'}
                text={isRefund ? `В течении 30 минут с вами свяжется сотрудник ресторана, чтобы оформить возврат. Если запрос был отправлен вне рабочего времени ресторана, мы обязательно ответим сразу после открытия.` : undefined}
                button={!isRefund}
                btnText={'Да'}
                reverseButton={true}
                btnAction={refund}
                btnScndrText={'Нет'}
            />
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
                            action={goBack}
                            bgColor={'var(--primary-background)'}
                        />
                    </div>
                    <span className={css.header_title}>Мои билеты</span>
                    <div className={css.header_group}>
                        <RoundedButton
                            icon={<Share />}
                            action={shareTicket}
                            bgColor={'var(--primary-background)'}
                        />
                        {/*<RoundedButton*/}
                        {/*    icon={<DownloadIcon />}*/}
                        {/*    action={sharePdf}*/}
                        {/*    bgColor={'var(--primary-background)'}*/}
                        {/*/>*/}
                    </div>
                </div>

                <div className={css.ticket} id={'ticket'}>
                    <div className={css.ticket_header}>
                        {ticket?.event_img && ticket?.event_img !== "" ? (
                            <div
                                className={classNames(
                                    css.ticket_header_img,
                                    css.bgImage,
                                )}
                                style={{
                                    backgroundImage: `url(${ticket?.event_img})`,
                                }}
                            />
                            ) : (
                            <PlaceholderBlock
                                width={'100%'}
                                aspectRatio={'3/2'}
                            />
                        )}
                        <div className={css.ticket_header_details}>
                            <span
                                className={classNames(
                                    css.mont,
                                    css.ticket_header_details__title,
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
                                    css.ticket_header_details__res,
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
                        {!shared && (
                            <div>
                                <span onClick={refund} className={css.refundBtn}>{isRefund || (ticket_refund && JSON.parse(ticket_refund).id === id) ? 'Запрос на возврат оформлен' : 'Оформить возврат'}</span>
                            </div>
                        )}
                    </div>
                    <div className={css.ticket_details}>
                        <div className={css.ticket_details_row}>
                            <div className={css.ticket_details_row_obj}>
                                <span
                                    className={classNames(
                                        css.mont,
                                        css.ticket_details_row_obj__title,
                                    )}
                                >
                                    Адрес
                                </span>
                                <span
                                    className={classNames(
                                        css.mont,
                                        css.ticket_details_row_obj_cont,
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
                                        css.ticket_details_row_obj__title,
                                    )}
                                >
                                    Дата
                                </span>
                                <span
                                    className={classNames(
                                        css.mont,
                                        css.ticket_details_row_obj_cont,
                                    )}
                                >
                                    {ticket ? (
                                        moment(ticket?.date_start).format('DD.MM.YYYY')
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
                                        css.ticket_details_row_obj__title,
                                    )}
                                >
                                    Время
                                </span>
                                <span
                                    className={classNames(
                                        css.mont,
                                        css.ticket_details_row_obj_cont,
                                    )}
                                >
                                    {ticket ? (
                                        moment(ticket?.date_start).format(
                                            'HH:mm',
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
                                        css.ticket_details_row_obj__title,
                                    )}
                                >
                                    Количество гостей
                                </span>
                                <span
                                    className={classNames(
                                        css.mont,
                                        css.ticket_details_row_obj_cont,
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
                                        css.ticket_details_row_obj__title,
                                    )}
                                >
                                    Стоимость
                                </span>
                                <span
                                    className={classNames(
                                        css.mont,
                                        css.ticket_details_row_obj_cont,
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
                    <div className={css.ticket_details_row}>
                        <div className={css.ticket_details_row_obj}>
                                <span
                                    className={classNames(
                                        css.mont,
                                        css.ticket_details_row_obj__title,
                                    )}
                                >
                                    Номер телефона
                                </span>
                            <span
                                className={classNames(
                                    css.mont,
                                    css.ticket_details_row_obj_cont,
                                )}
                            >
                                    {ticket ? (
                                        `${ticket?.phone} `
                                    ) : (
                                        <PlaceholderBlock
                                            width={'70px'}
                                            height={'19px'}
                                        />
                                    )}
                                </span>
                        </div>
                    </div>
                    {/*<div*/}
                    {/*    style={{*/}
                    {/*        display: 'flex',*/}
                    {/*        justifyContent: 'center',*/}
                    {/*    }}*/}
                    {/*>*/}
                    {/*    {ticket ? (*/}
                    {/*        <QRCode size={128} value={String(`${ticket.id}`)} id={'qr'} />*/}
                    {/*    ) : (*/}
                    {/*        <PlaceholderBlock*/}
                    {/*            width={'128px'}*/}
                    {/*            height={'128px'}*/}
                    {/*        />*/}
                    {/*    )}*/}
                    {/*</div>*/}
                </div>
            </div>
        </Page>
    );
};
