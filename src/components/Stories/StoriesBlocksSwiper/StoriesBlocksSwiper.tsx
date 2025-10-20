import React from 'react';
import { FreeMode } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import { StoriesBlock } from '@/components/Stories/StoriesBlocksSwiper/StoriesBlock.tsx';
import { IStoryBlock } from '@/types/stories.types.ts';
import { useAtom } from 'jotai/index';
import { localStoriesListAtom } from '@/atoms/localStoriesListAtom.ts';

interface IStoriesBlocksSwiperProps {
    storiesBlocks: IStoryBlock[];
    openStory: (index: number) => void;
}

export const StoriesBlocksSwiper: React.FC<IStoriesBlocksSwiperProps> = ({ storiesBlocks, openStory }) => {
    const [localStories] = useAtom(localStoriesListAtom);
    return (
        <Swiper
            slidesPerView="auto"
            modules={[FreeMode]}
            freeMode={true}
            spaceBetween={10}
        >
            {storiesBlocks
                .sort((a, b) => {
                    const aRef = localStories.find((item) => item.id === a.id);
                    const bRef = localStories.find((item) => item.id === b.id);
                    if (!aRef && !bRef) return 0;
                    if (bRef !== undefined) {
                        if (bRef.isSeen) {
                            return -1;
                        }
                    }
                    if (aRef !== undefined) {
                        if (aRef.isSeen) {
                            return 1;
                        }
                    }
                    return 0;
                })
                .map(({thumbnail, id }, index) => (
                    <SwiperSlide style={{width: '93px'}} key={index}>
                        <StoriesBlock onClick={openStory} index={index} thumbnail={thumbnail} isSeen={localStories.find((item) => item.id === id)?.isSeen} />
                    </SwiperSlide>
                ))
            }
        </Swiper>
    )
}
