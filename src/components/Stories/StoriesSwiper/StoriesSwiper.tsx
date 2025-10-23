import React, { useRef, useState, useCallback, useMemo } from 'react';
import css from '@/components/Stories/StoriesSwiper/StoriesSwiper.module.css';
import { Swiper, SwiperSlide } from 'swiper/react';
import { IStoryBlock } from '@/types/stories.types.ts';
import type { Swiper as SwiperClass } from 'swiper';
import { StorySlide } from '@/components/Stories/StoriesSwiper/StoriesSlide.tsx';

interface StoriesSwiperProps {
    storiesBlocks: IStoryBlock[];
    onClose: () => void;
    activeStoryIndex: number;
    isPaused: boolean;
}

export const StoriesSwiper: React.FC<StoriesSwiperProps> = ({ storiesBlocks, onClose, activeStoryIndex, isPaused }) => {
    const [realSwiperIndex, setRealSwiperIndex] = useState(activeStoryIndex);
    const swiperRef = useRef<SwiperClass | null>(null);

    // Use useCallback to memoize event handlers for performance.
    const onSwiper = useCallback((swiper: SwiperClass) => {
        swiperRef.current = swiper;
    }, []);

    const onRealIndexChange = useCallback((swiper: SwiperClass) => {
        setRealSwiperIndex(swiper.activeIndex);
    }, []);

    const handleAllStoriesEnd = useCallback(() => {
        if (realSwiperIndex < storiesBlocks.length - 1) {
            swiperRef.current?.slideNext();
        } else {
            onClose();
        }
    }, [realSwiperIndex, storiesBlocks.length, onClose]);

    // Memoize the slides to prevent re-rendering when the component's parent re-renders.
    const renderedSlides = useMemo(() => {
        return storiesBlocks.map((block, index) => (
            <SwiperSlide className={css.slide} key={block.id}>
                <StorySlide
                    storyId={block.id}
                    shouldWait={realSwiperIndex !== index}
                    stories={block.stories}
                    onAllStoriesEnd={handleAllStoriesEnd}
                    onClose={onClose}
                    isPaused={isPaused}
                />
            </SwiperSlide>
        ));
    }, [storiesBlocks, realSwiperIndex, handleAllStoriesEnd, onClose]);

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
            {renderedSlides}
        </Swiper>
    );
};
