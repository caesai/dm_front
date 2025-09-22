import {IStoryObject} from "stories-react/src/types";

export interface IStoriesBlockResponse {
    id: number;
    thumbnail: string;
    stories: IStory[];
    cities?: TStoriesCitiesIds;
    active: boolean;
    users: TStoryUsersIds;
    views_count: number;
    priority: number;
    name: string;
}

type TStoryUsersIds = number[];
type TStoriesCitiesIds = number[]

export interface IStory {
    id: number;
    type: TStory;
    component_type: number | null;
    duration: number;
    url: string | null;
    title: string | null;
    description: string | null;
    button_url: string | null;
    button_text: string | null;
    button_color: string | null;
    views_count: number;
    order_index: number;
}

export type TStory = 'image' | 'video' | 'component';

export interface IStoryBlock {
    id: number;
    thumbnail: string;
    stories: IStoryObject[];
    name: string;
}
