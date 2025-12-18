import axios from 'axios';
import { BASE_URL, CLIENT_URL } from '@/api/base.ts';
import { IDish, IOrder, ISendOrder } from '@/types/gastronomy.types.ts';

export const APIGetUserOrders = async (token: string) => {
    return await axios.get<IOrder[]>(
        `${BASE_URL}/culinary/orders`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        },
    );
};

export const APIGetGastronomyDishesList = async (token: string, res_id?: string) => {
    return await axios.get<IDish[]>(
        `${BASE_URL}/culinary/dishes`,
        {
            params: {
                restaurant_id: res_id,
            },
            headers: {
                Authorization: `Bearer ${token}`,
            },
        },
    );
};

export const APIPostUserOrder = async (data: ISendOrder, token: string) => {
    return await axios.post<IOrder>(
        `${BASE_URL}/culinary/orders`, data,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        },
    );
};

export const APIPostSendQuestion = async (order_id: string, token: string) => {
    return await axios.post(
        `${BASE_URL}/culinary/orders/question`, {
            order_id,
            question: 'Пользователь задал вопрос',
        },
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        },
    );
};

export const APIPostCancelOrder = (order_id: string, token: string) => {
    return axios.post(`${BASE_URL}/culinary/orders/cancel`, {
        order_id,
        reason: 'Пользователь отменил заказ',
    },
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        },
    );
};

export const APIPostCreateGastronomyPayment = async (order_id: string, token: string) => {
    return axios.post(`${BASE_URL}/culinary/orders/payment`, {
            order_id,
            return_url: `${CLIENT_URL}/gastronomy/order/${order_id}`,
            // return_url: `https://dt-mini-app.local/dm_front/gastronomy/order/${order_id}`,
            fail_url: `${CLIENT_URL}/gastronomy/order/${order_id}?error=true`,
            // fail_url: `https://dt-mini-app.local/dm_front/gastronomy/order/${order_id}`,
        },
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        },
    );
};

export const APIPostCheckGastronomyPayment = async (order_id: string, token: string) => {
    return axios.post(`${BASE_URL}/culinary/orders/check-payment`, {
            order_id,
        },
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        },
    );
};

export const APIGetGastronomyOrderById = async (order_id: string, token: string) => {
    return axios.get(`${BASE_URL}/culinary/orders/get`, {
        params: {
            order_id,
        },
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
};
