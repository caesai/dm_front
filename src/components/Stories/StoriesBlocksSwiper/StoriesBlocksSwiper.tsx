import React, { useMemo } from 'react';
import { useAtom } from 'jotai';
import { FreeMode } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
// Types
import { IStoryBlock } from '@/types/stories.types.ts';
// Atoms
import { localStoriesListAtom } from '@/atoms/localStoriesListAtom.ts';
// Components
import { StoriesBlock } from '@/components/Stories/StoriesBlocksSwiper/StoriesBlock.tsx';

interface IStoriesBlocksSwiperProps {
    storiesBlocks: IStoryBlock[];
    openStory: (index: number) => void;
    isLoading?: boolean;
}

export const StoriesBlocksSwiper: React.FC<IStoriesBlocksSwiperProps> = ({ storiesBlocks, isLoading, openStory }) => {
    const [localStories] = useAtom(localStoriesListAtom);

    const sortedStories = useMemo(() => {
        return [...storiesBlocks].map((block, index) => {
            // TODO: Доделать сортировку по seen
            // const isSeen = localStories.find((item: ILocalStory) => item.id === block.id)?.isSeen;
            return (
                <SwiperSlide style={{ width: '80px' }} key={block?.id ?? index.toString()}>
                    <StoriesBlock
                        onClick={openStory}
                        index={index}
                        thumbnail={block?.thumbnail}
                        name={block?.name}
                        isLoading={isLoading}
                    />
                </SwiperSlide>
            );
        });
    }, [storiesBlocks, localStories, openStory, isLoading]);

    return (
        <Swiper slidesPerView="auto" modules={[FreeMode]} freeMode={true} spaceBetween={10}>
            {sortedStories}
        </Swiper>
    );
};
