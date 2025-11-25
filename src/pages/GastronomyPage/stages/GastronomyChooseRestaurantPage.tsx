import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { BottomButtonWrapper } from '@/components/BottomButtonWrapper/BottomButtonWrapper.tsx';
import css from '@/pages/GastronomyPage/GastronomyPage.module.css'
import GastronomyImg from '/img/gastronomy-choose.png'
import { ContentBlock } from '@/components/ContentBlock/ContentBlock.tsx';
import { HeaderContent } from '@/components/ContentBlock/HeaderContainer/HeaderContent/HeaderContainer.tsx';
import { DropDownSelect } from '@/components/DropDownSelect/DropDownSelect.tsx';
import { KitchenIcon } from '@/components/Icons/KitchenIcon.tsx';
import { CitySelect } from '@/components/CitySelect/CitySelect.tsx';
import { IConfirmationType } from '@/components/ConfirmationSelect/ConfirmationSelect.types.ts';
import { cityListAtom, ICity } from '@/atoms/cityListAtom.ts';
import { transformToConfirmationFormat } from '@/pages/IndexPage/IndexPage.tsx';
import { useAtom } from 'jotai/index';
import { currentCityAtom, setCurrentCityAtom } from '@/atoms/currentCityAtom.ts';
import { IRestaurant } from '@/types/restaurant.types.ts';
import { restaurantsListAtom } from '@/atoms/restaurantsListAtom.ts';
import { RestaurantsListSelector } from '@/components/RestaurantsListSelector/RestaurantsListSelector.tsx';
import { PickerValueObj } from '@/lib/react-mobile-picker/components/Picker.tsx';

const initialRestaurant: PickerValueObj = {
    title: 'unset',
    value: 'unset',
}

export const GastronomyChooseRestaurantPage: React.FC = () => {
    const [cityListA] = useAtom(cityListAtom);
    const [currentCityA] = useAtom(currentCityAtom);
    const [restaurants] = useAtom(restaurantsListAtom);
    const [, setCurrentCityA] = useAtom(setCurrentCityAtom);

    const [restaurantsList, setRestaurantsList] = useState<IRestaurant[]>([]);
    const [restaurantListSelectorIsOpen, setRestaurantListSelectorIsOpen] = useState(false);
    const [isDisabledButton, setDisabledButton] = useState(true);

    const [cityListConfirm] = useState<IConfirmationType[]>(
        cityListA.map((v: ICity) => transformToConfirmationFormat(v)),
    );

    const [currentCityS, setCurrentCityS] = useState<IConfirmationType>(
        cityListConfirm.find((v) => v.id == currentCityA) ?? {
            id: 'moscow',
            text: 'Москва',
        },
    );

    const [currentRestaurant, setCurrentRestaurant] = useState<PickerValueObj>(initialRestaurant);

    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        let result: IRestaurant[] = [];
        let movableValue = null;

        restaurants.map((e) => {
            if (e.id !== 11) {
                result.push(e);
            } else if (e.id === 11) {
                movableValue = e;
            }
        });

        if (movableValue !== null) {
            result.unshift(movableValue);
        }

        setRestaurantsList(result.filter((v) => v.city.name_english == currentCityA));
    }, [currentCityA, cityListA]);

    const updateCurrentCity = (city: IConfirmationType) => {
        setCurrentCityS(city);
        setCurrentCityA(city.id);
        setCurrentRestaurant(initialRestaurant);
    };

    const cityOptions = useMemo(
        () => cityListConfirm.filter(v => v.id !== currentCityS.id),
        [cityListConfirm, currentCityS.id],
    );

    useEffect(() => {
        setCurrentCityS(
            cityListConfirm.find((v) => v.id == currentCityA) ?? {
                id: 'moscow',
                text: 'Москва',
            },
        );
    }, [cityListA]);

    useEffect(() => {
        currentRestaurant.value === 'unset' ? setDisabledButton(true) : setDisabledButton(false);
    }, [currentRestaurant]);

    useEffect(() => {
        const restaurant = location.state?.restaurant;
        if (restaurant) {
            setCurrentRestaurant(() => ({
                value: String(restaurant.id),
                ...restaurant
            }))
        }
    }, [location.state]);

    return (
        <>
            <RestaurantsListSelector
                isOpen={restaurantListSelectorIsOpen}
                setOpen={setRestaurantListSelectorIsOpen}
                restaurant={currentRestaurant}
                selectRestaurant={setCurrentRestaurant}
                filteredRestaurants={restaurantsList}
            />
            <div className={css.container}>
                <div className={css.content}>
                    <div className={css.info}>
                        <h2>Закажите праздничные <br/> блюда заранее и встретьте <br/> Новый год дома без хлопот</h2>
                        <img src={GastronomyImg} alt={'New Year Gastronomy'}/>
                        <ul>
                            <li>Оформите заказ до 30 декабря. Минимальная сумма — 3000 ₽.</li>
                            <li>Оплатите заказ (100% предоплата).</li>
                            <li>Заберите блюда из ресторана или оформим для вас доставку в период <br/> с 25 по 31 декабря.</li>
                        </ul>
                    </div>
                </div>
                <ContentBlock>
                    <div className={css.restaurantChoose}>
                        <HeaderContent title={'Выбор ресторана'}></HeaderContent>
                        <CitySelect
                            options={cityOptions}
                            currentValue={currentCityS}
                            onChange={updateCurrentCity}
                            titleStyle={{ fontWeight: '600' }}
                        />
                        <DropDownSelect
                            title={currentRestaurant.value !== 'unset' ? `${currentRestaurant.title}, ${currentRestaurant.address}` : 'Выберите ресторан'}
                            isValid={true}
                            icon={<KitchenIcon size={24}/>}
                            onClick={() => setRestaurantListSelectorIsOpen(true)}
                        />
                    </div>
                </ContentBlock>
                <BottomButtonWrapper
                    content={'Перейти к списку блюд'}
                    onClick={isDisabledButton ? undefined : () => navigate('/gastronomy/4')}
                    isDisabled={isDisabledButton}
                    theme={isDisabledButton ? 'primary' : 'red'}
                />
            </div>
        </>
    )
}
