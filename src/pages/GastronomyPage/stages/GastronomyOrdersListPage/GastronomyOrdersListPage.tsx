import React, { useEffect, useState } from 'react';
import css from "./GastronomyOrdersList.module.css"
import { useNavigate } from 'react-router-dom';
import { IOrder } from '@/types/gastronomy.types.ts';
import { useAtom } from 'jotai';
import { authAtom, userAtom } from '@/atoms/userAtom.ts';
import useToastState from '@/hooks/useToastState.ts';
import { APIGetUserOrders } from '@/api/gastronomy.api.ts';

export const GastronomyOrdersListPage: React.FC = () => {
    const [user] = useAtom(userAtom);
    const [auth] = useAtom(authAtom)
    const navigate = useNavigate();
    const { showToast } = useToastState();

    const [ordersList, setOrdersList] = useState<IOrder[]>([]);

    const showOrderPage = (order: IOrder) => {
        navigate(`/gastronomy/order/${order.orderId}`, { state: { order } });
    }

    useEffect(() => {
        if (user && user.phone_number && auth) {
            APIGetUserOrders(user.phone_number, auth?.access_token)
                .then((res) => {
                    setOrdersList(res.data)
                })
                .catch((err) => {
                    if (err.response) {
                        showToast('Возникла ошибка: ' + err.response.data.message);
                    }
                });
        }
    }, [user, auth?.access_token]);
    return (
        <div className={css.order_page}>
            <div className={css.container}>
                {ordersList.map((order) => (
                    <div className={css.order_content} key={order.orderId}>
                        <div className={css.order}>
                            <span className={css.order_title}>Заказ {order.orderId}</span>
                            <span className={css.order_text}>{order.deliveryAddress}</span>
                        </div>
                        <button
                            className={css.order_button}
                            onClick={() => showOrderPage(order)}
                        >
                            Подробнее
                        </button>
                    </div>
                ))}
            </div>
        </div>
    )
}
