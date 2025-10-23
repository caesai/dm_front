import React, { useMemo } from 'react';
import { FreeMode } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import { StoriesBlock } from '@/components/Stories/StoriesBlocksSwiper/StoriesBlock.tsx';
import { IStoryBlock } from '@/types/stories.types.ts';
import { useAtom } from 'jotai';
import { ILocalStory, localStoriesListAtom } from '@/atoms/localStoriesListAtom.ts';

interface IStoriesBlocksSwiperProps {
    storiesBlocks: IStoryBlock[];
    openStory: (index: number) => void;
}

export const StoriesBlocksSwiper: React.FC<IStoriesBlocksSwiperProps> = ({ storiesBlocks, openStory }) => {
    const [localStories] = useAtom(localStoriesListAtom);

    // Memoize the sorted and mapped story blocks for performance.
    // This prevents the sorting and mapping logic from running on every re-render,
    // only recalculating when `storiesBlocks` or `localStories` change.
    const sortedStories = useMemo(() => {
        const sorted = [...storiesBlocks].sort((a, b) => {
            const aRef = localStories.find((item: ILocalStory) => item.id === a.id);
            const bRef = localStories.find((item: ILocalStory) => item.id === b.id);

            // Prioritize stories that have not been seen
            if (aRef?.isSeen && !bRef?.isSeen) {
                return 1;
            }
            if (!aRef?.isSeen && bRef?.isSeen) {
                return -1;
            }
            // All stories seen or unseen, maintain original order
            return 0;
        });

        return sorted.map((block, index) => {
            const isSeen = localStories.find((item: ILocalStory) => item.id === block.id)?.isSeen;
            return (
                <SwiperSlide style={{ width: '93px' }} key={block.id}>
                    <StoriesBlock
                        onClick={openStory}
                        index={index}
                        thumbnail={block.thumbnail}
                        isSeen={isSeen}
                    />
                </SwiperSlide>
            );
        });
    }, [storiesBlocks, localStories, openStory]);

    return (
        <Swiper
            slidesPerView="auto"
            modules={[FreeMode]}
            freeMode={true}
            spaceBetween={10}
        >
            {sortedStories}
        </Swiper>
    );
};
