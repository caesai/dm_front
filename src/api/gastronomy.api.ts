import axios from 'axios';
import { BASE_URL } from '@/api/base.ts';
import { IDish, IOrder } from '@/types/gastronomy.types.ts';

export const APIGetUserOrders = async (phone: string, token: string) => {
    return await axios.get<IOrder[]>(
        `${BASE_URL}/culinary/orders`,
        {
            params: {
                phone: phone
            },
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );
};

export const APIGetGastronomyDishes = async (token: string, res_id?: string) => {
    return await axios.get<IDish[]>(
        `${BASE_URL}/culinary/dishes`,
        {
            params: {
                restaurant_id: res_id,
            },
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );
};


export const APIPostCancelOrder = (order_id: string, token: string) => {
    return axios.post(`${BASE_URL}/culinary/orders/${order_id}/cancel`, {},
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );
};