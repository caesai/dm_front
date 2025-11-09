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

    const sortedStories = useMemo(() => {
        return [...storiesBlocks].map((block, index) => {
            const isSeen = localStories.find((item: ILocalStory) => item.id === block.id)?.isSeen;
            return (
                <SwiperSlide style={{ width: '80px' }} key={block.id}>
                    <StoriesBlock
                        onClick={openStory}
                        index={index}
                        thumbnail={block.thumbnail}
                        name={block.name}
                        isSeen={isSeen}
                    />
                </SwiperSlide>
            );
        });
    }, [storiesBlocks, localStories, openStory]);

    return (
        <Swiper slidesPerView="auto" modules={[FreeMode]} freeMode={true} spaceBetween={10}>
            {sortedStories}
        </Swiper>
    );
};
