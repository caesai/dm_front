import {StoriesBlock} from '@/components/Stories/StoriesBlock/StoriesBlock.tsx';

import css from './NewsStories.module.css';
import {FreeMode} from 'swiper/modules';
import {Swiper, SwiperSlide} from 'swiper/react';
import {useEffect, useState} from "react";
import StoriesContainer from "@/components/Stories/StoriesContainer/StoriesContainer.tsx";
import {ApiGetStoriesBlocks} from "@/api/stories.ts";
import {IStoryBlock} from "@/types/stories.ts";
import {StoryComponent} from "@/components/Stories/StoryComponent/StoryComponent.tsx";

export const Stories = () => {
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const [storiesBlock, setStoriesBlock] = useState<IStoryBlock[]>([]);

    const openStory = (index: number) => {
        setActiveIndex(index);
    }
    const closeStory = () => {
        setActiveIndex(null);
    }
    useEffect(() => {
        // TODO: Endpoint to get array of stories objects sets state of stories
        ApiGetStoriesBlocks().then((storiesBlockResponse) => {
            const blocks = storiesBlockResponse().map((block) => {
                const convertedStories = block.stories.map((story) => {
                    const { description, title, url, type } = story;
                    if (type === 'component') {
                        const storyContainer = () => <StoryComponent img={url} title={title}
                                                                     description={description}/>;
                        return {
                            ...story,
                            component: storyContainer
                        }
                    }
                    return story;
                });
                return {
                    ...block,
                    stories: convertedStories,
                }
            })
            setStoriesBlock(blocks);
        });
    }, []);
    return (
        <>
            {activeIndex !== null && <StoriesContainer onClose={closeStory} stories={storiesBlock[Number(activeIndex)].stories}/>}
            <div>
                <Swiper
                    slidesPerView="auto"
                    modules={[FreeMode]}
                    freeMode={true}
                    spaceBetween={10}
                    wrapperClass={css.newsSlider}
                >
                    {storiesBlock.map(({thumbnail}, index) => (
                        <SwiperSlide style={{width: '100px',}}>
                            <StoriesBlock onClick={openStory} index={index} thumbnail={thumbnail}/>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
        </>
    );
};
