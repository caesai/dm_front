import React from 'react';
import { Action, IStory } from '@/types/stories.types.ts';
import css from './Story.module.css';
import { DefaultStoryComponent } from '@/components/Stories/StoriesComponents/Default.tsx';
import { VideoStoryComponent } from '@/components/Stories/StoriesComponents/Video.tsx';
import { ImageStoryComponent } from '@/components/Stories/StoriesComponents/Image.tsx';
import { CustomStoryComponent } from '@/components/Stories/StoriesComponents/Custom.tsx';

interface StoryProps {
    story: IStory;
    action: Action;
    playState: boolean;
    shouldWait: boolean;
    isPaused: boolean;
    getVideoDuration: Function;
    bufferAction: boolean;
    width: number | string;
    height: number | string;
}

const Story: React.FC<StoryProps> = (
    {
        story,
        action,
        width,
        height,
        shouldWait,
        isPaused,
    },
) => {

    const renderStoryTypeComponent = () => {
        switch (story.type) {
            case 'component':
                return (
                    <CustomStoryComponent
                        story={story}
                        action={action}
                        isPaused={isPaused}
                        shouldWait={shouldWait}
                        width={'100%'}
                        height={'100%'}
                    />
                )
            case 'image':
                return (
                    <ImageStoryComponent
                        story={story}
                        action={action}
                        isPaused={isPaused}
                        shouldWait={shouldWait}
                        width={'100%'}
                        height={'100%'}
                    />
                )
            case 'video':
                return (
                    <VideoStoryComponent
                        story={story}
                        action={action}
                        isPaused={isPaused}
                        shouldWait={shouldWait}
                        width={'100%'}
                        height={'100%'}
                    />)
            default:
                return <DefaultStoryComponent story={story} action={action} />
        }
    };

    return (
        <div
            className={css.story}
            style={{
                width: width,
                height: height,
            }}
        >
            {renderStoryTypeComponent()}
        </div>
    );
};


export default Story;
