import React, { useEffect, useState } from 'react';
import css from './GastronomyOrdersList.module.css';
import { useNavigate } from 'react-router-dom';
import { IOrder } from '@/types/gastronomy.types.ts';
import { useAtom } from 'jotai';
import { authAtom } from '@/atoms/userAtom.ts';
import useToastState from '@/hooks/useToastState.ts';
import { APIGetUserOrders } from '@/api/gastronomy.api.ts';
import { restaurantsListAtom } from '@/atoms/restaurantsListAtom.ts';
import { getRestaurantAddressById } from '@/utils.ts';

export const GastronomyOrdersListPage: React.FC = () => {
    const [auth] = useAtom(authAtom);
    const [restaurantsList] = useAtom(restaurantsListAtom);

    const navigate = useNavigate();
    const { showToast } = useToastState();

    const [ordersList, setOrdersList] = useState<IOrder[]>([]);

    const showOrderPage = (order: IOrder, skip_page?: boolean) => {
        navigate(`/gastronomy/order/${order.order_id}`, { state: { order, skip_page } });
    };

    useEffect(() => {
        if (auth?.access_token) {
            APIGetUserOrders(auth?.access_token)
                .then((res) => {
                    setOrdersList(res.data);
                })
                .catch((err) => {
                    if (err.response) {
                        showToast('Возникла ошибка: ' + err.response.data.message);
                    }
                });
        }
    }, [auth?.access_token]);

    useEffect(() => {
        if (ordersList.length === 1) {
            showOrderPage(ordersList[0], true);
        }
    }, [ordersList]);

    return (
        <div className={css.order_page}>
            <div className={css.container}>
                {ordersList.length > 0 ?
                    ordersList.map((order) => (
                        <div className={css.order_content} key={order.order_id}>
                            <div className={css.order}>
                                <span className={css.order_title}>Заказ {order.order_id}</span>
                                <span className={css.order_text}>
                                    {order.delivery_address ? order.delivery_address : getRestaurantAddressById(String(order.restaurant_id), restaurantsList)}
                                </span>
                            </div>
                            <button
                                className={css.order_button}
                                onClick={() => showOrderPage(order)}
                            >
                                Подробнее
                            </button>
                        </div>
                    ))
                    : <span className={css.no_orders}>У вас нет заказов</span>
                }
            </div>
        </div>
    );
};
