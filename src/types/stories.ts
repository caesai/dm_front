import {IStoryObject} from "stories-react/src/types";

export interface IStoriesBlockResponse {
    id: string;
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
    id: string;
    type: TStory;
    duration: number;
    url: string;
    title: string;
    description: string;
    button_url: string;
    button_text: string;
    button_color: string;
    views_count: number;
    order_index: number;
}

type TStory = 'image' | 'video' | 'component';

export interface IStoryBlock {
    id: string;
    thumbnail: string;
    stories: IStoryObject[];
    name: string;
}
