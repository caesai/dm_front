import React from 'react';
import { FreeMode } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import { StoriesBlock } from '@/components/Stories/StoriesBlocksContainer/StoriesBlock.tsx';
import { IStoryBlock } from '@/types/stories.ts';

interface StoriesBlocksContainerProps {
    storiesBlocks: IStoryBlock[];
    openStory: (index: number) => void;
}

export const StoriesBlocksContainer: React.FC<StoriesBlocksContainerProps> = ({ storiesBlocks, openStory }) => {
    return (
        <Swiper
            slidesPerView="auto"
            modules={[FreeMode]}
            freeMode={true}
            spaceBetween={10}
        >
            {storiesBlocks.map(({thumbnail}, index) => (
                <SwiperSlide style={{width: '100px'}} key={index}>
                    <StoriesBlock onClick={openStory} index={index} thumbnail={thumbnail}/>
                </SwiperSlide>
            ))}
        </Swiper>
    )
}
