import { NewsStoriesElement } from '@/components/NewsStories/NewsStoriesElement/NewsStoriesElement.tsx';

import css from './NewsStories.module.css';
import { FreeMode } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

export const NewsStories = () => {
    return (
        <div className={css.newsSlider}>
            <Swiper
                slidesPerView="auto"
                modules={[FreeMode]}
                freeMode={true}
                spaceBetween={0}
            >
                <SwiperSlide style={{ width: '100px' }}>
                    <NewsStoriesElement />
                </SwiperSlide>
                <SwiperSlide style={{ width: '100px' }}>
                    <NewsStoriesElement />
                </SwiperSlide>
                <SwiperSlide style={{ width: '100px' }}>
                    <NewsStoriesElement />
                </SwiperSlide>
                <SwiperSlide style={{ width: '100px' }}>
                    <NewsStoriesElement />
                </SwiperSlide>
                <SwiperSlide style={{ width: '100px' }}>
                    <NewsStoriesElement />
                </SwiperSlide>
                {/*
                    Пустой слайд для корректного отображения последнего слайда
                */}
                <SwiperSlide></SwiperSlide>
            </Swiper>
        </div>
    );
};
