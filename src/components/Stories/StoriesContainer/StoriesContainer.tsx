// StoriesContainer.tsx
import React, { useState, useRef, useEffect, useCallback, useReducer, useMemo } from 'react';
import { IStory, StoriesAction } from '@/types/stories.types.ts';
import Story from '@/components/Stories/Story/Story.tsx';
import { usePreLoader } from '@/components/Stories/usePreloader.ts';
import ProgressArray from '@/components/Stories/StoriesProgress/ProgressArray.tsx';
import useIsMounted from '@/components/Stories/useIsMounted.ts';
import css from '@/components/Stories/StoriesContainer/StoriesContainer.module.css';
import { storiesReducer } from '@/components/Stories/storiesReducer/storiesReducer.ts';
// import { StoriesAction, storiesReducer } from './storiesReducer';

type NumberOrString = number | string;

interface StoriesContainerProps {
    shouldWait: boolean;
    width?: NumberOrString;
    height?: NumberOrString;
    loop?: boolean;
    keyboardNavigation?: boolean;
    onAllStoriesEnd?: (currentId: number, stories: IStory[]) => void;
    onStoryStart: (currentId: number, story: IStory) => void;
    onStoryEnd: (currentId: number, story: IStory) => void;
    onPrevious?: () => void;
    onNext?: () => void;
    preventDefault?: boolean;
    preloadCount?: number;
    isPaused?: boolean;
    currentIndex?: number;
    stories: IStory[];
}

// Reducer for managing play/pause and buffering state.
const playerStateReducer = (state: { pause: boolean; bufferAction: boolean }, action: {
    type: string;
    buffer?: boolean
}) => {
    switch (action.type) {
        case 'toggle_pause':
            return { ...state, pause: !state.pause };
        case 'set_pause':
            return { ...state, pause: true };
        case 'set_play':
            return { ...state, pause: false };
        case 'set_buffer':
            return { ...state, bufferAction: action.buffer ?? true };
        default:
            return state;
    }
};

