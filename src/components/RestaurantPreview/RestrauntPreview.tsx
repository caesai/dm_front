import css from './RestrauntPreview.module.css';
import classNames from 'classnames';
import {RestaurantBadge} from '@/components/RestaurantPreview/RestaurantBadge/RestaurantBadge.tsx';
import {Swiper} from 'swiper/react';
import {FreeMode} from 'swiper/modules';
import './swipergap.css';
import 'swiper/css/bundle';
import 'swiper/css/free-mode';
import {SwiperSlide} from 'swiper/react';
import {RestaurantBadgePhoto} from '@/components/RestaurantPreview/RestaurantBadgePhoto/RestaurantBadgePhoto.tsx';
import {InfoTag} from '@/components/InfoTag/InfoTag.tsx';
import {Link} from 'react-router-dom';
import {FC, useState} from 'react';
import {IRestaurant} from '@/types/restaurant.ts';
import {
    getCurrentTimeShort,
    getCurrentWeekdayShort,
    getRestaurantStatus,
} from '@/utils.ts';
import {useAtom} from "jotai/index";
import {authAtom, userAtom} from "@/atoms/userAtom.ts";
import BBQNEW from '/img/BBQNEW.png';
import {APIPostNewRestaurant} from "@/api/restaurants.ts";
// import {Toast} from "@/components/Toast/Toast.tsx";

interface IProps {
    restaurant: IRestaurant;
}

export const RestaurantPreview: FC<IProps> = ({restaurant}) => {
    const [user] = useAtom(userAtom);
    const [auth] = useAtom(authAtom);
    // const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [toastShow, setToastShow] = useState<boolean>(false);

    const wantToBeFirst = () => {
        //
        if (!auth?.access_token) {
            return;
        }
        setToastShow(true);

        APIPostNewRestaurant(auth?.access_token).then((res) => {
            console.log('res: ', res);
            // setToastMessage('Спасибо. Мы сообщим вам, когда ресторан откроется');
            // setTimeout(function(){ setToastShow(false); setToastMessage(null); }, 3000);
        }).catch((err) => {
            if (err.response) {
                // alert(err.response.data);
                // setToastMessage('Возникла ошибка: ' + err.response.data.message);
                // setToastShow(true);
                // setTimeout(function(){ setToastShow(false); setToastMessage(null); }, 3000);
            }
        });
    }
    return (
        <Link className={css.restaurant} to={restaurant.id === 11 ? '' : `/restaurant/${restaurant.id}`}>
            <div
                className={classNames(css.bgImage, restaurant.id !== 11 ? css.imaged : css.bgNoImaged)}
                style={{
                    backgroundImage: `url(${restaurant.id === 11 ? BBQNEW : restaurant.thumbnail_photo})`,
                }}
            >

                {user?.username && ['martyad', 'w0esofwit', 'egormk', 'burovburov', 'Sushkazzlo', 'iliathoughts'].includes(user?.username) && restaurant.title === 'Self Edge Japanese' && (
                    <span className={css.discount}>Скидка 10%</span>
                )}
                {restaurant.id !== 11 && (
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
                                style={{width: '130px'}}
                            >
                                <RestaurantBadge logo={restaurant.logo_url}/>
                            </SwiperSlide>
                            {restaurant.photo_cards.map((card) => (
                                <SwiperSlide
                                    className={css.swiperSlide}
                                    style={{width: '130px'}}
                                    key={`card-${card.id}`}
                                >
                                    <RestaurantBadgePhoto url={card.url}/>
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    </div>
                )}

                {restaurant.id !== 11 && (
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
                )}
            </div>
            <div className={css.resInfo}>
                <div className={css.resTitleWrapper}>
                    <h2 className={css.resTitle}>{restaurant.title}</h2>
                    <span className={css.resSlogan}>{restaurant.slogan}</span>
                    <span className={css.resSlogan}>{restaurant.address}</span>
                </div>
                <div className={css.tags}>
                    {restaurant.id === 11 ? toastShow ? (
                        <div className={css.success_animation}>
                            <svg className={css.checkmark} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                                <circle className={css.checkmark__circle} cx="26" cy="26" r="25" fill="none"/>
                                <path className={css.checkmark__check} fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
                            </svg>
                        </div>
                    ) : <span onClick = {wantToBeFirst} className = {css.resFirst} > Хочу побывать первым</span> : (
                        <>
                        <InfoTag
                        text={getRestaurantStatus(
                        restaurant.worktime,
                        getCurrentWeekdayShort(),
                                    getCurrentTimeShort()
                                )}
                            />
                            <InfoTag text={`Ср. чек ${restaurant.avg_cheque}₽`}/>
                        </>
                    )}
                </div>
                {/*<Toast message={toastMessage} showClose={toastShow} />*/}
            </div>
        </Link>
    );
};
