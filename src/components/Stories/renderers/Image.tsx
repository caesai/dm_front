import { useState } from 'react';
import { Renderer, Tester } from '@/types/stories.types.ts';
import { Loader } from '@/components/AppLoadingScreen/AppLoadingScreen.tsx';
import WithHeader from '@/components/Stories/wrappers/WithHeader.tsx';
import WithSeeMore from '@/components/Stories/wrappers/WithSeeMore.tsx';
import css from '@/components/Stories/renderers/Image.module.css';

export const renderer: Renderer = (
    {
        story,
        action,
        // isPaused,
        config,
        shouldWait,
    },
) => {
    const [loaded, setLoaded] = useState(false);
    const { width, height, loader } = config;

    const imageLoaded = () => {
        if (!shouldWait) {
            setLoaded(true);
            action('play');
        }
    };

    return (
        <WithHeader {...{ story, globalHeader: config.header }}>
            <WithSeeMore {...{ story, action }}>
                <div style={{ width: '100%'}}>
                    <img className={css.storyContent} src={story.url} onLoad={imageLoaded} alt={''} />
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
                            {loader || <Loader />}
                        </div>
                    )}
                </div>
            </WithSeeMore>
        </WithHeader>
    );
};


export const tester: Tester = (story) => {
    return {
        condition: story.type === 'image',
        priority: 2,
    };
};

export default {
    renderer,
    tester,
};
