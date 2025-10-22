import React, { useState, useRef, useEffect } from "react";
import { IStory } from '@/types/stories.types.ts';
import Story from '@/components/Stories/Story/Story.tsx';
import { usePreLoader } from '@/components/Stories/usePreloader.ts';
import ProgressArray from '@/components/Stories/StoriesProgress/ProgressArray.tsx';
import useIsMounted from '@/components/Stories/useIsMounted.ts';
import css from '@/components/Stories/StoriesContainer/StoriesContainer.module.css';

type NumberOrString = number | string;

interface StoriesContainerProps {
    shouldWait: boolean;
    width?: NumberOrString;
    height?: NumberOrString;
    loop?: boolean;
    keyboardNavigation?: boolean;
    onAllStoriesEnd?: Function;
    onStoryStart: Function;
    onStoryEnd: Function;
    onPrevious?: Function;
    onNext?: Function;
    preventDefault?: boolean;
    preloadCount?: number;
    isPaused?: boolean;
    currentIndex?: number;
    stories: IStory[];
}

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
        preloadCount,
        stories,
        onStoryEnd,
        onStoryStart,
    }
    ) => {
    const [currentId, setCurrentId] = useState<number>(0);
    const [pause, setPause] = useState<boolean>(true);
    const [bufferAction, setBufferAction] = useState<boolean>(true);
    const [videoDuration, setVideoDuration] = useState<number>(0);
    const isMounted = useIsMounted();

    let mousedownId = useRef<any>();

    usePreLoader(stories, currentId, Number(preloadCount));

    useEffect(() => {
        if (typeof currentIndex === "number") {
            if (currentIndex >= 0 && currentIndex < stories.length) {
                setCurrentIdWrapper(() => currentIndex);
            } else {
                console.error(
                    "Index out of bounds. Current index was set to value more than the length of stories array.",
                    currentIndex
                );
            }
        }
    }, [currentIndex, stories.length]);

    useEffect(() => {
        if (typeof isPaused === "boolean") {
            setPause(isPaused);
        }
    }, [isPaused]);

    useEffect(() => {
        const isClient = typeof window !== "undefined" && window.document;
        if (
            isClient &&
            typeof keyboardNavigation === "boolean" &&
            keyboardNavigation
        ) {
            document.addEventListener("keydown", handleKeyDown);
            return () => {
                document.removeEventListener("keydown", handleKeyDown);
            };
        }
    }, [keyboardNavigation]);

    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "ArrowLeft") {
            previous();
        } else if (e.key === "ArrowRight") {
            next({ isSkippedByUser: true });
        }
    };

    const toggleState = (action: string, bufferAction?: boolean) => {
        setPause(action === "pause");
        setBufferAction(!!bufferAction);
    };

    const setCurrentIdWrapper = (callback: (arg0: number) => number) => {
        setCurrentId(callback);
        toggleState("pause", true);
    };

    const previous = () => {
        if (onPrevious != undefined) {
            onPrevious();
        }
        setCurrentIdWrapper((prev:number) => (prev > 0 ? Number(prev - 1) : Number(prev)));
    };

    const next = (options?: { isSkippedByUser?: boolean }) => {
        if (onNext != undefined && options?.isSkippedByUser && !shouldWait) {
            onNext();
        }
        // Check if component is mounted - for issue #130 (https://github.com/mohitk05/react-insta-stories/issues/130)
        if (isMounted()) {
            if (loop) {
                updateNextStoryIdForLoop();
            } else {
                updateNextStoryId();
            }
        }
    };

    const updateNextStoryIdForLoop = () => {
        setCurrentIdWrapper((prev: number) => {
            if (prev >= stories.length - 1) {
                onAllStoriesEnd && onAllStoriesEnd(currentId, stories);
            }
            return (prev + 1) % stories.length;
        });
    };

    const updateNextStoryId = () => {
        setCurrentIdWrapper((prev) => {
            if (prev < stories.length - 1) return prev + 1;
            onAllStoriesEnd && onAllStoriesEnd(currentId, stories);
            return prev;
        });
    };

    const debouncePause = (e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault();
        mousedownId.current = setTimeout(() => {
            toggleState("pause");
        }, 200);
    };

    const mouseUp =
        (type: string) => (e: React.MouseEvent | React.TouchEvent) => {
            e.preventDefault();
            mousedownId.current && clearTimeout(mousedownId.current);
            if (pause) {
                toggleState("play");
            } else {
                type === "next" ? next({ isSkippedByUser: true }) : previous();
            }
        };

    const getVideoDuration = (duration: number) => {
        setVideoDuration(duration * 1000);
    };

    return (
        <div
            className={css.container}
            style={{
                ...{ width, height },
            }}
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
            />
            {!preventDefault && (
                <div className={css.overlay}>
                    <div
                        style={{ width: "50%", zIndex: 9999 }}
                        onTouchStart={debouncePause}
                        onTouchEnd={mouseUp("previous")}
                        onMouseDown={debouncePause}
                        onMouseUp={mouseUp("previous")}
                    />
                    <div
                        style={{ width: "50%", zIndex: 9999 }}
                        onTouchStart={debouncePause}
                        onTouchEnd={mouseUp("next")}
                        onMouseDown={debouncePause}
                        onMouseUp={mouseUp("next")}
                    />
                </div>
            )}
        </div>
    );
}

export default StoriesContainer;
