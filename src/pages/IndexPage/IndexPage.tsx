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
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { APIGetSuperEventHasAccess, APIGetTickets } from '@/api/events.ts';
import moment from 'moment';
import superevent from '/img/hh2.jpg';
import newres from '/img/chinois_app.png';
import { mockEventsUsersList } from '@/__mocks__/events.mock.ts';
import { Toast } from '@/components/Toast/Toast.tsx';

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
    const [hasSuperEventAccess, setHasSuperEventAccess] = useState(false);
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [toastShow, setToastShow] = useState<boolean>(false);

    const location = useLocation();
    const isBanquet = location.state?.banquet;

    useEffect(() => {
        if (!auth?.access_token) {
            return;
        }
        setCurrentBookingsLoading(true);
        // APIGetCurrentBookings(auth.access_token)
        //     .then((res) => setCurrentBookings(res.data.currentBookings))
        //     .finally(() => setCurrentBookingsLoading(false));
        // APIGetTickets(auth.access_token)
        //     .then((res) => setTickets(res.data))
        //     .finally(() => setEventsLoading(false));
        Promise.all([APIGetCurrentBookings(auth.access_token),APIGetTickets(auth.access_token)])
            .then((responses) => {
                // console.log('responses: ', responses);
                // @ts-expect-error
                const events: IBookingInfo[] = responses[1].data.map((event) =>
                {
                    return {
                        id: event.id,
                        booking_type: 'event',
                        booking_date: moment(event.date_start).format('YYYY-MM-DD'),
                        time: moment(event.date_start).format('HH:mm'),
                        restaurant: event.restaurant,
                        tags: null,
                        duration: 0,
                        guests_count: event.guest_count,
                        children_count: 0,
                        event_title: event.event_title,
                    }
                }
                );
                const bookings = [...events, ...responses[0].data.currentBookings];
                setCurrentBookings(bookings);
            })
            .finally(() => {
                setCurrentBookingsLoading(false);
            });
        APIGetSuperEventHasAccess(auth.access_token).then((response) => {
                setHasSuperEventAccess(response.data);
        })
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

    useEffect(() => {
        if (isBanquet) {
            setToastShow(true);
            setToastMessage('Запрос на бронирование банкета успешен. С вами свяжутся наши менеджеры.');
            setTimeout(() => {
                setToastShow(false);
                setToastMessage(null);
            }, 3000);
        }
    }, [isBanquet]);

    const updateCurrentCity = (city: IConfirmationType) => {
        setCurrentCityS(city);
        setCurrentCityA(city.id);
    };

    const cityOptions = useMemo(
        () => cityListConfirm.filter(v => v.id !== currentCityS.id),
        [cityListConfirm, currentCityS.id]
    );
    const restaurantListed = (currentCityA === 'spb' && tg_id && mockEventsUsersList.includes(tg_id)) ? [{
        "id": 12,
        "title": "Self Edge Chinois",
        "slogan": "Современная Азия с акцентом на Китай и культовый raw bar",
        "address": "Санкт-Перербург, ул. Добролюбова, 11",
        "logo_url": "",
        "thumbnail_photo": newres,
        "avg_cheque": 3000,
        "about_text": "",
        "about_dishes": "Европейская",
        "about_kitchen": "Американская",
        "about_features": "",
        "phone_number": "",
        "address_lonlng": "",
        "address_station": "",
        "address_station_color": "",
        "city": {
            "id": 2,
            "name": "Санкт-Петербург",
            "name_english": "spb",
            "name_dative": "Санкт-Петербурге"
        },
        "gallery": [],
        "brand_chef": {},
        "worktime": [],
        "menu": [],
        "menu_imgs": [],
        "socials": [],
        "photo_cards": []
    },...restaurantsList] : restaurantsList;
    // @ts-ignore
    return (
        <Page back={false}>
            <div className={css.pageContainer}>
                <Header/>
                {tg_id && [84327932, 115555014, 118832541, 153495524, 163811519, 456052969, 244983015].includes(tg_id) &&  <Stories token={auth?.access_token} cityId={cityListA.find(item => item.name_english === currentCityS.id)?.id} />}
                <CitySelect
                    options={cityOptions}
                    currentValue={currentCityS}
                    onChange={updateCurrentCity}
                />
                {currentBookingsLoading ? (
                    <div style={{marginRight: '15px'}}>
                        <PlaceholderBlock
                            width={'100%'}
                            height={'108px'}
                            rounded={'16px'}
                        />
                    </div>
                ) : (
                    currentBookings
                        .filter((book) => {
                            return new Date(new Date().setUTCHours(0, 0, 0, 0)).getTime() <= new Date(book.booking_date).getTime()
                        })
                        .map((book) => (
                            <BookingReminder
                                key={book.id}
                                id={book.id}
                                title={book.restaurant.title}
                                address={book.restaurant.address}
                                date={book.booking_date}
                                time={book.time}
                                persons={book.guests_count}
                                children={book.children_count}
                                booking_type={book.booking_type}
                                event_title={book.event_title}
                            />
                        ))
                )}
                {hasSuperEventAccess && (
                    <div style={{ marginRight: 15, height: 85}}>
                        <Link to={'/events/super'}>
                            <img src={superevent} style={{ maxWidth: '100%', width: '100%', borderRadius: 16 }} alt={''} />
                        </Link>
                    </div>
                )}
                <OptionsNavigation/>


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
            {currentCityA !== 'ekb' && <BottomButtonWrapper onClick={() => navigate('/booking/')}/>}
            <Toast message={toastMessage} showClose={toastShow} />
        </Page>
    );
};
