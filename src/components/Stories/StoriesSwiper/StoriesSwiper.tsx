import React, { useRef, useState } from 'react';
import classnames from 'classnames';
import css from '@/components/Stories/StoriesSwiper/StoriesSwiper.module.css';
import { CloseIcon } from '@/components/Icons/CloseIcon.tsx';
import { Swiper, SwiperSlide } from 'swiper/react';
import { IStoryBlock, IStoryObject, Renderer, Tester } from '@/types/stories.types.ts';
import { useAtom } from 'jotai';
import { localStoriesListAtom } from '@/atoms/localStoriesListAtom.ts';
import type { Swiper as SwiperClass } from 'swiper';
import GlobalStoriesContext from '@/components/Stories/context/GlobalStoriesContext.ts';
import StoriesContext from '@/components/Stories/context/StoriesContext.ts';
import StoriesContainer from '@/components/Stories/StoriesContainer/StoriesContainer.tsx';
import { renderers as defaultRenderers } from '@/components/Stories/renderers/index';
import moment from 'moment';

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
            // onTouchStart={onTouchStart}
            className={classnames(css.storiesSlider)}
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

interface StorySlideProps {
    onAllStoriesEnd: () => void;
    onClose: () => void;
    storyId: number;
    stories: IStoryObject[];
    shouldWait: boolean;
}

const StorySlide: React.FC<StorySlideProps> = (
    {
        onAllStoriesEnd,
        storyId,
        stories,
        onClose,
        shouldWait,
    },
) => {
    const [localStories, setLocalStories] = useAtom(localStoriesListAtom);
    const localStory = localStories.find((item) => item.id === storyId);

    const handleStoryEnd = () => {
        setLocalStories((prevItems) => {
            const localIndex = prevItems.findIndex(item => item.id === storyId);
            if (localIndex === -1) return prevItems; // Item not found

            const isStorySeen = localStory?.isSeen;
            const updatedItem = {
                ...prevItems[localIndex],
                index: 0,
                isSeen: !isStorySeen,
                lastSeenDate: isStorySeen ? prevItems[localIndex].lastSeenDate : moment().format('YYYY-MM-DD'),
            };

            return [
                ...prevItems.slice(0, localIndex),
                updatedItem,
                ...prevItems.slice(localIndex + 1),
            ];
        });

        onAllStoriesEnd();
    };


    const onStoryChange = (index: number) => {
        if (localStory) {
            updateExistingStory(index);
        } else {
            addNewStory(index);
        }
    };

    const updateExistingStory = (index: number) => {
        if (localStory && localStory.index <= stories.length - 1) {
            setLocalStories((prevItems) => {
                const localIndex = prevItems.findIndex(item => item.id === storyId);
                if (localIndex === -1) return prevItems; // Item not found

                const updatedItem = {
                    ...prevItems[localIndex],
                    index,
                };

                return [
                    ...prevItems.slice(0, localIndex),
                    updatedItem,
                    ...prevItems.slice(localIndex + 1),
                ];
            });
        }
    };

    const addNewStory = (index: number) => {
        const newStoryLocalCount = {
            id: storyId,
            index,
            isSeen: false,
            lastSeenDate: moment().format('YYYY-MM-DD'),
        };
        setLocalStories((prevItems) => [...prevItems, newStoryLocalCount]);
    };

    const context = {
        width: '100%',
        height: '100%',
        preloadCount: 0,
        // shouldWait,
        onStoryEnd: onStoryChange,
        onAllStoriesEnd: handleStoryEnd,
        currentIndex: localStory !== undefined ? localStory.index : undefined,
        // css.progressBar, main: css.slide
    };

    return (
        <div className={classnames(css.stories_container)}>
            <span className={classnames(css.closeIcon)} onClick={onClose}>
                <CloseIcon size={44} color={'red'} />
            </span>
            <GlobalStoriesContext.Provider value={context}>
                <StoriesContext.Provider value={generateStories(stories, defaultRenderers)}>
                    <StoriesContainer shouldWait={shouldWait} />
                </StoriesContext.Provider>
            </GlobalStoriesContext.Provider>
        </div>
    );
};

const generateStories = (stories: IStoryObject[], renderers: { renderer: Renderer, tester: Tester }[]) => {
    return stories.map(s => {
        let story: IStoryObject = {
            ...s,
            content: () => <></>,
            originalContent: () => <></>,
            seeMoreCollapsed: () => <></>,
        };

        let renderer = getRenderer(Object.assign(story, s), renderers);
        story.originalContent = story.content;
        story.content = renderer;
        return story;
    });
};

const getRenderer = (story: IStoryObject, renderers: { renderer: Renderer, tester: Tester }[]): Renderer => {
    let probable = renderers.map(r => {
        return {
            ...r,
            testerResult: r.tester(story),
        };
    }).filter(r => r.testerResult.condition);
    probable.sort((a, b) => b.testerResult.priority - a.testerResult.priority);
    return probable[0].renderer;
};
