import axios from 'axios';
import { BASE_URL } from '@/api/base.ts';

export interface IConfigEA {
    result: boolean;
}

export const APIGetEA = async () => {
    return await axios.get<IConfigEA>(`${BASE_URL}/config/ea`);
};
