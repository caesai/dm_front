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
    })
}
