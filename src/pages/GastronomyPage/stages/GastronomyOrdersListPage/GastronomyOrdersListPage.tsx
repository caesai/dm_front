import React, { useState } from 'react';
import css from "./GastronomyOrdersList.module.css"
import { mockOrdersListData } from '@/__mocks__/gastronomy.mock.ts';
import { useNavigate } from 'react-router-dom';
import { IOrder } from '@/types/gastronomy.types.ts';

export const GastronomyOrdersListPage: React.FC = () => {
    const [ordersList,] = useState(mockOrdersListData);
    const navigate = useNavigate();

    const showOrderPage = (order: IOrder) => {
        navigate(`/gastronomy/order/${order.orderId}`, { state: { order } });
    }
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
