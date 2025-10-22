import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@/components/AppLoadingScreen/AppLoadingScreen.tsx';
import css from '@/components/Stories/StoriesComponents/Video.module.css';
import { IStory, Action } from '@/types/stories.types.ts';

interface VideoStoryComponentProps {
    story: IStory;
    action: Action;
    isPaused: boolean;
    shouldWait: boolean;
    width: number | string;
    height: number | string;
}

export const VideoStoryComponent: React.FC<VideoStoryComponentProps> = (
    {
        story,
        action,
        isPaused,
        shouldWait,
        width,
        height,
    },
) => {
    const [loaded, setLoaded] = useState(false);

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
        if (vid.current && !shouldWait) {
            setLoaded(true);
            vid.current
                .play()
                // .then(() => {
                //     action('play');
                // })
                .catch(() => {
                    vid.current?.play()
                        // .finally(() => {
                        //     action('play');
                        // });
                });
        }
    };

    return (
        <div className={css.videoContainer}>
            <video
                ref={vid}
                className={css.storyContent}
                src={String(story.url)}
                controls={false}
                onLoadedData={videoLoaded}
                playsInline
                onWaiting={onWaiting}
                onPlaying={onPlaying}
                // muted={muted}
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
                    <Loader />
                </div>
            )}
        </div>
    );
};
