import axios from 'axios';
import { BASE_URL } from '@/api/base.ts';

export const APIGetCertificates = async (token: string) => {
    return axios.get(`${BASE_URL}/certificates`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })
}
