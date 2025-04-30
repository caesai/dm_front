import css from './RestrauntPreview.module.css';
import classNames from 'classnames';
import { RestaurantBadge } from '@/components/RestaurantPreview/RestaurantBadge/RestaurantBadge.tsx';
import { Swiper } from 'swiper/react';
import { FreeMode } from 'swiper/modules';
import './swipergap.css';
import 'swiper/css/bundle';
import 'swiper/css/free-mode';
import { SwiperSlide } from 'swiper/react';
import { RestaurantBadgePhoto } from '@/components/RestaurantPreview/RestaurantBadgePhoto/RestaurantBadgePhoto.tsx';
import { InfoTag } from '@/components/InfoTag/InfoTag.tsx';
import { Link } from 'react-router-dom';
import { FC } from 'react';
import { IRestaurant } from '@/types/restaurant.ts';
import {
    getCurrentTimeShort,
    getCurrentWeekdayShort,
    getRestaurantStatus,
} from '@/utils.ts';

interface IProps {
    restaurant: IRestaurant;
}

export const RestaurantPreview: FC<IProps> = ({ restaurant }) => {
    return (
        <Link className={css.restaurant} to={`/restaurant/${restaurant.id}`}>
            <div
                className={classNames(css.imaged, css.bgImage)}
                style={{
                    backgroundImage: `url(${restaurant.thumbnail_photo})`,
                }}
            >
                <div className={css.floatingBadges}>
                    <Swiper
                        slidesPerView="auto"
                        modules={[FreeMode]}
                        freeMode={true}
                        spaceBetween={8}
                        slidesOffsetBefore={15}
                        slidesOffsetAfter={15}
                    >
                        <SwiperSlide
                            className={css.swiperSlide}
                            style={{ width: '130px' }}
                        >
                            <RestaurantBadge logo={restaurant.logo_url} />
                        </SwiperSlide>
                        {restaurant.photo_cards.map((card) => (
                            <SwiperSlide
                                className={css.swiperSlide}
                                style={{ width: '130px' }}
                                key={`card-${card.id}`}
                            >
                                <RestaurantBadgePhoto url={card.url} />
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>
                <div className={css.imagedBottom}>
                    <div
                        className={classNames(css.chefPhoto, css.bgImage)}
                        style={{
                            backgroundImage: `url(${restaurant.brand_chef.photo_url})`,
                        }}
                    ></div>
                    <div className={css.chefInfo}>
                        <span className={css.chefTitle}>Бренд-шеф</span>
                        <span className={css.chefName}>
                            {restaurant.brand_chef.name}
                        </span>
                    </div>
                </div>
            </div>
            <div className={css.resInfo}>
                <div className={css.resTitleWrapper}>
                    <h2 className={css.resTitle}>{restaurant.title}</h2>
                    <span className={css.resSlogan}>{restaurant.slogan}</span>
                </div>
                <div className={css.tags}>
                    <InfoTag
                        text={getRestaurantStatus(
                            restaurant.worktime,
                            getCurrentWeekdayShort(),
                            getCurrentTimeShort()
                        )}
                    />
                    <InfoTag text={`Ср. чек ${restaurant.avg_cheque}₽`} />
                </div>
            </div>
        </Link>
    );
};
