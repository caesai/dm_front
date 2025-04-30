import { FC, useEffect, useState } from 'react';
import css from './IndexPage.module.css';

import { Page } from '@/components/Page.tsx';
import { Header } from '@/components/Header/Header.tsx';
import { OptionsNavigation } from '@/components/OptionsNavigation/OptionsNavigation.tsx';
import { RestaurantPreview } from '@/components/RestaurantPreview/RestrauntPreview.tsx';
import { BookingReminder } from '@/components/BookingReminder/BookingReminder.tsx';
import { useAtom } from 'jotai';
import {
    currentCityAtom,
    setCurrentCityAtom,
} from '@/atoms/currentCityAtom.ts';
import { cityListAtom, ICity } from '@/atoms/cityListAtom.ts';
import { IConfirmationType } from '@/components/ConfirmationSelect/ConfirmationSelect.types.ts';
import { CitySelect } from '@/components/CitySelect/CitySelect.tsx';
import { IBookingInfo, IRestaurant } from '@/types/restaurant.ts';
import { restaurantsListAtom } from '@/atoms/restaurantsListAtom.ts';
import { APIGetCurrentBookings } from '@/api/restaurants.ts';
import { authAtom } from '@/atoms/userAtom.ts';
import { PlaceholderBlock } from '@/components/PlaceholderBlock/PlaceholderBlock.tsx';

const transformToConfirmationFormat = (v: ICity): IConfirmationType => {
    return {
        id: v.name_english,
        text: v.name,
    };
};

export const IndexPage: FC = () => {
    // Пиздец говно. Такого кала я еще не писал никогда.
    // Скорее всего это можно переписать в 2 строки, но я слишком пьян и уже ничего не понимаю.
    const [currentCityA] = useAtom(currentCityAtom);
    const [, setCurrentCityA] = useAtom(setCurrentCityAtom);
    const [cityListA] = useAtom(cityListAtom);
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
    const [restaurants] = useAtom(restaurantsListAtom);
    const [auth] = useAtom(authAtom);

    const [currentBookings, setCurrentBookings] = useState<IBookingInfo[]>([]);
    const [currentBookingsLoading, setCurrentBookingsLoading] = useState(true);

    useEffect(() => {
        if (!auth?.access_token) {
            return;
        }
        setCurrentBookingsLoading(true);
        APIGetCurrentBookings(auth.access_token)
            .then((res) => setCurrentBookings(res.data.currentBookings))
            .finally(() => setCurrentBookingsLoading(false));
    }, []);

    useEffect(() => {
        setCurrentCityS(
            cityListConfirm.find((v) => v.id == currentCityA) ?? {
                id: 'moscow',
                text: 'Москва',
            }
        );
    }, [cityListA]);

    useEffect(() => {
        setRestaurantsList(
            restaurants.filter((v) => v.city.name_english == currentCityA)
        );
    }, [currentCityA, cityListA]);

    const updateCurrentCity = (city: IConfirmationType) => {
        setCurrentCityS(city);
        setCurrentCityA(city.id);
    };

    return (
        <Page back={false}>
            <div className={css.pageContainer}>
                <Header />
                {currentBookingsLoading ? (
                    <div style={{ marginRight: '15px' }}>
                        <PlaceholderBlock
                            width={'100%'}
                            height={'108px'}
                            rounded={'16px'}
                        />
                    </div>
                ) : (
                    currentBookings.map((book) => (
                        <BookingReminder
                            key={book.id}
                            id={book.id}
                            title={book.restaurant.title}
                            address={book.restaurant.address}
                            date={book.booking_date}
                            time={book.time}
                            persons={book.guests_count}
                        />
                    ))
                )}
                {/*<NewsStories />*/}
                <OptionsNavigation />
                <div className={css.restaurants}>
                    <CitySelect
                        options={cityListConfirm}
                        currentValue={currentCityS}
                        onChange={updateCurrentCity}
                    />
                    {restaurantsList.map((rest) => (
                        <RestaurantPreview
                            restaurant={rest}
                            key={`rest-${rest.id}`}
                        />
                    ))}
                </div>
            </div>
        </Page>
    );
};
