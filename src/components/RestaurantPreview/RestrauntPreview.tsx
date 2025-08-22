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
import { Link, useNavigate } from 'react-router-dom';
import { FC, useState } from 'react';
import {IRestaurant} from '@/types/restaurant.ts';
import {
    getCurrentTimeShort,
    getCurrentWeekdayShort,
    getRestaurantStatus,
} from '@/utils.ts';
import {useAtom} from "jotai/index";
import {userAtom} from "@/atoms/userAtom.ts";
import { ModalPopup } from '@/components/ModalPopup/ModalPopup.tsx';
import { useModal } from '@/components/ModalPopup/useModal.ts';
import { restaurantsListAtom } from '@/atoms/restaurantsListAtom.ts';
import { CommentaryOptionButton } from '@/components/CommentaryOptionButton/CommentaryOptionButton.tsx';
// import {Toast} from "@/components/Toast/Toast.tsx";

interface IProps {
    restaurant: IRestaurant;
}

export const RestaurantPreview: FC<IProps> = ({restaurant}) => {
    const [user] = useAtom(userAtom);
    const navigate = useNavigate();
    const { isShowing, toggle } = useModal();
    const [changeRes, setChangeRes] = useState(false)
    const [restaurants] = useAtom(restaurantsListAtom);
    const [selectedCity, setSelectedCity] = useState<number | null>(null);
    // const [auth] = useAtom(authAtom);

    return (
        <Link className={css.restaurant}
              to={`/restaurant/${restaurant.id}`}
              onClick={(event) => {
                  event.preventDefault();
                  if (restaurant.id !== 11 && restaurant.id !== 4 && restaurant.id !== 6 && restaurant.id !== 7 && restaurant.id !== 9) {
                      navigate(`/restaurant/${restaurant.id}`);
                  } else {
                      toggle();
                  }
              }}
        >
            <ModalPopup
                isOpen={isShowing}
                setOpen={toggle}
                title={!changeRes ? `Вас интересует ресторан ${restaurant.title}` : 'Выберите интересующий Вас ресторан'}
                subtitle={!changeRes ? `по адресу ${restaurant.address}?` : undefined}
                list={changeRes ? (
                    // <ul className={css.list}>
                    //     {restaurants.filter((item) =>{
                    //         return item.title === restaurant.title
                    //     }).map((item, index) => (
                    //         <li key={index} className={classNames(selectedCity === item.id ? css.active : null)} onClick={() => setSelectedCity(item.id)}>{item.address}</li>
                    //     ))}
                    // </ul>
                    <div>
                        <Swiper
                            slidesPerView="auto"
                            modules={[FreeMode]}
                            freeMode={true}
                            spaceBetween={8}
                        >
                            {restaurants.filter((item) =>{
                                return item.title === restaurant.title
                            }).map((item, index) => (
                                    <SwiperSlide
                                        key={index}
                                        style={{ width: 'max-content' }}
                                    >
                                        <CommentaryOptionButton
                                            text={item.address}
                                            icon={''}
                                            active={item.id === selectedCity}
                                            onClick={() => setSelectedCity(item.id)}
                                        />
                                    </SwiperSlide>
                                ))}
                        </Swiper>
                    </div>
                ) : undefined}
                button={true}
                btnDisabled={!Boolean(selectedCity) && changeRes}
                btnText={!changeRes ? 'Да' : 'Продолжить'}
                btnAction={() => {
                    if (!changeRes) {
                        navigate(`/restaurant/${restaurant.id}`);
                    } else {
                        navigate(`/restaurant/${selectedCity}`);
                    }
                }}
                btnScndrText={!changeRes ? 'Изменить' : 'Отменить'}
                reverseButton={!changeRes}
                btnScndrAction={() => {
                    if (!changeRes) {
                        setChangeRes(true);
                    } else {
                        setChangeRes(false)
                    }
                }}
            />
            <div
                className={classNames(css.bgImage, css.imaged)}
                style={{
                    backgroundImage: `url(${restaurant.thumbnail_photo})`,
                }}
            >

                {user?.username && ['martyad', 'w0esofwit', 'egormk', 'burovburov', 'iliathoughts'].includes(user?.username) && restaurant.title === 'Self Edge Japanese' && (
                    <span className={css.discount}>Скидка 10%</span>
                )}
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
                    <span className={css.resSlogan}>{restaurant.address}</span>
                </div>
                <div className={css.tags}>
                            <InfoTag
                                text={getRestaurantStatus(
                                    restaurant.worktime,
                                    getCurrentWeekdayShort(),
                                    getCurrentTimeShort()
                                )}
                            />
                            <InfoTag text={`Ср. чек ${restaurant.avg_cheque}₽`}/>
                </div>
            </div>
        </Link>
    );
};
