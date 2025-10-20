// import {IStoryObject} from "stories-react/src/types";
import React from 'react';

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

export interface IStoryObject {
    type: string;
    url: string;
    duration: number;
    component?: any;
    header?: any;
    seeMore?: any;
    seeMoreComponent?: any;
    seeMoreCollapsed: React.ComponentType<{
        toggleMore: (show: boolean) => void;
        action: Action;
    }>;
    onSeeMoreClick?: (storyIndex: number) => void;
    muted?: boolean;
    originalContent: Renderer;
    content: Renderer;
    preloadResource?: boolean;
    componentOptions : {
        url: string | null;
        title: string | null;
        description: string | null;
        button_url: string | null;
        button_text: string | null;
        button_color: string | null;
        component_type: number | null;
    }
}

export interface Story {
    url?: string;
    seeMore?: Function;
    // seeMoreCollapsed?: React.ComponentType<{
    //     toggleMore: (show: boolean) => void;
    //     action: Action;
    // }>;
    // header?: Header;
    type?: string;
    duration?: number;
    styles?: object;
    content?: Renderer;
    // originalContent?: Renderer
    // Whether to preload the resource or not, defaults to `true` for images and `false` for videos (video preloading is experimental)
    preloadResource?: boolean;
    muted?: boolean;
}

export type Action = (action: string, bufferAction?: boolean) => void;

export type Renderer = React.FC<{
    action: Action;
    isPaused: boolean;
    shouldWait: boolean;
    story: IStoryObject;
    config: {
        width?: NumberOrString;
        height?: NumberOrString;
        loader?: JSX.Element;
        header?: Function;
        storyStyles?: Object;
    };
    messageHandler: (type: string, data: any) => { ack: "OK" | "ERROR" };
}>;

type NumberOrString = number | string;

export interface GlobalStoriesCtx{
    width?: NumberOrString;
    height?: NumberOrString;
    loader?: JSX.Element;
    header?: Function;
    storyContainerStyles?: Record<string, any>;
    storyInnerContainerStyles?: Record<string, any>;
    storyStyles?: Object;
    progressContainerStyles?: Object;
    progressWrapperStyles?: Object;
    progressStyles?: Object;
    loop?: boolean;
    defaultInterval?: number;
    isPaused?: boolean;
    shouldWait?: boolean;
    currentIndex?: number;
    renderers?: {
        renderer: Renderer;
        tester: Tester;
    }[];
    onAllStoriesEnd?: Function;
    onStoryStart?: Function;
    onStoryEnd?: Function;
    onPrevious?: Function;
    onNext?: Function;
    keyboardNavigation?: boolean;
    preventDefault?: boolean;
    preloadCount?: number;
    slideIndex?: number;
}

export interface StoriesCtx {
    stories: Story[];
}

export interface ProgressCtx {
    currentId: number;
    videoDuration: number;
    bufferAction: boolean;
    pause: boolean;
    next: Function;
}

export type Tester = (story: Story) => {
    condition: boolean;
    priority: number;
};
