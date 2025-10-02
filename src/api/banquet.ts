import axios from 'axios';
import { BASE_URL } from '@/api/base.ts';
interface IBanquetReserve {
    "restaurant_id": number;
    "banquet_option": string;
    "date": string;
    "start_time": string;
    "end_time": string;
    "guests_count": number;
    "occasion": string;
    "additional_services": string[];
    "comment": string;
    "contact_method": string;
    "estimated_cost": number;
}
export const APIPostBanquetRequest = async (token: string | undefined, banquetReserve: IBanquetReserve) => {
    return axios.post(`${BASE_URL}/banquet/request`, {
        ...banquetReserve
    }, {
        headers: {
            Authorization: `Bearer ${token}`,
        }
    })
}
