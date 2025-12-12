import axios from 'axios';
import { BASE_URL } from '@/api/base.ts';
import { ICity } from '@/atoms/cityListAtom.ts';

export const APIGetCityList = () => {
    return axios.get<ICity[]>(`${BASE_URL}/city/list`);
};
