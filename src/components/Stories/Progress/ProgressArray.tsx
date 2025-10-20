import React, { useContext, useState, useEffect, useRef } from "react";
import { GlobalStoriesCtx, IStoryObject, ProgressCtx } from '@/types/stories.types.ts';
import ProgressContext from '@/components/Stories/context/ProgressContext.ts';
import GlobalStoriesContext from '@/components/Stories/context/GlobalStoriesContext.ts';
import StoriesContext from '@/components/Stories/context/StoriesContext.ts';
import Progress from '@/components/Stories/Progress/Progress.tsx';
import css from '@/components/Stories/Progress/Progress.module.css';

const timestamp = () => {
    return window.performance && window.performance.now
        ? window.performance.now()
        : new Date().getTime();
}

interface ProgressArrayProps {
    shouldWait: boolean;
}

const ProgressArray: React.FC<ProgressArrayProps> = ({ shouldWait }) => {
    const [count, setCount] = useState<number>(0);
    const lastTime = useRef<number>(0);
    const animationFrameId = useRef<number>(0);
    const countCopy = useRef<number>(0);

    const { currentId, next, videoDuration, pause, bufferAction } =
        useContext<ProgressCtx>(ProgressContext);
    const {
        onStoryEnd,
        onStoryStart,
        progressContainerStyles,
    } = useContext<GlobalStoriesCtx>(GlobalStoriesContext);
    const stories = useContext<IStoryObject[]>(StoriesContext);

    useEffect(() => {
        setCount(0);
    }, [currentId]);

    useEffect(() => {
        if (!pause && !shouldWait) {
            animationFrameId.current = requestAnimationFrame(incrementCount);
            lastTime.current = timestamp();
        }
        return () => {
            cancelAnimationFrame(Number(animationFrameId.current));
        };
    }, [currentId, pause, shouldWait]);

    const incrementCount = () => {
        if (countCopy.current === 0) storyStartCallback();
        if (lastTime.current == undefined) lastTime.current = timestamp();
        const t = timestamp();

        const dt = t - lastTime.current;
        lastTime.current = t;

        setCount((count: number) => {
            const interval = getCurrentInterval();
            countCopy.current = count + (dt * 100) / interval;
            return countCopy.current;
        });

        if (countCopy.current < 100) {
            animationFrameId.current = requestAnimationFrame(incrementCount);
        } else {
            storyEndCallback();
            cancelAnimationFrame(Number(animationFrameId.current));
            next();
        }
    };

    const storyStartCallback = () => {
        onStoryStart && onStoryStart(currentId, stories[currentId]);
    };

    const storyEndCallback = () => {
        onStoryEnd && onStoryEnd(currentId, stories[currentId]);
    };

    const getCurrentInterval = () => {
        if (stories[currentId]?.type === "video") return videoDuration;
        return stories[currentId]?.duration;
    };

    const opacityStyles = {
        opacity: pause && !bufferAction ? 0 : 1,
    };

    return (
        <div
            className={css.progressArr}
            style={{
                ...progressContainerStyles,
                ...opacityStyles
            }}
        >
            {stories.map((_, i) => (
                <Progress
                    key={i}
                    count={count}
                    width={1 / stories.length}
                    active={i === currentId ? 1 : i < currentId ? 2 : 0}
                />
            ))}
        </div>
    );
};

export default ProgressArray;
