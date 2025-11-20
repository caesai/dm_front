import { CSSProperties, FC, useEffect, useMemo, useState } from 'react';
import css from './RestaurantsList.module.css';
import { RestaurantPreview } from '@/components/RestaurantPreview/RestrauntPreview.tsx';
import newres from '/img/chinois_app.png';
import { useAtom } from 'jotai/index';
import { currentCityAtom, setCurrentCityAtom } from '@/atoms/currentCityAtom.ts';
import { IRestaurant } from '@/types/restaurant.ts';
import { getDataFromLocalStorage } from '@/utils.ts';
import { restaurantsListAtom } from '@/atoms/restaurantsListAtom.ts';
import { cityListAtom, ICity } from '@/atoms/cityListAtom.ts';
import { CitySelect } from '@/components/CitySelect/CitySelect.tsx';
import { IConfirmationType } from '@/components/ConfirmationSelect/ConfirmationSelect.types.ts';
import { transformToConfirmationFormat } from '@/pages/IndexPage/IndexPage.tsx';

interface IRestaurantsListProps {
    titleStyle?: CSSProperties;
}

export const RestaurantsList: FC<IRestaurantsListProps> = ({ titleStyle }) => {
    const [cityListA] = useAtom(cityListAtom);
    const [currentCityA] = useAtom(currentCityAtom);
    const [restaurants] = useAtom(restaurantsListAtom);
    const [, setCurrentCityA] = useAtom(setCurrentCityAtom);
    const [cityListConfirm] = useState<IConfirmationType[]>(
        cityListA.map((v: ICity) => transformToConfirmationFormat(v)),
    );

    const [restaurantsList, setRestaurantsList] = useState<IRestaurant[]>([]);

    const [currentCityS, setCurrentCityS] = useState<IConfirmationType>(
        cityListConfirm.find((v) => v.id == currentCityA) ?? {
            id: 'moscow',
            text: 'Москва',
        },
    );

    const want_first = getDataFromLocalStorage('want_first');

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

        setRestaurantsList(
            result.filter((v) => v.city.name_english == currentCityA),
        );
    }, [currentCityA, cityListA]);

    const updateCurrentCity = (city: IConfirmationType) => {
        setCurrentCityS(city);
        setCurrentCityA(city.id);
    };

    const cityOptions = useMemo(
        () => cityListConfirm.filter(v => v.id !== currentCityS.id),
        [cityListConfirm, currentCityS.id],
    );

    let wantFirstParsed: any = {};

    try {
        wantFirstParsed = JSON.parse(String(want_first));
    } catch (e) {
        wantFirstParsed = {};
    }

    const restaurantListed = (currentCityA === 'spb' && !wantFirstParsed?.done) ? [{
        'id': 12,
        'title': 'Self Edge Chinois',
        'slogan': 'Современная Азия с акцентом на Китай и культовый raw bar',
        'address': 'Санкт-Петербург, ул. Добролюбова, 11',
        'logo_url': '',
        'thumbnail_photo': newres,
        'avg_cheque': 3000,
        'about_text': '',
        'about_dishes': 'Европейская',
        'about_kitchen': 'Американская',
        'about_features': '',
        'phone_number': '',
        'address_lonlng': '',
        'address_station': '',
        'address_station_color': '',
        'city': {
            'id': 2,
            'name': 'Санкт-Петербург',
            'name_english': 'spb',
            'name_dative': 'Санкт-Петербурге',
        },
        'gallery': [],
        'brand_chef': {},
        'worktime': [],
        'menu': [],
        'menu_imgs': [],
        'socials': [],
        'photo_cards': [],
    }, ...restaurantsList] : restaurantsList;

    useEffect(() => {
        setCurrentCityS(
            cityListConfirm.find((v) => v.id == currentCityA) ?? {
                id: 'moscow',
                text: 'Москва',
            },
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
                {restaurantListed.map((rest) => (
                    <RestaurantPreview
                        // @ts-ignore
                        restaurant={rest}
                        key={`rest-${rest.id}`}
                    />
                ))}
            </div>
        </div>
    );
}

