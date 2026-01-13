import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAtomValue } from 'jotai';
// Components
import { BottomButtonWrapper } from '@/components/BottomButtonWrapper/BottomButtonWrapper.tsx';
import { ContentBlock } from '@/components/ContentBlock/ContentBlock.tsx';
import { HeaderContent } from '@/components/ContentBlock/HeaderContainer/HeaderContent/HeaderContainer.tsx';
import { DropDownSelect } from '@/components/DropDownSelect/DropDownSelect.tsx';
import { KitchenIcon } from '@/components/Icons/KitchenIcon.tsx';
import { CitySelect } from '@/components/CitySelect/CitySelect.tsx';
// import { RestaurantsListSelector } from '@/components/RestaurantsListSelector/RestaurantsListSelector.tsx';
// Atoms
// import { currentCityAtom } from '@/atoms/currentCityAtom.ts';
// import { restaurantsListAtom } from '@/atoms/restaurantsListAtom.ts';
// import { allGastronomyDishesListAtom } from '@/atoms/dishesListAtom.ts';
// Types
// import { IRestaurant } from '@/types/restaurant.types.ts';
import { PickerValueObj } from '@/lib/react-mobile-picker/components/Picker.tsx';
// Hooks
import { useGastronomyCart } from '@/hooks/useGastronomyCart.ts';
// import { useDataLoader } from '@/hooks/useDataLoader.ts';
// Mocks
// import { R } from '@/__mocks__/restaurant.mock.ts';
// Styles
import css from '@/pages/GastronomyPage/GastronomyPage.module.css';
import GastronomyImg from '/img/gastronomy-choose.png';
import GastronomyMoscowImg from '/img/gastronomy-choose-moscow.jpeg';
import { getCurrentCity } from '@/atoms/cityListAtom';

const initialRestaurant: PickerValueObj = {
    title: 'unset',
    value: 'unset',
};

export const GastronomyChooseRestaurantPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Атомы (только чтение)
    const currentCity = useAtomValue(getCurrentCity);
    // const restaurants = useAtomValue(restaurantsListAtom);
    // const allGastronomyDishesList = useAtomValue(allGastronomyDishesListAtom);

    // Локальные состояния
    const [, setRestaurantListSelectorIsOpen] = useState(false);
    const [currentRestaurant, setCurrentRestaurant] = useState<PickerValueObj>(initialRestaurant);

    const { clearCart } = useGastronomyCart();
    // const { loadGastronomyDishes } = useDataLoader();

    // Ленивая загрузка блюд гастрономии при первом посещении страницы
    // useEffect(() => {
    //     loadGastronomyDishes();
    // }, [loadGastronomyDishes]);

    /**
     * Список ресторанов, отфильтрованный по городу и наличию блюд.
     *
     * Логика:
     * 1. Ресторан Smoke BBQ Лодейнопольская перемещается в начало списка
     * 2. Фильтрация по текущему городу
     * 3. Фильтрация по наличию блюд гастрономии
     */
    // const restaurantsList = useMemo(() => {
    //     let result: IRestaurant[] = [];
    //     let movableValue: IRestaurant | null = null;

    //     restaurants.forEach((restaurant) => {
    //         if (String(restaurant.id) === R.SMOKE_BBQ_SPB_LODEYNOPOLSKAYA_ID) {
    //             movableValue = restaurant;
    //         } else {
    //             result.push(restaurant);
    //         }
    //     });

    //     if (movableValue !== null) {
    //         result.unshift(movableValue);
    //     }

    //     return result
    //         .filter((restaurant) => restaurant.city.name_english === currentCity.name_english)
    //         .filter((restaurant) =>
    //             allGastronomyDishesList.some((dish) => String(dish.restaurant_id) === String(restaurant.id))
    //         );
    // }, [restaurants, currentCity, allGastronomyDishesList]);

    // Сбрасываем выбранный ресторан при смене города
    useEffect(() => {
        setCurrentRestaurant(initialRestaurant);
    }, [currentCity]);

    // Кнопка активна только при выбранном ресторане
    const isDisabledButton = currentRestaurant.value === 'unset';

    useEffect(() => {
        const restaurant = location.state?.restaurant;
        if (restaurant) {
            setCurrentRestaurant(() => ({
                value: String(restaurant.id),
                ...restaurant,
            }));
        }
    }, [location.state]);

    /**
     * Очищаем корзину при переходе на эту страницу
     */
    useEffect(() => {
        clearCart();
    }, [clearCart]);

    const goToDishesPage = () => {
        if (isDisabledButton) {
            return;
        }
        if (currentRestaurant.value !== 'unset') {
            navigate('/gastronomy/' + currentRestaurant.value);
        } 
    };

    return (
        <>
            {/* <RestaurantsListSelector
                open={open}
                setOpen={setRestaurantListSelectorIsOpen}
                value={currentRestaurant}
                onChange={setCurrentRestaurant}
                items={restaurantsList}
            /> */}
            <div className={css.container}>
                <div className={css.content}>
                    <div className={css.info}>
                        <h2>
                            Закажите праздничные <br /> блюда заранее и встретьте <br /> Новый год дома без хлопот
                        </h2>
                        {currentCity.name_english === 'moscow' ? (
                            <img
                                src={GastronomyMoscowImg}
                                alt={'New Year Gastronomy'}
                                style={{ objectFit: 'cover', objectPosition: 'bottom' }}
                            />
                        ) : (
                            <img src={GastronomyImg} alt={'New Year Gastronomy'} />
                        )}
                        <ul>
                            <li>Оформите заказ до 29 декабря.</li>
                            <li>Оплатите заказ (100% предоплата).</li>
                            <li>
                                Заберите блюда из ресторана или оформим для вас доставку {currentCity.name_english !== 'moscow' ? 'в период \n с 25 по' : ''} 31
                                декабря.
                            </li>
                        </ul>
                    </div>
                </div>
                <ContentBlock>
                    <div className={css.restaurantChoose}>
                        <HeaderContent title={'Выбор ресторана'}></HeaderContent>
                        <CitySelect titleStyle={{ fontWeight: '600' }} />
                        <DropDownSelect
                            title={
                                currentRestaurant.value !== 'unset'
                                    ? `${currentRestaurant.title}, ${currentRestaurant.address}`
                                    : 'Выберите ресторан'
                            }
                            isValid={true}
                            icon={<KitchenIcon size={24} />}
                            onClick={() => setRestaurantListSelectorIsOpen(true)}
                        />
                    </div>
                </ContentBlock>
                <BottomButtonWrapper
                    content={'Перейти к списку блюд'}
                    onClick={goToDishesPage}
                    isDisabled={isDisabledButton}
                    theme={'red'}
                />
            </div>
        </>
    );
};
