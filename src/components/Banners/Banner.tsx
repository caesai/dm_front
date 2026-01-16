import css from "./Banner.module.css";
import { FreeMode } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import { useEffect, useState } from 'react';
import { BannersMock } from '@/__mocks__/banners.mock.ts';

export const Banner = () => {
    const [banners, setBanners] = useState<string[]>([]);

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
                    >
                        <div
                            className={css.photo}
                            style={{ backgroundImage: `url(${banner})` }}
                        />
                    </SwiperSlide>
                ))}
            </Swiper>
        </section>
    )
}