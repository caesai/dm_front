import React, { useEffect, useMemo, useState } from 'react';
import AnchorLink from 'react-anchor-link-smooth-scroll';
import classNames from 'classnames';
// Atoms
import { useGetRestaurantById } from '@/atoms/restaurantsListAtom.ts';
// Swiper
import { Swiper as SwiperCore } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode } from 'swiper/modules';
// Styles
import css from '@/components/RestaurantNavigation/RestaurantNavigation.module.css';
// Hooks
import { useRestaurantPageData } from '@/hooks/useRestaurantPageData.ts';


interface IRestaurantNavigationProps {
    restaurantId: string;
}

/**
 * Компонент навигации по ресторану.
 *
 * Позволяет переключаться между различными разделами ресторана.
 *
 * @component
 * @param {IRestaurantNavigationProps} props - Пропсы компонента
 * @returns {JSX.Element} Компонент навигации по ресторану
 */
export const RestaurantNavigation: React.FC<IRestaurantNavigationProps> = ({
    restaurantId,
}: IRestaurantNavigationProps): JSX.Element => {
    const { events } = useRestaurantPageData({ restaurantId });
    const restaurant = useGetRestaurantById(restaurantId);
    const [hash, setHash] = useState<string>('booking');
    const [swiperInstance, setSwiperInstance] = useState<SwiperCore | null>(null);
    const hashes = ['booking', 'gallery', 'menu', 'banquet', 'events', 'certificates', 'about', 'chef'];
    const hasEvents = useMemo(() => Boolean(events && events.length > 0), [events]);
    const hasMenu = useMemo(() => Boolean(restaurant?.menu && restaurant?.menu.length > 0), [restaurant?.menu]);
    const hasBanquets = useMemo(
        () => Boolean(restaurant?.banquets && restaurant?.banquets.banquet_options.length > 0),
        [restaurant?.banquets]
    );
    /**
     * Обработчик скролла для определения текущего раздела.
     *
     * Перемещает слайд в слайдере на основе текущего раздела.
     *
     * @effect
     * @param {string} hash - Текущий раздел
     * @param {SwiperCore | null} swiperInstance - Экземпляр Swiper
     */
    useEffect(() => {
        if (hash && swiperInstance && hashes.includes(hash)) {
            const index = hashes.indexOf(hash);
            swiperInstance.slideTo(index);
        }
    }, [hash, swiperInstance, hashes]);

    /**
     * Обработчик скролла для определения текущего раздела.
     *
     * Определяет, какой раздел навигации должен быть активным на основе текущего положения скролла.
     *
     * @effect
     * @param {string[]} hashes - Массив идентификаторов разделов
     */
    useEffect(() => {
        const handleScroll = () => {
            const elements = hashes.map((id) => document.getElementById(id));
            elements.forEach((element) => {
                if (element && window.scrollY !== 0 && element.offsetTop - window.scrollY < window.innerHeight / 2) {
                    setHash(element.id);
                }
            });
        };
        document.addEventListener('scroll', handleScroll);
        return () => {
            document.removeEventListener('scroll', handleScroll);
        };
    }, [hash, swiperInstance, hashes]);

    useEffect(() => {
        if (hash && swiperInstance) {
            const index = hashes.indexOf(hash);
            swiperInstance.slideTo(index);
        }
    }, [hash, swiperInstance, hashes]);

    return (
        <nav className={css.navigationSlider}>
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
                            className={classNames(css.navigationLink, {
                                [css.navigationLinkActive]: hash === 'booking',
                            })}
                        >
                            Бронь
                        </div>
                    </AnchorLink>
                </SwiperSlide>
                <SwiperSlide style={{ width: 'fit-content' }}>
                    <AnchorLink href="#gallery" offset={160}>
                        <div
                            className={classNames(css.navigationLink, {
                                [css.navigationLinkActive]: hash === 'gallery',
                            })}
                        >
                            Галерея
                        </div>
                    </AnchorLink>
                </SwiperSlide>
                {hasMenu && (
                    <SwiperSlide style={{ width: 'fit-content' }}>
                        <AnchorLink href="#menu" offset={160}>
                            <div
                                className={classNames(css.navigationLink, {
                                    [css.navigationLinkActive]: hash === 'menu',
                                })}
                            >
                                Меню
                            </div>
                        </AnchorLink>
                    </SwiperSlide>
                )}
                {hasBanquets && (
                    <SwiperSlide style={{ width: 'fit-content' }}>
                        <AnchorLink href="#banquet" offset={160}>
                            <div
                                className={classNames(css.navigationLink, {
                                    [css.navigationLinkActive]: hash === 'banquet',
                                })}
                            >
                                Банкеты
                            </div>
                        </AnchorLink>
                    </SwiperSlide>
                )}
                {hasEvents && (
                    <SwiperSlide style={{ width: 'fit-content' }}>
                        <AnchorLink href="#events" offset={160}>
                            <div
                                className={classNames(css.navigationLink, {
                                    [css.navigationLinkActive]: hash === 'events',
                                })}
                            >
                                Мероприятия
                            </div>
                        </AnchorLink>
                    </SwiperSlide>
                )}
                <SwiperSlide style={{ width: 'fit-content' }}>
                    <AnchorLink href="#certificates" offset={160}>
                        <div
                            className={classNames(css.navigationLink, {
                                [css.navigationLinkActive]: hash === 'certificates',
                            })}
                        >
                            Сертификаты
                        </div>
                    </AnchorLink>
                </SwiperSlide>
                <SwiperSlide style={{ width: 'fit-content' }}>
                    <AnchorLink href="#about" offset={160}>
                        <div
                            className={classNames(css.navigationLink, {
                                [css.navigationLinkActive]: hash === 'about',
                            })}
                        >
                            О месте
                        </div>
                    </AnchorLink>
                </SwiperSlide>
                <SwiperSlide style={{ width: 'fit-content' }}>
                    <AnchorLink href="#chef" offset={160}>
                        <div
                            className={classNames(css.navigationLink, {
                                [css.navigationLinkActive]: hash === 'chef',
                            })}
                        >
                            О шефе
                        </div>
                    </AnchorLink>
                </SwiperSlide>
            </Swiper>
        </nav>
    );
};
