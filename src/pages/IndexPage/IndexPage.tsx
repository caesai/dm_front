import {FC, useEffect, useMemo, useState} from 'react';
import css from './IndexPage.module.css';

import {Page} from '@/components/Page.tsx';
import {Header} from '@/components/Header/Header.tsx';
import {OptionsNavigation} from '@/components/OptionsNavigation/OptionsNavigation.tsx';
import {RestaurantPreview} from '@/components/RestaurantPreview/RestrauntPreview.tsx';
import {BookingReminder} from '@/components/BookingReminder/BookingReminder.tsx';
import {useAtom} from 'jotai';
import {
    currentCityAtom,
    setCurrentCityAtom,
} from '@/atoms/currentCityAtom.ts';
import {cityListAtom, ICity} from '@/atoms/cityListAtom.ts';
import {IConfirmationType} from '@/components/ConfirmationSelect/ConfirmationSelect.types.ts';
import {CitySelect} from '@/components/CitySelect/CitySelect.tsx';
import {IBookingInfo, IRestaurant} from '@/types/restaurant.ts';
import {restaurantsListAtom} from '@/atoms/restaurantsListAtom.ts';
import {APIGetCurrentBookings} from '@/api/restaurants.ts';
import {authAtom} from '@/atoms/userAtom.ts';
import {PlaceholderBlock} from '@/components/PlaceholderBlock/PlaceholderBlock.tsx';
import {Stories} from "@/components/Stories/Stories.tsx";
// import {DEV_MODE} from "@/api/base.ts";
import { BottomButtonWrapper } from '@/components/BottomButtonWrapper/BottomButtonWrapper.tsx';
import { useNavigate } from 'react-router-dom';

const transformToConfirmationFormat = (v: ICity): IConfirmationType => {
    return {
        id: v.name_english,
        text: v.name,
    };
};

export const IndexPage: FC = () => {
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
    const navigate = useNavigate();
    const tg_id = window.Telegram.WebApp.initDataUnsafe.user.id;

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
        let result: IRestaurant[] =[];
        let movableValue=null;

        restaurants.map((e)=>{
            if(e.id !== 11){
                result.push(e);
            }else if(e.id === 11){
                movableValue=e;
            }
        })

        if(movableValue!==null){
            result.unshift(movableValue);
        }

        setRestaurantsList(
            result.filter((v) => v.city.name_english == currentCityA)
        );
    }, [currentCityA, cityListA]);

    const updateCurrentCity = (city: IConfirmationType) => {
        setCurrentCityS(city);
        setCurrentCityA(city.id);
    };

    const cityOptions = useMemo(
        () => cityListConfirm.filter(v => v.id !== currentCityS.id),
        [cityListConfirm, currentCityS.id]
    );
    console.log('tg_id: ', tg_id);
    return (
        <Page back={false}>
            <div className={css.pageContainer}>
                <Header/>
                {tg_id && [84327932, 115555014, 118832541, 153495524].includes(tg_id) &&  <Stories token={auth?.access_token} cityId={cityListA.find(item => item.name_english === currentCityS.id)?.id} />}
                {currentBookingsLoading ? (
                    <div style={{marginRight: '15px'}}>
                        <PlaceholderBlock
                            width={'100%'}
                            height={'108px'}
                            rounded={'16px'}
                        />
                    </div>
                ) : (
                    currentBookings.filter((book) => {
                        return new Date(new Date().setUTCHours(0, 0, 0, 0)).getTime() <= new Date(book.booking_date).getTime()
                    }).map((book) => (
                        <BookingReminder
                            key={book.id}
                            id={book.id}
                            title={book.restaurant.title}
                            address={book.restaurant.address}
                            date={book.booking_date}
                            time={book.time}
                            persons={book.guests_count}
                            children={book.children_count}
                        />
                    ))
                )}
                <OptionsNavigation/>
                <div className={css.restaurants}>
                    <CitySelect
                        options={cityOptions}
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
            {currentCityA !== 'ekb' && <BottomButtonWrapper onClick={() => navigate('/booking/')}/>}
        </Page>
    );
};
