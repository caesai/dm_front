import React, { useEffect } from 'react';
import { IStory, Action } from '@/types/stories.types.ts';
import css from '@/components/Stories/StoriesComponents/Default.module.css';

interface DefaultStoryComponentProps {
    story: IStory;
    action: Action;
}

export const DefaultStoryComponent: React.FC<DefaultStoryComponentProps> = ({ story, action }) => {
    useEffect(() => {
        action("play");
    }, [story]);
    return (
        <div className={css.storyContent}>
            <p className={css.text}>This story could not be loaded.</p>
        </div>
    );
};
