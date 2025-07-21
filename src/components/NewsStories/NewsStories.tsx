import { NewsStoriesElement } from '@/components/NewsStories/NewsStoriesElement/NewsStoriesElement.tsx';

import css from './NewsStories.module.css';
import { FreeMode } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import {useState} from "react";
import StoriesContainer from "@/components/NewsStories/StoriesContainer/StoriesContainer.tsx";

export const NewsStories = () => {
    const [activeIndex, setActiveIndex] = useState<number>();
    const openStory = (index: number) => {
        setActiveIndex(index);
    }
    const closeStory = () => {
        setActiveIndex(undefined);
    }
    return (
        <>
            <StoriesContainer onClose={closeStory} activeIndex={activeIndex} />
            <div>
            <Swiper
                slidesPerView="auto"
                modules={[FreeMode]}
                freeMode={true}
                spaceBetween={10}
                wrapperClass={css.newsSlider}
            >
                <SwiperSlide style={{ width: '100px', }}>
                    <NewsStoriesElement onClick={openStory} index={0} />
                </SwiperSlide>
                <SwiperSlide style={{ width: '100px', }}>
                    <NewsStoriesElement onClick={openStory} index={1} />
                </SwiperSlide>
                <SwiperSlide style={{ width: '100px', }}>
                    <NewsStoriesElement onClick={openStory} index={2} />
                </SwiperSlide>
                <SwiperSlide style={{ width: '100px', }}>
                    <NewsStoriesElement onClick={openStory} index={3} />
                </SwiperSlide>
                <SwiperSlide style={{ width: '100px', }}>
                    <NewsStoriesElement onClick={openStory} index={4} />
                </SwiperSlide>
            </Swiper>
            </div>
        </>
    );
};
