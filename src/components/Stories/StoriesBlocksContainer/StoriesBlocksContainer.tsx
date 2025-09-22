import React from 'react';
import { FreeMode } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import { StoriesBlock } from '@/components/Stories/StoriesBlocksContainer/StoriesBlock.tsx';
import { IStoryBlock } from '@/types/stories.ts';
import { useAtom } from 'jotai/index';
import { localStoriesListAtom } from '@/atoms/localStoriesListAtom.ts';

interface IStoriesBlocksContainerProps {
    storiesBlocks: IStoryBlock[];
    openStory: (index: number) => void;
}

export const StoriesBlocksContainer: React.FC<IStoriesBlocksContainerProps> = ({ storiesBlocks, openStory }) => {
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
                    <SwiperSlide style={{width: '100px'}} key={index}>
                        <StoriesBlock onClick={openStory} index={index} thumbnail={thumbnail} isSeen={localStories.find((item) => item.id === id)?.isSeen} />
                    </SwiperSlide>
                ))
            }
        </Swiper>
    )
}
