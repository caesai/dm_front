import axios from 'axios';
import { IStoriesBlockResponse } from '@/types/stories.types.ts';
import { BASE_URL } from '@/api/base.ts';

export const ApiGetStoriesBlocks = (token: string, city_id: number) => {
    return axios.get<IStoriesBlockResponse[]>(`${BASE_URL}/user-stories`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
        params: {
            city_id,
        },
    });
};
