// VideoStoryComponent.tsx
import React, { useEffect, useRef, useState, useCallback } from 'react';
import css from '@/components/Stories/StoriesComponents/Video.module.css';
import { IStory, Action } from '@/types/stories.types.ts';
import { StoriesLoader } from '@/components/Stories/StoriesComponents/StoriesLoader.tsx';

interface VideoStoryComponentProps {
    story: IStory;
    action: Action;
    isPaused: boolean;
    shouldWait: boolean;
    width: number | string;
    height: number | string;
    getVideoDuration: Function;
    // playState and bufferAction are not used but included for completeness, they can be removed if not needed.
    // playState: boolean;
    // bufferAction: boolean;
}

export const VideoStoryComponent: React.FC<VideoStoryComponentProps> = (
    {
        story,
        action,
        isPaused,
        shouldWait,
        getVideoDuration,
    },
) => {
    const [isLoading, setIsLoading] = useState(true);
    const videoRef = useRef<HTMLVideoElement>(null);

    const handleWaiting = useCallback(() => {
        setIsLoading(true);
        action('pause', true);
    }, [action]);

    const handlePlaying = useCallback(() => {
        setIsLoading(false);
        action('play', false);
    }, [action]);

    const handleLoadedData = useCallback(() => {
        if (videoRef.current) {
            getVideoDuration(videoRef.current.duration * 1000); // Pass duration to parent
            if (!shouldWait) {
                videoRef.current.play().catch(error => {
                    console.error('Video play failed:', error);
                });
            }
        }
    }, [shouldWait, getVideoDuration]);

    useEffect(() => {
        const videoElement = videoRef.current;

        if (!videoElement) return;

        if (isPaused || shouldWait) {
            videoElement.pause();
        } else {
            videoElement.play().catch(error => {
                console.error('Video auto-play failed:', error);
            });
        }
    }, [isPaused, shouldWait]);

    return (
        <div className={css.videoContainer}>
            <video
                ref={videoRef}
                className={css.storyContent}
                src={String(story.url)}
                controls={false}
                onLoadedData={handleLoadedData}
                onWaiting={handleWaiting}
                onPlaying={handlePlaying}
                autoPlay
                playsInline
                muted // Muting for initial auto-play is a best practice
            />
            <StoriesLoader isLoading={isLoading} />
        </div>
    );
};
