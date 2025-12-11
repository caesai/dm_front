import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAtom } from 'jotai/index';
import { Swiper } from 'swiper/react';
import { FreeMode } from 'swiper/modules';
import { SwiperSlide } from 'swiper/react';
import classNames from 'classnames';
// API's
import { APIPostNewRestaurant } from '@/api/restaurants.api.ts';
// Types
import { IRestaurant } from '@/types/restaurant.types.ts';
// Atoms
import { restaurantsListAtom } from '@/atoms/restaurantsListAtom.ts';
import { authAtom, userAtom } from '@/atoms/userAtom.ts';
// Components
import { RestaurantBadge } from '@/components/RestaurantPreview/RestaurantBadge/RestaurantBadge.tsx';
import { RestaurantBadgePhoto } from '@/components/RestaurantPreview/RestaurantBadgePhoto/RestaurantBadgePhoto.tsx';
import { InfoTag } from '@/components/InfoTag/InfoTag.tsx';

import { ModalPopup } from '@/components/ModalPopup/ModalPopup.tsx';
// Hooks
import { useModal } from '@/components/ModalPopup/useModal.ts';
import useToastState from '@/hooks/useToastState.ts';
// Utils
import { getCurrentTimeShort, getCurrentWeekdayShort, getRestaurantStatus } from '@/utils.ts';
// Styles
import 'swiper/css/bundle';
import 'swiper/css/free-mode';
import css from '@/components/RestaurantPreview/RestrauntPreview.module.css';
// Mocks
import { mockNewSelfEdgeChinoisRestaurant, R } from '@/__mocks__/restaurant.mock';

interface IRestaurantPreviewProps {
    restaurant: IRestaurant;
    clickable?: boolean;
    hasClickedWantToBeFirst?: boolean;
}

const RESTAURANT_IDS_WITH_POPUP: string[] = [
    R.SELF_EDGE_SPB_RADISHEVA_ID,
    R.SMOKE_BBQ_SPB_RUBINSHTEINA_ID,
    R.SELF_EDGE_EKAT_GOGOLYA,
    R.SMOKE_BBQ_MSC_TRUBNAYA_ID,
    R.SELF_EDGE_MSC_BIG_GRUZINSKAYA_ID,
    R.SMOKE_BBQ_SPB_LODEYNOPOLSKAYA_ID,
    mockNewSelfEdgeChinoisRestaurant.id.toString(), // Self Edge Chinois для заглушки на главной странице
];

