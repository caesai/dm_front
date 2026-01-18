import css from "./Banner.module.css";
import { FreeMode } from 'swiper/modules';
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
            <Swiper slidesPerView="auto" modules={[FreeMode]} freeMode={true} spaceBetween={8}>
                {banners.map((banner, index) => (
                    <SwiperSlide
                        key={`${index}-${banner}`}
                        style={{ width: 'max-content' }}
                        onClick={() => navigate(banner.link)}
                    >
                        <div
                            className={css.photo}
                            style={{ backgroundImage: `url(${banner.img_url})` }}
                        />
                    </SwiperSlide>
                ))}
            </Swiper>
        </section>
    )
}