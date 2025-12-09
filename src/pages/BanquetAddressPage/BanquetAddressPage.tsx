import { Page } from '@/components/Page.tsx';
import css from './BanquetAddressPage.module.css';
import { RoundedButton } from '@/components/RoundedButton/RoundedButton.tsx';
import { BackIcon } from '@/components/Icons/BackIcon.tsx';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { BottomButtonWrapper } from '@/components/BottomButtonWrapper/BottomButtonWrapper.tsx';
import BanquetImg from '/img/banquet_img.png';
import { DropDownSelect } from '@/components/DropDownSelect/DropDownSelect.tsx';
import React, { useEffect, useState } from 'react';
import { PickerValueObj } from '@/lib/react-mobile-picker/components/Picker.tsx';
import { RestaurantsListSelector } from '@/components/RestaurantsListSelector/RestaurantsListSelector.tsx';
import { useAtom } from 'jotai/index';
import { userAtom } from '@/atoms/userAtom.ts';
import { IRestaurant } from '@/types/restaurant.types.ts';
import { restaurantsListAtom } from '@/atoms/restaurantsListAtom.ts';
import { IBanquet } from '@/types/banquets.types.ts';

const initialRestaurant: PickerValueObj = {
    title: 'unset',
    value: 'unset',
};

export const BanquetAddressPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { id } = useParams();
    const [user] = useAtom(userAtom);
    const [restaurants] = useAtom(restaurantsListAtom);

    const [currentRestaurant, setCurrentRestaurant] = useState<PickerValueObj>(initialRestaurant);
    const [restaurantPopup, setRestaurantPopup] = useState<boolean>(false);
    const [isDisabledButton, setDisabledButton] = useState(true);
    const [restaurantsList, setRestaurantsList] = useState<IRestaurant[]>([]);
    const [banquets, setBanquets] = useState<IBanquet | null>(null);

    const restaurant = location.state?.restaurant;

    const goBack = () => {
        if (user?.complete_onboarding) {
            if (id === ':id') {
                navigate('/');
            } else {
                navigate(`/restaurant/${id}`);
            }
        } else {
            navigate('/onboarding/3');
        }
    };

    const goNextPage = () => {
        if (!isDisabledButton) {
            const workTime = restaurantsList.find(item => item.id === Number(currentRestaurant.value))?.worktime;
            if (user?.complete_onboarding) {
                navigate(`/banquets/${currentRestaurant.value}/choose`, {
                    state: {
                        ...location.state,
                        banquets,
                        currentRestaurant,
                        workTime
                    },
                });
            } else {
                navigate('/onboarding/3', {
                    state: {
                        ...location.state,
                        id: currentRestaurant.value,
                        banquets,
                        workTime,
                        sharedBanquet: true,
                        currentRestaurant,
                    },
                });
            }
        }
    };

    useEffect(() => {
        currentRestaurant.value === 'unset' ? setDisabledButton(true) : setDisabledButton(false);
    }, [currentRestaurant]);

    useEffect(() => {
        if (location.state && location.state.currentRestaurant) {
            setCurrentRestaurant(() => ({
                value: String(location.state.currentRestaurant.id),
                ...location.state.currentRestaurant,
            }));
        } else if (restaurant) {
            setCurrentRestaurant(() => ({
                value: String(restaurant.id),
                ...restaurant,
            }));
        }
    }, [location.state]);

    // Загрузка данных о банкетах в конкретном ресторане
    useEffect(() => {
        if (currentRestaurant.value !== 'unset') {
            const currentBanquets = restaurantsList.find((item) => item.id === Number(currentRestaurant.value))?.banquets;
            if (currentBanquets) {
                setBanquets(currentBanquets);
            }
        }
    }, [currentRestaurant.value]);

    useEffect(() => {
        const filteredRestaurantsWithBanquetOptions = restaurants.filter((item) => item.banquets.banquet_options.length > 0);
        setRestaurantsList(filteredRestaurantsWithBanquetOptions);
    }, [restaurants]);

    return (
        <Page back={true}>
            <RestaurantsListSelector
                isOpen={restaurantPopup}
                setOpen={setRestaurantPopup}
                restaurant={currentRestaurant}
                selectRestaurant={setCurrentRestaurant}
                filteredRestaurants={restaurantsList}
            />
            <div className={css.page}>
                <div className={css.pageWrapper}>
                    <div className={css.header}>
                        <RoundedButton
                            icon={<BackIcon color={'var(--dark-grey)'} />}
                            action={goBack}
                        ></RoundedButton>
                        <span className={css.header_title}>
                            Банкеты
                        </span>
                        <div style={{ width: 40 }} />
                    </div>
                    <div className={css.container}>
                        <div className={css.banquet_content}>
                            {/* <span
                                className={css.banquet_title}>Подарите приятный вечер в <br /> ресторанах Dreamteam</span> */}
                            <img src={BanquetImg} alt={'Банкет'} className={css.banquet_img} />
                            <span className={css.banquet_text}>Для тех, кто планирует важное событие. Здесь можно собрать частный ужин, семейный праздник или деловую встречу — мы предложим пространство, меню и сопровождение под ваш формат.</span>
                        </div>
                        <div className={css.address_content}>
                            <h3 className={css.content_title}>Адрес ресторана</h3>
                            <DropDownSelect
                                title={currentRestaurant.value !== 'unset' ? `${currentRestaurant?.title}, ${currentRestaurant.address}` : 'Выберите ресторан'}
                                isValid={true}
                                onClick={() => setRestaurantPopup(true)}
                            />
                        </div>
                    </div>
                </div>
                <BottomButtonWrapper
                    content={'Продолжить'}
                    onClick={goNextPage}
                    theme={isDisabledButton ? 'primary' : 'red'}
                />
            </div>
        </Page>
    );
};
