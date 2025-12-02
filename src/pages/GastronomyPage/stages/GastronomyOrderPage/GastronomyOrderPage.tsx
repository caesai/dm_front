import css from './GastronomyOrderPage.module.css';
import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { IOrder } from '@/types/gastronomy.types.ts';
import { RoundedButton } from '@/components/RoundedButton/RoundedButton.tsx';
import { MiniCrossIcon } from '@/components/Icons/MiniCrossIcon.tsx';
import { MONTHS_LONG2, weekdaysMap } from '@/utils.ts';
import { UniversalButton } from '@/components/Buttons/UniversalButton/UniversalButton.tsx';
import moment from 'moment';
import GastronomyOrderPopup from '@/components/GastronomyOrderPopup/GastronomyOrderPopup.tsx';
import { useNavigationHistory } from '@/hooks/useNavigationHistory.ts';
import {
    APIGetGastronomyOrderById,
    APIPostCheckGastronomyPayment,
    APIPostSendQuestion,
} from '@/api/gastronomy.api.ts';
import { useAtom } from 'jotai';
import { authAtom } from '@/atoms/userAtom.ts';
import useToastState from '@/hooks/useToastState.ts';

export const GastronomyOrderPage: React.FC = () => {
    const [auth] = useAtom(authAtom);
    const [params] = useSearchParams();
    const paramsObject = Object.fromEntries(params.entries());

    const { goBack } = useNavigationHistory();
    const { showToast } = useToastState();

    const [openPopup, setPopup] = useState(false);
    const [order, setOrder] = useState<IOrder>();

    const time = useMemo(() => {
        return order?.delivery_time ? order.delivery_time : order?.pickup_time;
    }, [order]);

    const getDateWithMonth = (date: string) => {
        const currentDate = moment(date).format('DD');
        const currentMonth = MONTHS_LONG2[moment(date).month()];
        return `${currentDate} ${currentMonth}`;
    };

    const getDayOfWeek = (date: string) => {
        const dayIndex = new Date(date).getDay();
        return weekdaysMap[dayIndex];
    };

    const sendQuestion = () => {
        if (!auth) return;
        APIPostSendQuestion(String(order?.order_id), auth?.access_token)
            .then(() => showToast('Ваш вопрос отправлен администратору'))
            .catch(() => showToast('Произошла ошибка. Попробуйте еще раз.'));
    };

    useEffect(() => {
        if (auth?.access_token) {
            if (paramsObject.orderId) {
                APIPostCheckGastronomyPayment(paramsObject.orderId, auth?.access_token)
                    .then((response) => {
                        if (response.data.status === 'paid') {
                            APIGetGastronomyOrderById(paramsObject.orderId, auth?.access_token)
                                .then((res) => {
                                    setOrder(res.data);
                                })
                                .catch(() => {
                                    showToast('Не удалось получить детали заказа. Попробуйте еще раз.');
                                });
                        }
                    })
                    .catch(() => {
                        showToast('Ошибка проверки оплаты заказа. Попробуйте еще раз.');
                    });
            }
        }
    }, [auth?.access_token, paramsObject.orderId]);

    return (
        <>
            <GastronomyOrderPopup
                isOpen={openPopup}
                setOpen={setPopup}
                order_id={String(order?.order_id)}
            />
            <section className={css.page}>
                <div className={css.header}>
                    <span className={css.spacer}></span>
                    <span className={css.header_title}>Заказ {order?.order_id}</span>
                    <RoundedButton
                        bgColor={'var(--secondary-background)'}
                        icon={<MiniCrossIcon color={'var(--dark-grey)'} />}
                        action={goBack}
                    />
                </div>
                <div className={css.content}>
                    <span className={css.content_title}>Ваш заказ успешно оплачен!</span>
                    <div className={css.items}>
                        {order?.items.map(item => (
                            <div className={css.item} key={item.id}>
                                <span>{item.title}</span>
                                <span>{item.quantity} × {item.price} ₽</span>
                            </div>
                        ))}
                    </div>
                    <div className={css.item}>
                        <span>Итого</span>
                        <span>{order?.total_amount} ₽</span>
                    </div>
                    <div className={css.info}>
                        <div className={css.info_content}>
                            <span>Способ получения</span>
                            <span>{order?.delivery_method === 'delivery' ? 'Доставка' : 'Самовывоз'}, {order?.delivery_address}</span>
                        </div>
                        {time && (
                            <div className={css.info_content}>
                                <span>Дата и время</span>
                                <span>{getDayOfWeek(time.date)}, {getDateWithMonth(time.date)}, {time.time}</span>
                            </div>
                        )}
                    </div>
                </div>
                <div className={css.bottom_buttons}>
                    <UniversalButton width={'full'} title={'Отменить заказ'} action={() => setPopup(true)} />
                    <UniversalButton
                        width={'full'}
                        title={'Задать вопрос по заказу'}
                        theme={'red'}
                        action={sendQuestion}
                    />
                </div>
            </section>
        </>
    );
};
