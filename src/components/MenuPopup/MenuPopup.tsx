import Popup from 'reactjs-popup';
import {FC, useEffect, useRef, useState} from 'react';
import css from './MenuPopup.module.css';
import 'reactjs-popup/dist/index.css';
import 'swiper/css/thumbs';
import "swiper/css/zoom";
import { RoundedButton } from '@/components/RoundedButton/RoundedButton.tsx';
import { CrossIcon } from '@/components/Icons/CrossIcon.tsx';
import classNames from 'classnames';
import {type Swiper as SwiperRef} from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Thumbs, Zoom } from 'swiper/modules';
import styled from 'styled-components';
// import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch';

interface IFullScreenPopup {
    isOpen: boolean;
    setOpen: (x: boolean) => void;
    menuItems: string[];
}

const StyledPopup = styled(Popup)`
    &-overlay {
    }

    &-content {
        width: 100vw;
        height: 100vh;
        padding: 0;
    }
`;

export const MenuPopup: FC<IFullScreenPopup> = (p) => {
    const onClose = () => p.setOpen(false);
    const [menuItems] = useState<string[]>(p.menuItems);
    const [currentImage, setCurrentImage] = useState<string>(menuItems[0]);
    const thumbsSwiper = useRef<SwiperRef>();
    // hack to prevent from scrolling on page
    useEffect(() => {
        if (p.isOpen) {
            console.log('');
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'scroll';
        }
        return () => {
            document.body.style.overflow = 'scroll';
        };
    }, [p.isOpen]);

    // @ts-ignore
    return (
        <StyledPopup open={p.isOpen} onClose={onClose} position={'top center'}>
            <div className={css.popup}>
                <div className={css.content}>
                    <div className={css.header}>
                        <span className={css.headerTitle}>МЕНЮ</span>
                        <RoundedButton
                            icon={<CrossIcon size={44} color={'black'} />}
                            bgColor={'var(--primary-background) !important'}
                            action={() => onClose()}
                        />
                    </div>
                    <div className={css.swiper_container}>
                    {/*        <TransformWrapper initialScale={1}>*/}
                    {/*            <TransformComponent*/}
                    {/*                wrapperStyle={{*/}
                    {/*                    width: '100%',*/}
                    {/*                    height: '100%',*/}
                    {/*                }}*/}
                    {/*                contentStyle={{*/}
                    {/*                    width: '100%',*/}
                    {/*                    height: '100%',*/}
                    {/*                }}*/}
                    {/*            >*/}
                                    <Swiper
                                        slidesPerView={1}
                                        spaceBetween={5}
                                        zoom
                                        modules={[Thumbs, Zoom]}
                                        style={{ width: '100%' }}
                                        thumbs={{swiper: thumbsSwiper.current && !thumbsSwiper.current?.destroyed ? thumbsSwiper.current : null}}
                                    >
                                        {menuItems.map((slide, index) => {
                                            return (
                                                <SwiperSlide
                                                    zoom
                                                    key={index}
                                                >
                                                    <div className="swiper-zoom-container">
                                                        <img src={slide} alt={'slide'} />
                                                    </div>
                                                    {/*<div*/}
                                                    {/*    className={classNames(*/}
                                                    {/*        css.bgImage,*/}
                                                    {/*        css.currentImage*/}
                                                    {/*    ) + " swiper-zoom-target"}*/}
                                                    {/*    style={{*/}
                                                    {/*        backgroundImage: `url(${slide})`,*/}
                                                    {/*    }}*/}
                                                    {/*></div>*/}
                                                </SwiperSlide>
                                            )
                                        })}
                                    </Swiper>
                            {/*    </TransformComponent>*/}
                            {/*</TransformWrapper>*/}
                        </div>
                        <div className={css.imageSelector}>
                            <Swiper
                                zoom
                                slidesPerView="auto"
                                modules={[Thumbs]}
                                spaceBetween={5}
                                watchSlidesProgress
                                onSwiper={(swiper) => {
                                    if(thumbsSwiper) {
                                        thumbsSwiper.current = swiper;
                                    }
                                }}
                                // @ts-ignore
                                // onSwiper={setThumbsSwiper}
                            >
                                {menuItems.map((slide) => (
                                    <SwiperSlide
                                        style={{ width: '100px' }}
                                        key={slide}
                                        onClick={() => {
                                            setCurrentImage(slide);
                                        }}
                                    >
                                        <div
                                            className={classNames(
                                                css.bgImage,
                                                css.slideImage,
                                                css.slideImageCurrent
                                                    ? currentImage == slide
                                                    : null
                                            )}
                                            style={{
                                                backgroundImage: `url(${slide})`,
                                            }}
                                        ></div>
                                    </SwiperSlide>
                                ))}
                                <SwiperSlide
                                    style={{ width: '100px' }}
                                ></SwiperSlide>
                            </Swiper>
                        </div>
                    {/*</div>*/}
                </div>
            </div>
        </StyledPopup>
    );
};
