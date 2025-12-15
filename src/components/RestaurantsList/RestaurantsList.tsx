import React, { CSSProperties, useEffect, useMemo, useState } from 'react';
import { useAtom } from 'jotai/index';
// Types
import { IRestaurant } from '@/types/restaurant.types.ts';
// Atoms
import { restaurantsListAtom } from '@/atoms/restaurantsListAtom.ts';
import { cityListAtom, ICity } from '@/atoms/cityListAtom.ts';
import { currentCityAtom, setCurrentCityAtom } from '@/atoms/currentCityAtom.ts';
// Components
import { CitySelect } from '@/components/CitySelect/CitySelect.tsx';
import { IConfirmationType } from '@/components/ConfirmationSelect/ConfirmationSelect.types.ts';
import { RestaurantPreview } from '@/components/RestaurantPreview/RestrauntPreview.tsx';
// Mocks
import { mockNewSelfEdgeChinoisRestaurant, R } from '@/__mocks__/restaurant.mock';
// Utils
import { transformToConfirmationFormat } from '@/pages/IndexPage/IndexPage.tsx';
// Styles
import css from '@/components/RestaurantsList/RestaurantsList.module.css';
import { isUserInGuestListAtom } from '@/atoms/userAtom';
import { isUserInTestGroup } from '@/utils';

interface IRestaurantsListProps {
    titleStyle?: CSSProperties;
}

export const RestaurantsList: React.FC<IRestaurantsListProps> = ({ titleStyle }) => {
    const [cityListA] = useAtom(cityListAtom);
    const [currentCityA] = useAtom(currentCityAtom);
    const [restaurants] = useAtom(restaurantsListAtom);
    const [, setCurrentCityA] = useAtom(setCurrentCityAtom);
    const [isUserInGuestList] = useAtom(isUserInGuestListAtom);
    const [cityListConfirm] = useState<IConfirmationType[]>(
        cityListA.map((v: ICity) => transformToConfirmationFormat(v))
    );

    const [restaurantsList, setRestaurantsList] = useState<IRestaurant[]>([]);

    const [currentCityS, setCurrentCityS] = useState<IConfirmationType>(
        cityListConfirm.find((v) => v.id == currentCityA) ?? {
            id: 'moscow',
            text: 'Москва',
        }
    );

    useEffect(() => {
        let result: IRestaurant[] = [];
        let movableValue = null;

        restaurants.map((e) => {
            if (e.id !== Number(R.SELF_EDGE_SPB_CHINOIS_ID)) {
                result.push(e);
            } else if (e.id === Number(R.SELF_EDGE_SPB_CHINOIS_ID)) {
                movableValue = e;
            }
        });

        if (movableValue !== null) {
            result.unshift(movableValue);
        }
        result = result.filter((v) => v.city.name_english == currentCityA);
        const filterDoubledMockRestaurant = [mockNewSelfEdgeChinoisRestaurant, ...result].filter((v) => {
            // Если город Санкт-Петербург и пользователь не нажимал на кнопку "Хочу быть первым", то добавляем мок ресторан в Санкт-Петербург
            if (currentCityA === 'spb') {
                if (!isUserInGuestList && !isUserInTestGroup) {
                    // Если не в гест листе и не в тестовой группе то ресторан SELF_EDGE_SPB_CHINOIS_ID не показываем
                    return v.id !== Number(R.SELF_EDGE_SPB_CHINOIS_ID);
                } else {
                    // Если в гест листе или в тестовой группе то ресторан SELF_EDGE_SPB_CHINOIS_ID показываем
                    return true;
                }
            } else {
                // Если не Санкт-Петербург то показываем все рестораны
                return true;
            }
        });
        setRestaurantsList(filterDoubledMockRestaurant);
    }, [currentCityA, cityListA, isUserInGuestList, isUserInTestGroup]);

    const updateCurrentCity = (city: IConfirmationType) => {
        setCurrentCityS(city);
        setCurrentCityA(city.id);
    };

    const cityOptions = useMemo(
        () => cityListConfirm.filter((v) => v.id !== currentCityS.id),
        [cityListConfirm, currentCityS.id]
    );

    useEffect(() => {
        setCurrentCityS(
            cityListConfirm.find((v) => v.id == currentCityA) ?? {
                id: 'moscow',
                text: 'Москва',
            }
        );
    }, [cityListA]);

    return (
        <div className={css.container}>
            <div style={{ marginRight: 15 }}>
                <CitySelect
                    options={cityOptions}
                    currentValue={currentCityS}
                    onChange={updateCurrentCity}
                    titleStyle={titleStyle}
                />
            </div>
            <div className={css.restaurants}>
                {restaurantsList.map((rest) => (
                    <RestaurantPreview restaurant={rest} key={`rest-${rest.id}`} />
                ))}
            </div>
        </div>
    );
};
