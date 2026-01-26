import css from './Banner.module.css';
import { Zoom } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import { useEffect, useState } from 'react';
import { BannersMock } from '@/__mocks__/banners.mock.ts';
import { IEventBanner } from '@/types/events.types.ts';
import { useNavigate } from 'react-router-dom';

export const Banner = () => {
    const navigate = useNavigate();

    const [banners, setBanners] = useState<IEventBanner[]>([]);

    useEffect(() => {
        setBanners(BannersMock);
    }, []);

    return (
        <section className={css.banner}>
            <Swiper zoom slidesPerView="auto" modules={[Zoom]} centeredSlides spaceBetween={8} className={css.swiper}>
                {banners.map((banner, index) => (
                    <SwiperSlide
                        key={`${index}-${banner}`}
                        style={{ width: 'max-content' }}
                        onClick={() => navigate(banner.link)}
                    >
                        <div className={css.photo} style={{ backgroundImage: `url(${banner.img_url})` }} />
                    </SwiperSlide>
                ))}
            </Swiper>
        </section>
    );
};
