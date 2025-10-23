import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { IStory } from '@/types/stories.types.ts';
import Progress from '@/components/Stories/StoriesProgress/Progress.tsx';
import css from '@/components/Stories/StoriesProgress/Progress.module.css';

const getPerformanceTimestamp = () => (window.performance?.now ? window.performance.now() : new Date().getTime());

interface ProgressArrayProps {
    shouldWait: boolean;
    currentId: number;
    videoDuration: number;
    bufferAction: boolean;
    pause: boolean;
    next: () => void; // Explicitly type the next function
    stories: IStory[];
    onStoryEnd: (currentId: number, story: IStory) => void; // Explicitly type callbacks
    onStoryStart: (currentId: number, story: IStory) => void;
}

const ProgressArray: React.FC<ProgressArrayProps> = (
    {
        shouldWait,
        currentId,
        next,
        videoDuration,
        pause,
        bufferAction,
        stories,
        onStoryEnd,
        // onStoryStart,
    },
) => {
    const [progress, setProgress] = useState<number>(0);
    const lastTimeRef = useRef<number>(0);
    const animationFrameIdRef = useRef<number>(0);

    // Reset progress when the current story changes.
    useEffect(() => {
        setProgress(0);
    }, [currentId]);

    // Handle the animation frame loop.
    const incrementProgress = useCallback(() => {
        const story = stories[currentId];

        if (!story) {
            next();
            return;
        }

        const interval = story.type === 'video' ? videoDuration : story.duration || 0;

        if (interval === 0) {
            // Avoid division by zero and handle instant story progression.
            // storyEndCallback();
            next();
            return;
        }

        if (lastTimeRef.current === 0) {
            lastTimeRef.current = getPerformanceTimestamp();
            // storyStartCallback();
        }

        const currentTime = getPerformanceTimestamp();
        const deltaTime = currentTime - lastTimeRef.current;
        lastTimeRef.current = currentTime;

        setProgress(prevProgress => {
            const newProgress = prevProgress + (deltaTime * 100) / interval;
            if (newProgress >= 100) {
                cancelAnimationFrame(animationFrameIdRef.current);
                storyEndCallback();
                next();
                return 100;
            }
            animationFrameIdRef.current = requestAnimationFrame(incrementProgress);
            return newProgress;
        });
    }, [stories, currentId, videoDuration, next]);

    // Effect for starting and stopping the animation loop.
    useEffect(() => {
        if (!pause && !shouldWait) {
            animationFrameIdRef.current = requestAnimationFrame(incrementProgress);
        } else {
            cancelAnimationFrame(animationFrameIdRef.current);
            lastTimeRef.current = 0; // Reset timer on pause
        }

        return () => {
            cancelAnimationFrame(animationFrameIdRef.current);
        };
    }, [currentId, pause, shouldWait, incrementProgress]);

    // Callback functions for story events.
    // const storyStartCallback = useCallback(() => {
    //     if (stories[currentId]) {
    //         onStoryStart(currentId, stories[currentId]);
    //     }
    // }, [onStoryStart, currentId, stories]);
    //
    const storyEndCallback = useCallback(() => {
        if (stories[currentId]) {
            onStoryEnd(currentId, stories[currentId]);
        }
    }, [onStoryEnd, currentId, stories]);

    // Memoize the rendered progress components for performance.
    const progressIndicators = useMemo(() => stories.map((_, i) => (
        <Progress
            key={i}
            count={progress}
            width={1 / stories.length}
            active={i === currentId ? 1 : i < currentId ? 2 : 0}
            pause={pause}
            bufferAction={bufferAction}
        />
    )), [stories, progress, currentId, pause, bufferAction]);

    return (
        <div
            className={css.progressArr}
            style={{
                opacity: pause && !bufferAction ? 0 : 1,
            }}
        >
            {progressIndicators}
        </div>
    );
};

export default ProgressArray;
