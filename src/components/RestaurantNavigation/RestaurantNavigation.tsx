import { FC, useEffect, useState } from 'react';
import css from './RestaurantNavigation.module.css';
import AnchorLink from 'react-anchor-link-smooth-scroll';
import classNames from 'classnames';
import { Swiper as SwiperCore } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode } from 'swiper/modules';

interface IRestaurantNavigationProps {
    isShow: boolean;
    isEvents: boolean;
}

export const RestaurantNavigation: FC<IRestaurantNavigationProps> = ({ isShow, isEvents }) => {
    const [hash, setHash] = useState<string | null>(null);
    const [swiperInstance, setSwiperInstance] = useState<SwiperCore | null>(null);
    const hashes = ['booking', 'gallery', 'menu', 'about', 'chef', 'events', 'banquet'];

    useEffect(() => {
        if (hash && swiperInstance) {
            const index = hashes.indexOf(hash);
            swiperInstance.slideTo(index);
        }
    }, [hash]);
    useEffect(() => {
        const handleScroll = () => {
            const elements = hashes.map((id) => document.getElementById(id));
            elements.forEach((element) => {
                if (element && (element.offsetTop - window.scrollY < window.innerHeight / 2)) {
                    setHash(element.id);
                }
            });
        };
        document.addEventListener('scroll', handleScroll);
        return () => {
            document.removeEventListener('scroll', handleScroll);
        };
    });

    return (
        <div className={css.navigationSlider}>
            <Swiper
                modules={[FreeMode]}
                freeMode={true}
                slidesPerView={'auto'}
                spaceBetween={8}
                onSwiper={setSwiperInstance}
            >
                <SwiperSlide style={{ width: 'fit-content' }}>
                    <AnchorLink href="#booking" offset={250}>
                        <div className={classNames(
                                css.navigationLink,
                                hash === 'booking' ? css.navigationLinkActive : '',
                        )}>
                            Бронь
                        </div>
                    </AnchorLink>
                </SwiperSlide>
                <SwiperSlide style={{ width: 'fit-content' }}>
                    <AnchorLink href="#gallery" offset={160}>
                        <div className={classNames(
                            css.navigationLink,
                            hash === 'gallery' ? css.navigationLinkActive : '',
                        )}>
                            Галерея
                        </div>
                    </AnchorLink>
                </SwiperSlide>
                <SwiperSlide style={{ width: 'fit-content' }}>
                    <AnchorLink href="#menu" offset={160}>
                        <div className={classNames(
                            css.navigationLink,
                            hash === 'menu' ? css.navigationLinkActive : '',
                        )}>
                            Меню
                        </div>
                    </AnchorLink>
                </SwiperSlide>
                <SwiperSlide style={{ width: 'fit-content' }}>
                    <AnchorLink href="#about" offset={160}>
                        <div className={classNames(
                            css.navigationLink,
                            hash === 'about' ? css.navigationLinkActive : '',
                        )}>
                            О месте
                        </div>
                    </AnchorLink>
                </SwiperSlide>
                <SwiperSlide style={{ width: 'fit-content' }}>
                    <AnchorLink href="#chef" offset={160}>
                        <div className={classNames(
                            css.navigationLink,
                            hash === 'chef' ? css.navigationLinkActive : '',
                        )}>
                            О шефе
                        </div>
                    </AnchorLink>
                </SwiperSlide>
                {isEvents && (
                    <SwiperSlide style={{ width: 'fit-content' }}>
                        <AnchorLink href="#events" offset={160}>
                            <div className={classNames(
                                css.navigationLink,
                                hash === 'events' ? css.navigationLinkActive : '',
                            )}>
                                Мероприятия
                            </div>
                        </AnchorLink>
                    </SwiperSlide>
                )}
                {isShow && (
                    <SwiperSlide style={{ width: 'fit-content' }}>
                        <AnchorLink href="#banquet" offset={160}>
                            <div className={classNames(
                                css.navigationLink,
                                hash === 'banquet' ? css.navigationLinkActive : '',
                            )}>
                                Банкеты
                            </div>
                        </AnchorLink>
                    </SwiperSlide>
                )}

                {/*<SwiperSlide style={{ width: '48px' }}></SwiperSlide>*/}
            </Swiper>
        </div>
    );
};
