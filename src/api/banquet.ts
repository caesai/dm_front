import axios from 'axios';
import { BASE_URL } from '@/api/base.ts';
import { IBanquetReserve } from '@/types/banquets.ts';

export const APIPostBanquetRequest = async (token: string | undefined, banquetReserve: IBanquetReserve) => {
    return axios.post(`${BASE_URL}/banquet/request`, {
        ...banquetReserve
    }, {
        headers: {
            Authorization: `Bearer ${token}`,
        }
    })
}

export const APIGetBanquetOptions = async (token: string, restaurant_id: number ) => {
    return axios.get(`${BASE_URL}/banquet-options/restaurant/${restaurant_id}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
}
