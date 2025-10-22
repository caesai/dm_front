import React, { useState } from 'react';
import { Loader } from '@/components/AppLoadingScreen/AppLoadingScreen.tsx';
import css from '@/components/Stories/StoriesComponents/Image.module.css';
import { Action, IStory } from '@/types/stories.types.ts';

interface ImageStoryComponentProps {
    story: IStory;
    action: Action;
    isPaused: boolean;
    shouldWait: boolean;
    width: number | string;
    height: number | string;
}

export const ImageStoryComponent: React.FC<ImageStoryComponentProps> = (
    {
        story,
        action,
        // isPaused,
        shouldWait,
        width,
        height,
    },
) => {
    const [loaded, setLoaded] = useState(false);

    const imageLoaded = () => {
        if (!shouldWait) {
            setLoaded(true);
            action('play');
        }
    };

    return (
        <div style={{ width: '100%'}}>
            <img className={css.storyContent} src={String(story.url)} onLoad={imageLoaded} alt={''} />
            {!loaded && (
                <div
                    style={{
                        width: width,
                        height: height,
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        background: 'rgba(0, 0, 0, 0.9)',
                        zIndex: 9,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        color: '#ccc',
                    }}
                >
                    <Loader />
                </div>
            )}
        </div>
    );
};
