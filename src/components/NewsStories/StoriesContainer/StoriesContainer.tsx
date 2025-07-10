import React, {useEffect, useRef, useState} from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import classnames from "classnames";
import css from "./StoriesContainer.module.css";
import "swiper/css";
import {StageOne} from "@/pages/OnboardingPage/stages/StageOne.tsx";
import {StageTwo} from "@/pages/OnboardingPage/stages/StageTwo.tsx";
import {StageThree} from "@/pages/OnboardingPage/stages/StageThree.tsx";
// import {StageFour} from "@/pages/OnboardingPage/stages/StageFour.tsx";
import {StageFive} from "@/pages/OnboardingPage/stages/StageFive.tsx";
import {CloseIcon} from "@/components/Icons/CloseIcon.tsx";

interface StoriesContainerInterface {
    activeIndex: number | undefined;
    onClose: () => void;
}

const StoriesContainer: React.FC<StoriesContainerInterface> = ({ onClose, activeIndex }) => {
    const progressBar = useRef<HTMLDivElement>(null);
    const onAutoplayTimeLeft = (_s: any, _time: number, progress: number) => {
        progressBar.current && progressBar.current.style.setProperty("--progress", String(1 - progress));
    };

    const testArray = [
        { name: "1 slide" },
        { name: "2 slide" },
        { name: "3 slide" },
        { name: "4 slide" },
        // { name: "5 slide" },
    ];

    const [sliderId, setSliderId] = useState(1);
    console.log(sliderId);
    useEffect(() => {
        if (activeIndex === undefined) {
            setSliderId(1);
        }
    }, [activeIndex]);
    if (activeIndex === undefined) {
        return null
    }
    return (
        <>
            <Swiper
                onTap={(swiper) => {
                    swiper.slideNext(0);
                    setSliderId(sliderId + 1);
                }}
                allowTouchMove
                style={{ width: "100%", position: "fixed", zIndex: 10000, top: 0, left: 0, height: "100vh" }}
                slidesPerView={"auto"}
                centeredSlides={true}
                autoplay={{
                    delay: 4000,
                    disableOnInteraction: false,
                }}
                modules={[Autoplay]}
                onAutoplayTimeLeft={onAutoplayTimeLeft}
                onReachBeginning={() => setSliderId(1)}
                onSlideNextTransitionStart={() => {
                    console.log("next click", );
                    setSliderId(sliderId + 1);
                }}
                onSlidePrevTransitionStart={() => {
                    console.log("prev click");
                    setSliderId(sliderId !== 1 ? sliderId - 1 : 1);
                }}
            >
                <span className={css.closeIcon} onClick={onClose}>
                    <CloseIcon size={44}/>
                </span>
                {/*{testArray.map((item, index) => (*/}
                {/*    <SwiperSlide className={css.slide} key={index}>{item.name}</SwiperSlide>*/}
                {/*))}*/}
                <SwiperSlide className={css.slide}>
                    <StageOne isStory/>
                </SwiperSlide>
                <SwiperSlide className={css.slide}>
                    <StageTwo isStory/>
                </SwiperSlide>
                <SwiperSlide className={css.slide}>
                    <StageThree isStory/>
                </SwiperSlide>
                {/*<SwiperSlide className={css.slide}>*/}
                {/*    <StageFour isStory/>*/}
                {/*</SwiperSlide>*/}
                <SwiperSlide className={css.slide}>
                    <StageFive isStory/>
                </SwiperSlide>
                <div className={css.progressCont} ref={progressBar}>
                    {testArray.map((_item, idx) => (
                        <div
                            key={idx}
                            className={classnames(
                                css.bar,
                                idx + 1 === sliderId && css.progress,
                                idx + 1 < sliderId && css.active,
                            )}
                        ></div>
                    ))}
                </div>
            </Swiper>
        </>
    );
}

export default StoriesContainer;