const StoriesContainer: React.FC<StoriesContainerProps> = (
    {
        shouldWait,
        width,
        height,
        loop,
        currentIndex,
        isPaused,
        keyboardNavigation,
        preventDefault,
        onAllStoriesEnd,
        onPrevious,
        onNext,
        preloadCount = 3,
        stories,
        onStoryEnd,
        onStoryStart,
    },
) => {
    const [{ currentId }, dispatch] = useReducer(storiesReducer, { currentId: 0 });
    const [{ pause, bufferAction }, playerStateDispatch] = useReducer(playerStateReducer, {
        pause: true,
        bufferAction: true,
    });
    const [videoDuration, setVideoDuration] = useState<number>(0);
    const mousedownTimeoutRef = useRef<any>();
    const isMounted = useIsMounted();
    const [isLoading, setIsLoading] = useState(false); // Add isLoading state here

    // Custom hook for preloading logic.
    usePreLoader(stories, currentId, preloadCount);

    // Effect for handling external currentIndex prop changes.
    useEffect(() => {
        if (typeof currentIndex === 'number' && currentIndex >= 0 && currentIndex < stories.length) {
            dispatch({ type: StoriesAction.SetCurrentId, payload: currentIndex });
            playerStateDispatch({ type: 'set_pause', buffer: true });
        } else if (typeof currentIndex === 'number') {
            console.error(
                `Index out of bounds. Current index (${currentIndex}) was set to a value outside the range of stories array.`,
            );
        }
    }, [currentIndex, stories.length]);

    // Effect for handling external isPaused prop changes.
    useEffect(() => {
        if (typeof isPaused === 'boolean') {
            isPaused ? playerStateDispatch({ type: 'set_pause' }) : playerStateDispatch({ type: 'set_play' });
        }
    }, [isPaused]);

    // Action handlers using useCallback for performance.
    const toggleState = useCallback((action: 'pause' | 'play', bufferAction?: boolean) => {
        if (action === 'pause') {
            playerStateDispatch({ type: 'set_pause', buffer: !!bufferAction });
            if (bufferAction) {
                setIsLoading(true);
            }
        } else {
            playerStateDispatch({ type: 'set_play' });
            setIsLoading(false);
        }
    }, []);

    const previous = useCallback(() => {
        onPrevious?.();
        dispatch({ type: StoriesAction.Previous });
        playerStateDispatch({ type: 'set_pause', buffer: true });
    }, [onPrevious]);

    const next = useCallback(({ isSkippedByUser }: { isSkippedByUser?: boolean } = {}) => {
        if (isSkippedByUser && !shouldWait) {
            onNext?.();
        }
        if (!isMounted()) return;

        dispatch({ type: StoriesAction.Next, payload: { loop, storiesLength: stories.length } });
        playerStateDispatch({ type: 'set_pause', buffer: true });

        if (currentId >= stories.length - 1 && !loop) {
            onAllStoriesEnd?.(currentId, stories);
        }
    }, [isMounted, loop, stories, onAllStoriesEnd, shouldWait, onNext, currentId]);

    const debouncePause = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault();
        mousedownTimeoutRef.current = setTimeout(() => {
            playerStateDispatch({ type: 'set_pause' });
        }, 200);
    }, []);

    const mouseUp = useCallback(
        (type: 'next' | 'previous') => (e: React.MouseEvent | React.TouchEvent) => {
            e.preventDefault();
            clearTimeout(mousedownTimeoutRef.current);
            if (pause) {
                playerStateDispatch({ type: 'set_play' });
            } else {
                type === 'next' ? next({ isSkippedByUser: true }) : previous();
            }
        },
        [pause, next, previous],
    );

    const getVideoDuration = useCallback((duration: number) => {
        setVideoDuration(duration);
    }, []);

    const overlayHandlers = useMemo(() => ({
        onPrevious: {
            onTouchStart: debouncePause,
            onTouchEnd: mouseUp('previous'),
            onMouseDownCapture: debouncePause,
            onMouseUpCapture: mouseUp('previous'),
            onMouseUp: mouseUp('previous'),
        },
        onNext: {
            onTouchStart: debouncePause,
            onTouchEnd: mouseUp('next'),
            onMouseDownCapture: debouncePause,
            onMouseUpCapture: mouseUp('next'),
            onMouseUp: mouseUp('next'),
        },
    }), [debouncePause, mouseUp]);

    // Keyboard navigation effect.
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') previous();
            else if (e.key === 'ArrowRight') next({ isSkippedByUser: true });
        };
        if (typeof window !== 'undefined' && keyboardNavigation) {
            document.addEventListener('keydown', handleKeyDown);
            return () => document.removeEventListener('keydown', handleKeyDown);
        }
    }, [keyboardNavigation, previous, next]);

    return (
        <div
            className={css.container}
            style={{ width, height }}
        >
            <ProgressArray
                bufferAction={bufferAction}
                videoDuration={videoDuration}
                currentId={currentId}
                next={next}
                pause={pause}
                shouldWait={shouldWait}
                stories={stories}
                onStoryEnd={onStoryEnd}
                onStoryStart={onStoryStart}
            />
            <Story
                action={toggleState}
                bufferAction={bufferAction}
                playState={pause}
                shouldWait={shouldWait}
                story={stories[currentId]}
                getVideoDuration={getVideoDuration}
                isPaused={pause}
                width={'100%'}
                height={'100%'}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
            />
            {!preventDefault && (
                <div className={css.overlay}>
                    <div style={{ width: '50%', zIndex: 9999 }} {...overlayHandlers.onPrevious} />
                    <div style={{ width: '50%', zIndex: 9999 }} {...overlayHandlers.onNext} />
                </div>
            )}
        </div>
    );
};

export default StoriesContainer;

