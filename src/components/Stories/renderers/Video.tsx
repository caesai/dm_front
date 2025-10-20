import { useEffect, useRef, useState } from 'react';
import { Renderer, Tester } from '@/types/stories.types.ts';
import { Loader } from '@/components/AppLoadingScreen/AppLoadingScreen.tsx';
import WithHeader from '@/components/Stories/wrappers/WithHeader.tsx';
import WithSeeMore from '@/components/Stories/wrappers/WithSeeMore.tsx';
import css from '@/components/Stories/renderers/Video.module.css';

export const renderer: Renderer = (
    {
        story,
        action,
        isPaused,
        shouldWait,
        config,
        messageHandler,
    },
) => {
    const [loaded, setLoaded] = useState(false);
    const [muted, setMuted] = useState(story.muted || false);
    const { width, height, loader } = config;

    let vid = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (vid.current) {
            if (isPaused || shouldWait) {
                vid.current.pause();
            } else {
                vid.current.play().then();
            }
        }
    }, [isPaused, shouldWait]);

    const onWaiting = () => {
        action('pause', true);
    };

    const onPlaying = () => {
        action('play', true);
    };

    const videoLoaded = () => {
        if (vid.current) {
            messageHandler('UPDATE_VIDEO_DURATION', { duration: vid.current.duration });
            setLoaded(true);
            vid.current
                .play()
                .then(() => {
                    action('play');
                })
                .catch(() => {
                    setMuted(true);
                    vid.current?.play().finally(() => {
                        action('play');
                    });
                });
        }
    };

    return (
        <WithHeader {...{ story, globalHeader: config.header }}>
            <WithSeeMore {...{ story, action }}>
                <div className={css.videoContainer}>
                    <video
                        ref={vid}
                        className={css.storyContent}
                        src={story.url}
                        controls={false}
                        onLoadedData={videoLoaded}
                        playsInline
                        onWaiting={onWaiting}
                        onPlaying={onPlaying}
                        muted={muted}
                        autoPlay
                        webkit-playsinline="true"
                    />
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
        condition: story.type === 'video',
        priority: 2,
    };
};

export default {
    renderer,
    tester,
};
