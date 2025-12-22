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
import { R } from '@/__mocks__/restaurant.mock.ts';
// Utils
import { transformToConfirmationFormat } from '@/pages/IndexPage/IndexPage.tsx';
// Styles
import css from '@/components/RestaurantsList/RestaurantsList.module.css';

interface IRestaurantsListProps {
    titleStyle?: CSSProperties;
}

export const RestaurantsList: React.FC<IRestaurantsListProps> = ({ titleStyle }) => {
    const [cityListA] = useAtom(cityListAtom);
    const [currentCityA] = useAtom(currentCityAtom);
    const [restaurants] = useAtom(restaurantsListAtom);
    const [, setCurrentCityA] = useAtom(setCurrentCityAtom);
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
        // Фильтруем рестораны по городу
        result = result.filter((v) => v.city.name_english == currentCityA);
        setRestaurantsList(result);
    }, [currentCityA, cityListA]);

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
