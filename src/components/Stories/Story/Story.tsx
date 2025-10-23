// Story.tsx
import React, { FC } from 'react';
import { IStory } from '@/types/stories.types.ts';
import css from './Story.module.css';
import { VideoStoryComponent } from '@/components/Stories/StoriesComponents/Video.tsx';
import { ImageStoryComponent } from '@/components/Stories/StoriesComponents/Image.tsx';
import { CustomStoryComponent } from '@/components/Stories/StoriesComponents/Custom.tsx';

interface StoryProps {
    story: IStory;
    action: Function;
    playState: boolean; // Note: isPaused is a more descriptive prop name, aligning with previous refactoring.
    shouldWait: boolean;
    isPaused: boolean;
    getVideoDuration: Function;
    bufferAction: boolean;
    width: number | string;
    height: number | string;
}

// Define a type for the component map to ensure type safety.
type StoryComponentMap = {
    [key in IStory['type']]: FC<any>;
};

// Create a component map to replace the switch statement.
const storyComponentMap: StoryComponentMap = {
    component: CustomStoryComponent,
    image: ImageStoryComponent,
    video: VideoStoryComponent,
    // default: DefaultStoryComponent,
};

const Story: React.FC<StoryProps> = (
    {
        story,
        action,
        shouldWait,
        isPaused,
        getVideoDuration,
        playState,
        bufferAction,
    },
) => {
    // Dynamically retrieve the component based on the story type.
    const StoryComponent = storyComponentMap[story.type];

    // Pass common props to the dynamically rendered component.
    const commonProps = {
        story,
        action,
        isPaused,
        shouldWait,
        // Pass other specific props if needed.
        getVideoDuration,
        playState,
        bufferAction,
    };

    return (
        <div className={css.story}>
            <StoryComponent {...commonProps} />
        </div>
    );
};

export default Story;
