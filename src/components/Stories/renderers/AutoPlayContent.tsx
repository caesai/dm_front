import { useEffect } from 'react';
import { Renderer, Tester } from '@/types/stories.types.ts';

export const renderer: Renderer = (props) => {
    useEffect(() => {
        if (!props.shouldWait) {
            props.action('play');
        }
    }, [props.story, props.shouldWait]);
    const Content = props.story.originalContent;
    return <Content {...props} />
}

export const tester: Tester = (story) => {
    return {
        condition: !!story.content,
        priority: 2
    }
}

export default {
    renderer,
    tester
}
