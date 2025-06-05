import {FC, useEffect, useState} from 'react';
import css from './RestaurantNavigation.module.css';
import AnchorLink from 'react-anchor-link-smooth-scroll';
import classNames from 'classnames';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode } from 'swiper/modules';

export const RestaurantNavigation: FC = () => {
    const [hash, setHash] = useState<string | null>(null);
    useEffect(() => {
        const handleScroll = () => {
            const elements = ['booking', 'gallery', 'menu', 'about', 'chef', 'events'].map((id) => document.getElementById(id));
            elements.forEach((element) => {
                if (element && (element.offsetTop - window.scrollY < window.innerHeight / 2) ) {
                    setHash(element.id);
                }
            })
        }
        document.addEventListener('scroll', handleScroll);
        return () => {
            document.removeEventListener('scroll', handleScroll);
        }
    });

    return (
        <div className={css.navigationSlider}>
            <Swiper
                modules={[FreeMode]}
                freeMode={true}
                slidesPerView={'auto'}
                spaceBetween={8}
            >
                <SwiperSlide style={{ width: 'fit-content' }}>
                    <AnchorLink href="#booking" offset={64} onClick={() => document.documentElement.scrollIntoView({ behavior: "smooth" })}>
                        <div
                            className={classNames(
                                css.navigationLink,
                                hash === 'booking' ? css.navigationLinkActive : ''
                            )}
                        >
                            Бронь
                        </div>
                    </AnchorLink>
                </SwiperSlide>
                <SwiperSlide style={{ width: 'fit-content' }}>
                    <AnchorLink href="#gallery" offset={128}>
                        <div className={classNames(
                            css.navigationLink,
                            hash === 'gallery' ? css.navigationLinkActive : ''
                        )}>Галерея</div>
                    </AnchorLink>
                </SwiperSlide>
                <SwiperSlide style={{ width: 'fit-content' }}>
                    <AnchorLink href="#menu" offset={128}>
                        <div className={classNames(
                            css.navigationLink,
                            hash === 'menu' ? css.navigationLinkActive : ''
                        )}>Меню</div>
                    </AnchorLink>
                </SwiperSlide>
                <SwiperSlide style={{ width: 'fit-content' }}>
                    <AnchorLink href="#about" offset={128}>
                        <div className={classNames(
                            css.navigationLink,
                            hash === 'about' ? css.navigationLinkActive : ''
                        )}>О месте</div>
                    </AnchorLink>
                </SwiperSlide>
                <SwiperSlide style={{ width: 'fit-content' }}>
                    <AnchorLink href="#chef" offset={128}>
                        <div className={classNames(
                            css.navigationLink,
                            hash === 'chef' ? css.navigationLinkActive : ''
                        )}>О шефе</div>
                    </AnchorLink>
                </SwiperSlide>
                {/*<SwiperSlide style={{ width: 'fit-content' }}>*/}
                {/*    <AnchorLink href="#events" offset={128}>*/}
                {/*        <div className={classNames(*/}
                {/*            css.navigationLink,*/}
                {/*            hash === 'events' ? css.navigationLinkActive : ''*/}
                {/*        )}>Мероприятия</div>*/}
                {/*    </AnchorLink>*/}
                {/*</SwiperSlide>*/}
                <SwiperSlide style={{ width: '48px' }}></SwiperSlide>
            </Swiper>
        </div>
    );
};
