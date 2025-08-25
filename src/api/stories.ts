import {IStoriesBlockResponse} from "@/types/stories.ts";
import axios from 'axios';
import { BASE_URL } from '@/api/base.ts';

export const ApiGetStoriesBlocks = (token: string, city_id: number) => {
    // TODO: return axios get request
    return axios.get<IStoriesBlockResponse[]>(`${BASE_URL}/user-stories`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
        params: {
            city_id,
        },
    });
}
