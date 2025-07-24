import {NewsStoriesElement} from '@/components/NewsStories/NewsStoriesElement/NewsStoriesElement.tsx';

import css from './NewsStories.module.css';
import {FreeMode} from 'swiper/modules';
import {Swiper, SwiperSlide} from 'swiper/react';
import {useEffect, useState} from "react";
import StoriesContainer from "@/components/NewsStories/StoriesContainer/StoriesContainer.tsx";
import {ApiGetStoriesBlocks} from "@/api/stories.ts";
import {IStoryGroup} from "@/types/stories.ts";
import {StoryComponent} from "@/components/NewsStories/StoryComponent/StoryComponent.tsx";

export const NewsStories = () => {
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const [storiesGroup, setStoriesGroup] = useState<IStoryGroup[]>([]);

    const openStory = (index: number) => {
        setActiveIndex(index);
    }
    const closeStory = () => {
        setActiveIndex(null);
    }
    useEffect(() => {
        // TODO: Endpoint to get array of stories objects sets state of stories
        ApiGetStoriesBlocks().then((storiesResponse) => {
            const group = storiesResponse().map((story) => {
                const convertedStories = story.stories.map(({ description, title, url }) => {
                    const storyContainer = () => <StoryComponent img={url} title={title} description={description}/>;
                    return {
                        type: 'component',
                        duration: 5000,
                        url: '',
                        component: storyContainer
                    }
                })
                return {
                    ...story,
                    stories: convertedStories,
                }
            })
            setStoriesGroup(group);
        });
    }, []);
    return (
        <>
            {activeIndex !== null && <StoriesContainer onClose={closeStory} stories={storiesGroup[Number(activeIndex)].stories}/>}
            <div>
                <Swiper
                    slidesPerView="auto"
                    modules={[FreeMode]}
                    freeMode={true}
                    spaceBetween={10}
                    wrapperClass={css.newsSlider}
                >
                    {storiesGroup.map(({thumbnail}, index) => (
                        <SwiperSlide style={{width: '100px',}}>
                            <NewsStoriesElement onClick={openStory} index={index} thumbnail={thumbnail}/>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
        </>
    );
};
