import React, { useState, useCallback, useMemo } from 'react';
import { IStoryBlock } from '@/types/stories.types.ts';
import { StoriesSwiper } from '@/components/Stories/StoriesSwiper/StoriesSwiper.tsx';
import { StoriesBlocksSwiper } from '@/components/Stories/StoriesBlocksSwiper/StoriesBlocksSwiper.tsx';
import { useAtom } from 'jotai';
import { ILocalStory, localStoriesListAtom } from '@/atoms/localStoriesListAtom.ts';

interface IStoriesProps {
    storiesBlocks: IStoryBlock[] | null;
}

export const Stories: React.FC<IStoriesProps> = ({ storiesBlocks }) => {
    const [localStories] = useAtom(localStoriesListAtom);
    const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);
    const [isPaused, setIsPaused] = useState(false);
    // Мемоизируем отсортированные блоки историй
    const sortedStoriesBlocks = useMemo(() => {
        return [...storiesBlocks ?? [...Array(10)]].sort((a, b) => {
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
    // Мемоизируем функции openStory и closeStory using useCallback.
    // Это предотвращает пересоздание этих функций при каждом рендере,
    // что может быть оптимизацией производительности, особенно если они передаются
    // в мемоизированные дочерние компоненты.
    const openStory = useCallback((index: number) => {
        setActiveStoryIndex(index);
        setIsPaused(false);
    }, []);

    const closeStory = useCallback(() => {
        setActiveStoryIndex(null);
        setIsPaused(true);
    }, []);

    // Мемоизируем рендер StoriesSwiper компонента используя useMemo.
    // Это гарантирует, что Swiper компонент и его дочерние компоненты только
    // рендерятся, когда activeStoryIndex фактически изменяется.
    const renderStoriesSwiper = useMemo(() => {
        if (activeStoryIndex !== null && storiesBlocks && storiesBlocks.length > 0) {
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
    }, [activeStoryIndex, sortedStoriesBlocks, closeStory, storiesBlocks]);

    return (
        <>
            {storiesBlocks && renderStoriesSwiper}
            <div>
                <StoriesBlocksSwiper storiesBlocks={sortedStoriesBlocks} isLoading={!storiesBlocks} openStory={openStory} />
            </div>
        </>
    );
};
