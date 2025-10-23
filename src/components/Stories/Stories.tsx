import React, { useState, useCallback, useMemo } from 'react';
import { IStoryBlock } from '@/types/stories.types.ts';
import { StoriesSwiper } from '@/components/Stories/StoriesSwiper/StoriesSwiper.tsx';
import { StoriesBlocksSwiper } from '@/components/Stories/StoriesBlocksSwiper/StoriesBlocksSwiper.tsx';
import { useAtom } from 'jotai';
import { ILocalStory, localStoriesListAtom } from '@/atoms/localStoriesListAtom.ts';

interface IStoriesProps {
    storiesBlocks: IStoryBlock[];
}

export const Stories: React.FC<IStoriesProps> = ({ storiesBlocks }) => {
    const [localStories] = useAtom(localStoriesListAtom);
    const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);
    const [isPaused, setIsPaused] = useState(false);
    // Memoize the sorted story blocks.
    const sortedStoriesBlocks = useMemo(() => {
        return [...storiesBlocks].sort((a, b) => {
            const aRef = localStories.find((item: ILocalStory) => item.id === a.id);
            const bRef = localStories.find((item: ILocalStory) => item.id === b.id);
            if (aRef?.isSeen && !bRef?.isSeen) {
                return 1;
            }
            if (!aRef?.isSeen && bRef?.isSeen) {
                return -1;
            }
            return 0;
        });
    }, [storiesBlocks, localStories]);
    // Memoize the openStory and closeStory functions using useCallback.
    // This prevents these functions from being recreated on every render,
    // which can be a performance optimization, especially if they are passed
    // down to memoized child components.
    const openStory = useCallback((index: number) => {
        setActiveStoryIndex(index);
        setIsPaused(false);
    }, []);

    const closeStory = useCallback(() => {
        setActiveStoryIndex(null);
        setIsPaused(true);
    }, []);

    // Memoize the StoriesSwiper component's render using useMemo.
    // This ensures that the Swiper component and its children are only
    // rendered when activeStoryIndex actually changes.
    const renderStoriesSwiper = useMemo(() => {
        if (activeStoryIndex !== null) {
            return (
                <StoriesSwiper
                    storiesBlocks={sortedStoriesBlocks}
                    activeStoryIndex={activeStoryIndex}
                    onClose={closeStory}
                    isPaused={isPaused}
                />
            );
        }
        return null;
    }, [activeStoryIndex, sortedStoriesBlocks, closeStory]);

    return (
        <>
            {renderStoriesSwiper}
            <div>
                <StoriesBlocksSwiper storiesBlocks={sortedStoriesBlocks} openStory={openStory} />
            </div>
        </>
    );
};
