import axios from 'axios';
import { BASE_URL } from '@/api/base.ts';
import { IOrder } from '@/types/gastronomy.types.ts';

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


export const APIPostCancelOrder = (order_id: string, token: string) => {
    return axios.post(`${BASE_URL}/culinary/orders/${order_id}/cancel`, {},
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );
};