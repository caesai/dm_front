import React, { useState, useCallback } from 'react';
import css from '@/components/Stories/StoriesComponents/Image.module.css';
import { IStory } from '@/types/stories.types.ts';
import { StoriesLoader } from '@/components/Stories/StoriesComponents/StoriesLoader.tsx';

interface ImageStoryComponentProps {
    story: IStory;
    action: Function;
    isPaused: boolean;
    shouldWait: boolean;
    width: number | string;
    height: number | string;
}

export const ImageStoryComponent: React.FC<ImageStoryComponentProps> = (
    {
        story,
        action,
        shouldWait,
    },
) => {
    const [isLoading, setIsLoading] = useState(false);

    const handleImageLoad = useCallback(() => {
        if (!shouldWait) {
            setIsLoading(true);
            action('play');
        }
    }, [shouldWait, action]);

    return (
        <div style={{ width: '100%' }}>
            <img
                className={css.storyContent}
                src={String(story.url)}
                onLoad={handleImageLoad}
                alt={`Story image from ${story.url}`}
            />
            <StoriesLoader isLoading={isLoading} />
        </div>
    );
};
