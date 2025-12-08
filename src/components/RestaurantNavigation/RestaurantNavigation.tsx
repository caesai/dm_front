import React, { useEffect, useState } from 'react';
import css from './RestaurantNavigation.module.css';
import AnchorLink from 'react-anchor-link-smooth-scroll';
import classNames from 'classnames';
import { Swiper as SwiperCore } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode } from 'swiper/modules';
import { PlaceholderBlock } from '@/components/PlaceholderBlock/PlaceholderBlock.tsx';

interface IRestaurantNavigationProps {
    isEvents: boolean;
    isLoading: boolean;
    isBanquets: boolean;
    isGastronomy: boolean;
}

export const RestaurantNavigation: React.FC<IRestaurantNavigationProps> = ({ isEvents, isLoading, isBanquets, isGastronomy }) => {
    const [hash, setHash] = useState<string | null>(null);
    const [swiperInstance, setSwiperInstance] = useState<SwiperCore | null>(null);
    const hashes = ['booking', 'gallery', 'menu', 'banquet', 'events', 'certificates', 'ny_cooking', 'about', 'chef'];

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
                if (element && element.offsetTop - window.scrollY < window.innerHeight / 2) {
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
            {isLoading ? (
                <PlaceholderBlock width={'100%'} height={'41px'} rounded={'20px'} />
            ) : (
                <Swiper
                    modules={[FreeMode]}
                    freeMode={true}
                    slidesPerView={'auto'}
                    spaceBetween={8}
                    onSwiper={setSwiperInstance}
                >
                    <SwiperSlide style={{ width: 'fit-content' }}>
                        <AnchorLink href="#booking" offset={250}>
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
                        <AnchorLink href="#gallery" offset={160}>
                            <div
                                className={classNames(
                                    css.navigationLink,
                                    hash === 'gallery' ? css.navigationLinkActive : ''
                                )}
                            >
                                Галерея
                            </div>
                        </AnchorLink>
                    </SwiperSlide>
                    <SwiperSlide style={{ width: 'fit-content' }}>
                        <AnchorLink href="#menu" offset={160}>
                            <div
                                className={classNames(
                                    css.navigationLink,
                                    hash === 'menu' ? css.navigationLinkActive : ''
                                )}
                            >
                                Меню
                            </div>
                        </AnchorLink>
                    </SwiperSlide>
                    {isBanquets && (
                        <SwiperSlide style={{ width: 'fit-content' }}>
                            <AnchorLink href="#banquet" offset={160}>
                                <div
                                    className={classNames(
                                        css.navigationLink,
                                        hash === 'banquet' ? css.navigationLinkActive : ''
                                    )}
                                >
                                    Банкеты
                                </div>
                            </AnchorLink>
                        </SwiperSlide>
                    )}
                    {isEvents && (
                        <SwiperSlide style={{ width: 'fit-content' }}>
                            <AnchorLink href="#events" offset={160}>
                                <div
                                    className={classNames(
                                        css.navigationLink,
                                        hash === 'events' ? css.navigationLinkActive : ''
                                    )}
                                >
                                    Мероприятия
                                </div>
                            </AnchorLink>
                        </SwiperSlide>
                    )}
                        <SwiperSlide style={{ width: 'fit-content' }}>
                            <AnchorLink href="#certificates" offset={160}>
                                <div
                                    className={classNames(
                                        css.navigationLink,
                                        hash === 'certificates' ? css.navigationLinkActive : ''
                                    )}
                                >
                                    Сертификаты
                                </div>
                            </AnchorLink>
                        </SwiperSlide>
                    {isGastronomy && (
                        <SwiperSlide style={{ width: 'fit-content' }}>
                            <AnchorLink href="#ny_cooking" offset={160}>
                                <div
                                    className={classNames(
                                        css.navigationLink,
                                        hash === 'ny_cooking' ? css.navigationLinkActive : '',
                                    )}
                                >
                                    Новогодняя кулинария
                                </div>
                            </AnchorLink>
                        </SwiperSlide>
                    )}
                    <SwiperSlide style={{ width: 'fit-content' }}>
                        <AnchorLink href="#about" offset={160}>
                            <div
                                className={classNames(
                                    css.navigationLink,
                                    hash === 'about' ? css.navigationLinkActive : ''
                                )}
                            >
                                О месте
                            </div>
                        </AnchorLink>
                    </SwiperSlide>
                    <SwiperSlide style={{ width: 'fit-content' }}>
                        <AnchorLink href="#chef" offset={160}>
                            <div
                                className={classNames(
                                    css.navigationLink,
                                    hash === 'chef' ? css.navigationLinkActive : ''
                                )}
                            >
                                О шефе
                            </div>
                        </AnchorLink>
                    </SwiperSlide>
                </Swiper>
            )}
        </div>
    );
};
