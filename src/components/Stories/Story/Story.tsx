import React, { useContext } from "react";
import { Action, GlobalStoriesCtx, IStoryObject } from '@/types/stories.types.ts';
import GlobalStoriesContext from '@/components/Stories/context/GlobalStoriesContext.ts';
import css from './Story.module.css';

interface StoryProps {
    story: IStoryObject;
    action: Action;
    playState: boolean;
    shouldWait: boolean;
    getVideoDuration: Function;
    bufferAction: boolean;
}

const Story: React.FC<StoryProps> = (props) => {
    const globalContext = useContext<GlobalStoriesCtx>(GlobalStoriesContext);

    const {
        width,
        height,
        loader,
        header,
        storyStyles,
        storyInnerContainerStyles = {},
    } = globalContext;

    const rendererMessageHandler = (type: string, data: any) => {
        switch (type) {
            case "UPDATE_VIDEO_DURATION":
                props.getVideoDuration(data.duration);
                return { ack: "OK" as "OK" };
            default:
                return { ack: "ERROR" as "ERROR" };
        }
    };

    const getStoryContent = () => {
        let InnerContent = props.story?.content;
        let config = { width, height, loader, header, storyStyles };
        if (InnerContent === undefined) return null;
        return (
            <InnerContent
                action={props.action}
                isPaused={props.playState}
                shouldWait={props.shouldWait}
                story={props.story}
                config={config}
                messageHandler={rendererMessageHandler}
            />
        );
    };

    return (
        <div
            className={css.story}
            style={{
                ...storyInnerContainerStyles,
                width: width,
                height: height,
            }}
        >
            {getStoryContent()}
        </div>
    );
};


export default Story;
