import axios from 'axios';
import { BASE_URL } from '@/api/base.ts';

export const APIGetCertificates = async (token: string, user_id: number) => {
    return axios.get(`${BASE_URL}/certificates`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
        params: {
            user_id,
        },
    });
};

export const APIPostCreateAlfaPayment = async (token: string, user_id: number, amount: number) => {
    return axios.post(`${BASE_URL}/alfabank/create-payment`, {
        user_id,
        amount,
    },{
        headers: {
            Authorization: `Bearer ${token}`,
        }
    });
};

export const APIPostCreateWithPayment = async (
    token: string,
    user_id: number,
    certificate_type: string,
    value: number,
    recipient_name: string,
    message: string,
) => {
    return axios.post(`${BASE_URL}/certificates/create-with-payment`, {
        user_id,
        certificate_type,
        value,
        recipient_name,
        message,
    }, {
        headers: {
            Authorization: `Bearer ${token}`,
        }
    })
}
