import React from 'react';
import { FreeMode } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import { StoriesBlock } from '@/components/Stories/StoriesBlocksContainer/StoriesBlock.tsx';
import { IStoryBlock } from '@/types/stories.ts';
import { useAtom } from 'jotai/index';
import { storiesLocalCountAtom } from '@/atoms/storiesLocalAtom.ts';

interface StoriesBlocksContainerProps {
    storiesBlocks: IStoryBlock[];
    openStory: (index: number) => void;
}

export const StoriesBlocksContainer: React.FC<StoriesBlocksContainerProps> = ({ storiesBlocks, openStory }) => {
    const [storiesLocalCount] = useAtom(storiesLocalCountAtom);

    return (
        <Swiper
            slidesPerView="auto"
            modules={[FreeMode]}
            freeMode={true}
            spaceBetween={10}
        >
            {storiesBlocks.sort((a, b) => {
                const aRef = storiesLocalCount.find((item) => item.id === a.id);
                const bRef = storiesLocalCount.find((item) => item.id === b.id);
                if (!aRef && !bRef) return 0;
                console.log('bRef.count: ', aRef);

                if (bRef !== undefined) {
                    console.log('bbb: ', bRef.count, b.stories.length);
                    if (bRef.count === b.stories.length) {
                        return -1;
                    }
                }
                return 0;
            }).map(({thumbnail}, index) => (
                <SwiperSlide style={{width: '100px'}} key={index}>
                    <StoriesBlock onClick={openStory} index={index} thumbnail={thumbnail}/>
                </SwiperSlide>
            ))}
        </Swiper>
    )
}
