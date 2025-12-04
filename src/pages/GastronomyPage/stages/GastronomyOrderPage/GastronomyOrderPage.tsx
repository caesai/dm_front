import css from './GastronomyOrderPage.module.css';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { IOrder } from '@/types/gastronomy.types.ts';
import { RoundedButton } from '@/components/RoundedButton/RoundedButton.tsx';
import { MiniCrossIcon } from '@/components/Icons/MiniCrossIcon.tsx';
import { getRestaurantAddressById, MONTHS_LONG2, weekdaysMap } from '@/utils.ts';
import { UniversalButton } from '@/components/Buttons/UniversalButton/UniversalButton.tsx';
import moment from 'moment';
import GastronomyOrderPopup from '@/components/GastronomyOrderPopup/GastronomyOrderPopup.tsx';
import {
    APIGetGastronomyOrderById,
    APIPostCheckGastronomyPayment,
    APIPostCreateGastronomyPayment,
    APIPostSendQuestion,
} from '@/api/gastronomy.api.ts';
import { useAtom } from 'jotai';
import { authAtom } from '@/atoms/userAtom.ts';
import useToastState from '@/hooks/useToastState.ts';
import { restaurantsListAtom } from '@/atoms/restaurantsListAtom.ts';
import { Loader } from '@/components/AppLoadingScreen/AppLoadingScreen';

