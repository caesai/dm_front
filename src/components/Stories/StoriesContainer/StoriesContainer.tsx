import React, { useState } from 'react';
import classnames from 'classnames';
import css from './StoriesContainer.module.css';
import Stories from 'stories-react';
import 'stories-react/dist/index.css';
import { CloseIcon } from '@/components/Icons/CloseIcon.tsx';
//TODO: Remove hardcoded logo
import logoNew from '/img/DT_concierge_logo_1.png';
import { Swiper, SwiperSlide } from 'swiper/react';
import { IStoryBlock } from '@/types/stories.ts';

interface StoriesContainerProps {
    storiesBlocks: IStoryBlock[];
    onClose: () => void;
    activeStoryIndex: number;
}

export const StoriesContainer: React.FC<StoriesContainerProps> = ({ storiesBlocks, onClose, activeStoryIndex }) => {
    const [activeIndex, setActiveIndex] = useState(activeStoryIndex);
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
                <SwiperSlide className={css.slide} key={index}>
                    <div className={classnames(css.stories_container)}>
                        <span className={classnames(css.closeIcon)} onClick={onClose}>
                            <CloseIcon size={44} />
                        </span>
                        <div className={classnames(css.logo_container)}>
                            <img
                                className={classnames(css.logo)}
                                src={logoNew}
                                alt="DreamTeam logo"
                            />
                        </div>
                        <Stories
                            pauseStoryWhenInActiveWindow={activeIndex !== index}
                            width="100%"
                            height="100%"
                            stories={block.stories}
                            onAllStoriesEnd={onClose}
                            classNames={{ progressBar: css.progressBar, main: css.slide }}
                        />
                    </div>
                </SwiperSlide>
            ))}
        </Swiper>
    );
};
