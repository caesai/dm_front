import { useEffect } from 'react';
import { Renderer, Tester } from '@/types/stories.types.ts';
import css from '@/components/Stories/renderers/Default.module.css';

export const renderer: Renderer = ({ story, action }) => {
    useEffect(() => {
        action("play");
    }, [story]);
    return (
        <div className={css.storyContent}>
            <p className={css.text}>This story could not be loaded.</p>
        </div>
    );
};

export const tester: Tester = () => {
    return {
        condition: true,
        priority: 1,
    };
};

export default {
    renderer,
    tester,
};
