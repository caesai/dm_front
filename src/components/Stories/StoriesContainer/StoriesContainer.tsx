import React, { useRef, useState } from 'react';
import classnames from 'classnames';
import css from './StoriesContainer.module.css';
import Stories from 'stories-react';
import 'stories-react/dist/index.css';
import { CloseIcon } from '@/components/Icons/CloseIcon.tsx';
//TODO: Remove hardcoded logo
import { Swiper, SwiperSlide } from 'swiper/react';
import { IStoryBlock } from '@/types/stories.ts';
import { useAtom } from 'jotai';
import { storiesLocalCountAtom } from '@/atoms/storiesLocalAtom.ts';
import { IStoryObject } from 'stories-react/src/types';
import type { Swiper as SwiperClass } from 'swiper';

interface StoriesContainerProps {
    storiesBlocks: IStoryBlock[];
    onClose: () => void;
    activeStoryIndex: number;
}

export const StoriesContainer: React.FC<StoriesContainerProps> = ({ storiesBlocks, onClose, activeStoryIndex }) => {
    const [realSwiperIndex, setRealSwiperIndex] = useState(activeStoryIndex);
    const swiperRef = useRef<SwiperClass | null>(null);
    const onTouchStart = (_swiper: SwiperClass, event: MouseEvent | TouchEvent | PointerEvent) => {
        try {
            event.preventDefault();
            event.stopPropagation();
            console.log('onTouchStart: ', event.target);
            const el = event.target as HTMLElement;
            el.click();
        } catch (error) {
            console.log(error);
        }
    };
    const onRealIndexChange = (swiper: SwiperClass) => {
        setRealSwiperIndex(swiper.activeIndex);
    };
    const onSwiper = (swiper: SwiperClass) => {
        if (!swiperRef.current) {
            swiperRef.current = swiper;
        }
    };
    const onAllStoriesEnd = () => {
        if (realSwiperIndex < storiesBlocks[realSwiperIndex].stories.length) {
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
            onTouchStart={onTouchStart}
            className={classnames(css.storiesSlider)}
            slidesPerView={'auto'}
            centeredSlides={true}
            initialSlide={activeStoryIndex}
            onRealIndexChange={onRealIndexChange}
        >
            {storiesBlocks.map((block, index) => (
                <SwiperSlide className={css.slide} key={index}>
                    <StorySlide
                        storyId={block.id}
                        shouldRender={Number(realSwiperIndex) === Number(index)}
                        stories={block.stories}
                        onAllStoriesEnd={onAllStoriesEnd}
                        onClose={onClose}
                    />
                </SwiperSlide>
            ))}
        </Swiper>
    );
};

interface StorySlideProps {
    // index: number;
    onAllStoriesEnd: () => void;
    onClose: () => void;
    storyId: string;
    stories: IStoryObject[];
    shouldRender: boolean;
}

const StorySlide: React.FC<StorySlideProps> = ({ onAllStoriesEnd, storyId, stories, onClose, shouldRender }) => {
    const [storiesLocalCount, setStoriesLocalCount] = useAtom(storiesLocalCountAtom);
    const storyLocalCount = storiesLocalCount.find((item) => item.id === storyId);
    const onStoryChange = (index: number) => {
        if (storyLocalCount && storyLocalCount.count !== index && storyLocalCount.count !== stories.length) {
            setStoriesLocalCount((prevItems) => {
                const index = prevItems.findIndex(item => item.id === storyId);
                if (index === -1) return prevItems; // Item not found
                const updatedItem = {
                    ...prevItems[index],
                    count: prevItems[index].count + 1,
                    isSeen: prevItems[index].count + 1 === stories.length - 1,
                };
                return [
                    ...prevItems.slice(0, index),
                    updatedItem,
                    ...prevItems.slice(index + 1),
                ];
            });
        } else {
            const newStoryLocalCount = {
                id: storyId,
                count: 0,
                isSeen: false,
            };
            setStoriesLocalCount((prevItems) => [...prevItems, newStoryLocalCount]);
        }
    };
    return (
        <div className={classnames(css.stories_container)}>
            <span className={classnames(css.closeIcon)} onClick={onClose}>
                <CloseIcon size={44} />
            </span>
            {shouldRender && (
                <Stories
                    width="100%"
                    height="100%"
                    onStoryChange={onStoryChange}
                    stories={stories}
                    onAllStoriesEnd={onAllStoriesEnd}
                    classNames={{ progressBar: css.progressBar, main: css.slide }}
                />
            )}
        </div>
    );
};