export const GastronomyOrderPage: React.FC = () => {
    const [auth] = useAtom(authAtom);
    const [restaurantsList] = useAtom(restaurantsListAtom);
    // params - используем когда перешли на страницу после платежа
    const [params] = useSearchParams();
    const { order_id } = useParams();
    const paramsObject = Object.fromEntries(params.entries());
    const { showToast } = useToastState();
    // location используем для перехода со страницы профиля
    const location = useLocation();
    const navigate = useNavigate();

    const [openPopup, setPopup] = useState(false);
    const [order, setOrder] = useState<IOrder>();
    const [paymentStatus, setPaymentStatus] = useState<'paid' | 'pending' | 'error' | 'no_payment' | 'not_paid' | 'canceled'>('pending');
    const [isLoading, setIsLoading] = useState(true);

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

    /**
     * Проверяет статус платежа за заказ в гастрономии и получает детали заказа.
     *
     * Данная функция выполняет два последовательных асинхронных запроса:
     * 1. Проверяет статус платежа через APIPostCheckGastronomyPayment.
     * 2. Если первый запрос успешен, получает полные детали заказа через APIGetGastronomyOrderById.
     *
     * В случае успеха первого запроса обновляет статус платежа, а в случае успеха второго - данные заказа.
     * В случае возникновения ошибок на любом из этапов, отображает соответствующие уведомления.
     * Функция мемоизирована с помощью useCallback и будет пересоздаваться только при изменении
     * auth.access_token или paramsObject.orderId.
     *
     * @param {object} auth Объект авторизации, содержащий токен доступа.
     * @param {string} paramsObject.orderId Идентификатор заказа для проверки.
     * @param {(status: string) => void} setPaymentStatus Функция для обновления статуса платежа.
     * @param {(order: object) => void} setOrder Функция для обновления данных заказа.
     * @param {(message: string) => void} showToast Функция для отображения уведомлений.
     * @returns {void}
     */
    const checkGastronomyPayment = useCallback(async () => {
        if (auth?.access_token && (paramsObject.orderId || order_id)) {
            try {
                const orderId = paramsObject.orderId || order_id;
                const response = await APIPostCheckGastronomyPayment(String(orderId), auth.access_token);
                setPaymentStatus(response.data.status);

                try {
                    const res = await APIGetGastronomyOrderById(String(orderId), auth.access_token);
                    setOrder(res.data);
                    setIsLoading(false);
                } catch (error) {
                    showToast('Не удалось получить детали заказа. Попробуйте еще раз.');
                }
            } catch (error) {
                setIsLoading(false);
                setPaymentStatus('pending');
                showToast('Платёж в обработке. Проверьте позже.');
            }
        }
    }, [auth?.access_token, paramsObject.orderId, order_id]);

    useEffect(() => {
        // Перешли на страницу после оплаты, проверяем статус оплаты и получаем данные о заказе
        checkGastronomyPayment().then();
    }, [checkGastronomyPayment]);

    useEffect(() => {
        // Если перешли на данную страницу со страницы профиля
        if (location?.state?.order) {
            setOrder(location?.state?.order);
        }
    }, [location.state]);

    useEffect(() => {
        if (paramsObject.error) {
            setPaymentStatus('error');
            showToast('Платёж не был успешно завершён. Проверьте данные и попробуйте снова');
        }
    }, [paramsObject]);

    const goToPreviousPage = () => {
        navigate('/profile');
    };

    const repeatPayment = () => {
        if (auth?.access_token) {
            if (paramsObject.orderId || order_id) {
                const orderId = paramsObject.orderId || order_id;
                APIPostCreateGastronomyPayment(String(orderId), auth?.access_token)
                    .then((res) => {
                        window.location.href = res.data.payment_url;
                    })
                    .catch(() => {
                        showToast(
                            'Не удалось создать платеж. Пожалуйста, попробуйте еще раз или проверьте соединение.'
                        );
                    });
            }
        }
    };

    const pageTitle = useMemo(() => {
        switch (paymentStatus) {
            case 'paid':
                return 'Заказ успешно оплачен!';
            case 'pending':
                return 'Заказ не оплачен';
            case 'not_paid':
                return 'Заказ в обработке';
            case 'error':
                return 'Ошибка при оплате заказа';
            case 'no_payment':
                return 'Заказ в обработке';
            case 'canceled':
                return 'Заказ отменен';
            default:
                return '';
        }
    }, [paymentStatus]);

    if (isLoading) {
        return (
            <div className={css.loader}>
                <Loader />
            </div>
        );
    }

    return (
        <>
            <GastronomyOrderPopup isOpen={openPopup} setOpen={setPopup} order_id={String(order?.order_id)} />
            <section className={css.page}>
                <div className={css.header}>
                    <span className={css.spacer}></span>
                    <span className={css.header_title}>Заказ {order?.order_id}</span>
                    <RoundedButton
                        bgColor={'var(--secondary-background)'}
                        icon={<MiniCrossIcon color={'var(--dark-grey)'} />}
                        action={goToPreviousPage}
                    />
                </div>
                <div className={css.content}>
                    <span className={css.content_title}>{pageTitle}</span>
                    <div className={css.items}>
                        {order?.items.map((item) => (
                            <div className={css.item} key={item.id}>
                                <span>{item.title}</span>
                                <span>
                                    {item.quantity} × {item.price} ₽
                                </span>
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
                            <span>
                                {order?.delivery_method === 'delivery' ? 'Доставка' : 'Самовывоз'},
                                {order &&
                                    ` ${order?.delivery_method === 'delivery' ? order.delivery_address : getRestaurantAddressById(order.restaurant_id, restaurantsList)}`}
                            </span>
                        </div>
                        {time && (
                            <div className={css.info_content}>
                                <span>Дата и время</span>
                                <span>
                                    {getDayOfWeek(time.date)}, {getDateWithMonth(time.date)}, {time.time}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
                <div className={css.bottom_buttons}>
                    {paymentStatus === 'paid' && (
                        <UniversalButton width={'full'} title={'Отменить заказ'} action={() => setPopup(true)} />
                    )}
                    {(paymentStatus === 'pending' || paymentStatus === 'no_payment' || paymentStatus === 'error' || paymentStatus === 'not_paid') && (
                        <UniversalButton width={'full'} title={'Оплатить заказ'} action={repeatPayment} />
                    )}
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
