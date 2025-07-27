import React, { useState } from 'react';
import classnames from 'classnames';
import css from './StoriesContainer.module.css';
import Stories from 'stories-react';
import 'stories-react/dist/index.css';
import { CloseIcon } from '@/components/Icons/CloseIcon.tsx';
//TODO: Remove hardcoded logo
import { Swiper, SwiperSlide } from 'swiper/react';
import { IStoryBlock } from '@/types/stories.ts';
import { useAtom } from 'jotai';
import {
    // storyLocalAtomsAtom,
    storiesLocalCountAtom,
} from '@/atoms/storiesLocalAtom.ts';
import { IStoryObject } from 'stories-react/src/types';

interface StoriesContainerProps {
    storiesBlocks: IStoryBlock[];
    onClose: () => void;
    activeStoryIndex: number;
}

export const StoriesContainer: React.FC<StoriesContainerProps> = ({ storiesBlocks, onClose, activeStoryIndex }) => {
    const [,setActiveIndex] = useState(activeStoryIndex);
    return (
        <Swiper
            freeMode
            onTouchStart={(_swiper, event) => {
                event.preventDefault();
                event.stopPropagation();
                const el = event.target as HTMLElement;
                el.click();
            }}
            className={classnames(css.storiesSlider)}
            slidesPerView={'auto'}
            centeredSlides={true}
            onSlideNextTransitionStart={() => {
                console.log('next click');
            }}
            onSlidePrevTransitionStart={() => {
                console.log('prev click');
            }}
            initialSlide={activeStoryIndex}
            onRealIndexChange={(swiper) => {
                console.log('real index', swiper.activeIndex);
                setActiveIndex(swiper.activeIndex);
            }}
        >
            {storiesBlocks.map((block, index) => (
                <StorySlide
                    key={index}
                    storyId={block.id}
                    stories={block.stories}
                    onClose={onClose}
                />
            ))}
        </Swiper>
    );
};

interface StorySlideProps {
    // index: number;
    onClose: () => void;
    storyId: string;
    stories: IStoryObject[];
}

const StorySlide: React.FC<StorySlideProps> = ({ onClose, storyId, stories }) => {
    const [storiesLocalCount, setStoriesLocalCount] = useAtom(storiesLocalCountAtom);
    const storyLocalCount = storiesLocalCount.find((item) => item.id === storyId);

    return (
        <SwiperSlide className={css.slide}>
            <div className={classnames(css.stories_container)}>
                <span className={classnames(css.closeIcon)} onClick={onClose}>
                    <CloseIcon size={44} />
                </span>
                <Stories
                    width="100%"
                    height="100%"
                    onStoryChange={() => {
                        if (storyLocalCount && storyLocalCount.count !== stories.length) {
                            setStoriesLocalCount((prevItems) => {
                                const index = prevItems.findIndex(item => item.id === storyId);
                                if (index === -1) return prevItems; // Item not found
                                const updatedItem = { ...prevItems[index], count: prevItems[index].count + 1 };
                                return [
                                    ...prevItems.slice(0, index),
                                    updatedItem,
                                    ...prevItems.slice(index + 1)
                                ];
                            });
                        } else {
                            const newStoryLocalCount = {
                                id: storyId,
                                count: 1,
                            }
                            setStoriesLocalCount((prevItems) => [...prevItems, newStoryLocalCount]);
                        }
                    }}
                    stories={stories}
                    onAllStoriesEnd={onClose}
                    classNames={{ progressBar: css.progressBar, main: css.slide }}
                />
            </div>
        </SwiperSlide>
    );
};