export const RestaurantPreview: React.FC<IRestaurantPreviewProps> = ({
    restaurant,
    clickable,
    hasClickedWantToBeFirst,
}) => {
    const [user] = useAtom(userAtom);
    const navigate = useNavigate();
    const { isShowing, toggle } = useModal();
    const [changeRes, setChangeRes] = useState(false);
    const [restaurants] = useAtom(restaurantsListAtom);
    const [selectedCity, setSelectedCity] = useState<number | null>(null);
    const [auth] = useAtom(authAtom);
    const { showToast } = useToastState();

    const wantToBeFirst = () => {
        if (!auth?.access_token) {
            navigate('/onboarding/3');
            return;
        }

        if (!clickable) return;

        APIPostNewRestaurant(auth?.access_token)
            .then(() => {
                showToast('Спасибо. Мы сообщим вам, когда ресторан откроется');
                // setDataToLocalStorage('want_first', { done: true });
            })
            .catch((err) => {
                if (err.response) {
                    showToast('Возникла ошибка: ' + err.response.data.message);
                }
            });
    };

    return (
        <Link
            className={css.restaurant}
            to={`/restaurant/${restaurant.id}`}
            onClick={(event) => {
                event.preventDefault();
                if (!RESTAURANT_IDS_WITH_POPUP.includes(String(restaurant.id)) && clickable) {
                    // Если это не ресторан с popup, то открываем страницу ресторана
                    navigate(`/restaurant/${restaurant.id}`);
                } else if (restaurant.id === mockNewSelfEdgeChinoisRestaurant.id) {
                    // Если это заглушка ресторана Self Edge Chinois, то ничего не делаем
                } else {
                    // Если это ресторан с popup, то открываем popup
                    toggle();
                }
            }}
        >
            {clickable && (
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
                    subtitle={
                        !changeRes
                            ? `Вас интересует ресторан ${restaurant.title} по адресу ${restaurant.address}?`
                            : undefined
                    }
                    list={
                        changeRes ? (
                            <ul className={css.list}>
                                {restaurants
                                    .filter((item) => {
                                        return item.title === restaurant.title;
                                    })
                                    .map((item, index) => (
                                        <li
                                            key={index}
                                            className={classNames(selectedCity === item.id ? css.active : null)}
                                            onClick={() => setSelectedCity(item.id)}
                                        >
                                            {item.address}
                                        </li>
                                    ))}
                            </ul>
                        ) : undefined
                    }
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
            )}
            {/* Если это заглушка ресторана Self Edge Chinois, то не отображаем затемнение */}
            <div
                className={classNames(
                    css.bgImage,
                    restaurant.id === mockNewSelfEdgeChinoisRestaurant.id ? css.bgNoImaged : css.imaged
                )}
                style={{
                    backgroundImage: `url(${restaurant.thumbnail_photo})`,
                }}
            >
                {user?.username &&
                    ['martyad', 'w0esofwit', 'egormk', 'burovburov', 'iliathoughts'].includes(user?.username) &&
                    restaurant.title === 'Self Edge Japanese' && <span className={css.discount}>Скидка 10%</span>}
                <div className={css.floatingBadges}>
                    <Swiper
                        slidesPerView="auto"
                        modules={[FreeMode]}
                        freeMode={true}
                        spaceBetween={8}
                        slidesOffsetBefore={15}
                        slidesOffsetAfter={15}
                    >
                        <SwiperSlide className={css.swiperSlide} style={{ width: '130px' }}>
                            <RestaurantBadge logo={restaurant.logo_url} />
                        </SwiperSlide>
                        {restaurant.photo_cards.map((card, index) => (
                            <SwiperSlide
                                className={css.swiperSlide}
                                style={{ width: '130px' }}
                                key={`card-${card.id}-${index}`}
                            >
                                <RestaurantBadgePhoto url={card.url} />
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>

                <div className={css.imagedBottom}>
                    {restaurant.brand_chef?.avatars?.map((avatar) => (
                        <div
                            key={avatar}
                            className={classNames(css.chefPhoto, css.bgImage)}
                            style={{
                                backgroundImage: `url(${avatar})`,
                            }}
                        ></div>
                    ))}

                    {/* Если это не заглушка ресторана Self Edge Chinois, то отображаем бренд-шефа */}
                    {restaurant.id !== mockNewSelfEdgeChinoisRestaurant.id && (
                        <div className={css.chefInfo}>
                            <span className={css.chefTitle}>
                                Бренд-шеф{restaurant.brand_chef.names.length > 1 ? 'ы' : ''}
                            </span>
                            {restaurant.brand_chef.names.map((name) => (
                                <span className={css.chefName}>{name}</span>
                            ))}
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
                {/* Если это не заглушка ресторана Self Edge Chinois, то отображаем теги */}
                {restaurant.id !== mockNewSelfEdgeChinoisRestaurant.id ? (
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
                ) : (
                    // Если это заглушка ресторана Self Edge Chinois, то отображаем кнопку "Хочу побывать первым"
                    <div style={{ display: 'flex' }}>
                        {hasClickedWantToBeFirst ? (
                            <div className={css.success_animation}>
                                <svg className={css.checkmark} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                                    <circle className={css.checkmark__circle} cx="26" cy="26" r="25" fill="none" />
                                    <path
                                        className={css.checkmark__check}
                                        fill="none"
                                        d="M14.1 27.2l7.1 7.2 16.7-16.8"
                                    />
                                </svg>
                            </div>
                        ) : (
                            <span onClick={wantToBeFirst} className={css.resFirst}>
                                {' '}
                                Хочу побывать первым
                            </span>
                        )}
                    </div>
                )}
            </div>
        </Link>
    );
};
