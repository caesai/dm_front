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
    setDataToLocalStorage,
} from '@/utils.ts';
import {useAtom} from "jotai/index";
import { authAtom, userAtom } from '@/atoms/userAtom.ts';
import { ModalPopup } from '@/components/ModalPopup/ModalPopup.tsx';
import { useModal } from '@/components/ModalPopup/useModal.ts';
import { restaurantsListAtom } from '@/atoms/restaurantsListAtom.ts';
import {Toast} from "@/components/Toast/Toast.tsx";
import { APIPostNewRestaurant } from '@/api/restaurants.ts';

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
    const [auth] = useAtom(authAtom);
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [toastShow, setToastShow] = useState<boolean>(false);

    const wantToBeFirst = () => {
        if (!auth?.access_token) {
            navigate('/onboarding/5');
            return;
        }

        APIPostNewRestaurant(auth?.access_token)
            .then(() => {
                setToastShow(true);
                setToastMessage('Спасибо. Мы сообщим вам, когда ресторан откроется');
                setDataToLocalStorage('want_first', { done: true });
            })
            .catch((err) => {
                if (err.response) {
                    setToastMessage('Возникла ошибка: ' + err.response.data.message);
                }
            })
            .finally(() => {
                setTimeout(() => {
                    setToastShow(false);
                    setToastMessage(null);
                }, 3000);
            });
    }

    return (
        <Link className={css.restaurant}
              to={`/restaurant/${restaurant.id}`}
              onClick={(event) => {
                  event.preventDefault();
                  if (restaurant.id !== 12 && restaurant.id !== 11 && restaurant.id !== 10 && restaurant.id !== 4 && restaurant.id !== 6 && restaurant.id !== 7 && restaurant.id !== 9) {
                      navigate(`/restaurant/${restaurant.id}`);
                  } else if (restaurant.id == 12) {
                    // nothing
                  } else {
                      toggle();
                  }
              }}
        >
            <ModalPopup
                isOpen={isShowing}
                setOpen={() => {
                    if (!changeRes) {
                        toggle();
                    } else {
                        setChangeRes(false);
                    }
                }}
                title={!changeRes ? undefined : 'Выберите ресторан'}
                subtitle={!changeRes ? `Вас интересует ресторан ${restaurant.title} по адресу ${restaurant.address}?` : undefined}
                list={changeRes ? (
                    <ul className={css.list}>
                        {restaurants.filter((item) =>{
                            return item.title === restaurant.title
                        }).map((item, index) => (
                            <li key={index} className={classNames(selectedCity === item.id ? css.active : null)} onClick={() => setSelectedCity(item.id)}>{item.address}</li>
                        ))}
                    </ul>
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
                btnScndrText={!changeRes ? 'Изменить' : undefined}
                reverseButton={!changeRes}
                btnScndrAction={() => {
                    setChangeRes(true);
                }}
            />
            <div
                className={classNames(css.bgImage,
                    restaurant.id === 12 ? css.bgNoImaged : css.imaged)}
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
                            {restaurant.photo_cards.map((card, index) => (
                                <SwiperSlide
                                    className={css.swiperSlide}
                                    style={{width: '130px'}}
                                    key={`card-${card.id}-${index}`}
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
                        {restaurant.id !== 12 && (
                            <div className={css.chefInfo}>
                                <span className={css.chefTitle}>Бренд-шеф</span>
                                <span className={css.chefName}>
                                    {restaurant.brand_chef.name}
                                </span>
                            </div>
                        )}
                    </div>
            </div>
            <div className={css.resInfo}>
                <div className={css.resTitleWrapper}>
                    <h2 className={css.resTitle}>{restaurant.title}</h2>
                    <span className={css.resSlogan}>{restaurant.slogan}</span>
                    <span className={css.resSlogan}>{restaurant.address}</span>
                </div>
                {restaurant.id !== 12 ? (
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
                ) : (
                    <div style={{ display: 'flex'}}>
                        {toastShow ? (
                            <div className={css.success_animation}>
                                <svg className={css.checkmark} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                                    <circle className={css.checkmark__circle} cx="26" cy="26" r="25" fill="none" />
                                    <path className={css.checkmark__check} fill="none"
                                          d="M14.1 27.2l7.1 7.2 16.7-16.8" />
                                </svg>
                            </div>
                        ) : <span onClick={wantToBeFirst} className={css.resFirst}> Хочу побывать первым</span>}
                    </div>
                )}
            </div>
            <Toast message={toastMessage} showClose={toastShow} />
        </Link>
    );
};
