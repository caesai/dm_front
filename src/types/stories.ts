import {IStoryObject} from "stories-react/src/types";

export interface IStoriesBlock {
    stories: IStoryObject[];
    thumbnail: string;
}

//TODO: describe stories response data from endpoint
export interface IStoriesGroupResponse {
    id: string;
    thumbnail: string;
    stories: IStory[];
}

interface IStory {
    id: string;
    title: string;
    url: string;
    description: string;
    button_url: string;
    button_text: string;
    button_color: string;
}

export interface IStoryGroup {
    id: string;
    thumbnail: string;
    stories: IStoryObject[];
}
