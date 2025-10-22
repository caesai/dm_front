import React, { useRef, useState } from 'react';
import css from '@/components/Stories/StoriesSwiper/StoriesSwiper.module.css';
import { Swiper, SwiperSlide } from 'swiper/react';
import { IStoryBlock } from '@/types/stories.types.ts';
import type { Swiper as SwiperClass } from 'swiper';
import { StorySlide } from '@/components/Stories/StoriesSwiper/StoriesSlide.tsx';

interface StoriesSwiperProps {
    storiesBlocks: IStoryBlock[];
    onClose: () => void;
    activeStoryIndex: number;
}

export const StoriesSwiper: React.FC<StoriesSwiperProps> = ({ storiesBlocks, onClose, activeStoryIndex }) => {
    const [realSwiperIndex, setRealSwiperIndex] = useState(activeStoryIndex);
    const swiperRef = useRef<SwiperClass | null>(null);

    const onRealIndexChange = (swiper: SwiperClass) => {
        setRealSwiperIndex(swiper.activeIndex);
    };

    const onSwiper = (swiper: SwiperClass) => {
        if (!swiperRef.current) {
            swiperRef.current = swiper;
        }
    };

    const onAllStoriesEnd = () => {
        if (realSwiperIndex < storiesBlocks.length - 1) {
            if (swiperRef.current) {
                swiperRef.current.slideNext();
            }
        } else {
            onClose();
        }
    };

    return (
        <Swiper
            freeMode
            onSwiper={onSwiper}
            className={css.storiesSlider}
            slidesPerView={'auto'}
            centeredSlides={true}
            initialSlide={activeStoryIndex}
            onRealIndexChange={onRealIndexChange}
        >
            {storiesBlocks.map((block, index) => {
                return (
                    <SwiperSlide className={css.slide} key={index}>
                        <StorySlide
                            storyId={block.id}
                            shouldWait={Number(realSwiperIndex) !== Number(index)}
                            stories={block.stories}
                            onAllStoriesEnd={onAllStoriesEnd}
                            onClose={onClose}
                        />
                    </SwiperSlide>
                );
            })}
        </Swiper>
    );
};
