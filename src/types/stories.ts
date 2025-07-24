import {IStoryObject} from "stories-react/src/types";
import {TCityList} from "@/atoms/cityListAtom.ts";

export interface IStoriesBlockResponse {
    id: string;
    thumbnail: string;
    stories: IStory[];
    cities?: TCityList;
    active: boolean;
    users: IStoryUsers;
}

type IStoryUsers = number[];

export interface IStory {
    id: string;
    type: IStoryType;
    duration: number;
    url: string;
    title: string;
    description: string;
    button_url: string;
    button_text: string;
    button_color: string;
}

type IStoryType = 'image' | 'video' | 'component';

export interface IStoryBlock {
    id: string;
    thumbnail: string;
    stories: IStoryObject[];
}
