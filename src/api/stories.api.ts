import {IStoriesBlockResponse} from "@/types/stories.types.ts";
import axios from 'axios';
import { BASE_URL } from '@/api/base.ts';
// import { mockedStories } from '@/__mocks__/stories.mock.ts';

export const ApiGetStoriesBlocks = (token: string, city_id: number) => {
    // TODO: return axios get request
    // return Promise.resolve({ data: mockedStories });
    return axios.get<IStoriesBlockResponse[]>(`${BASE_URL}/user-stories`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
        params: {
            city_id,
        },
    });
}
