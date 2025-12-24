import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAtom } from 'jotai';
import moment from 'moment';
// API's
import { APIGetCurrentBookings } from '@/api/restaurants.api.ts';
import { ApiGetStoriesBlocks } from '@/api/stories.api.ts';
import { APIGetTickets } from '@/api/events.api.ts';
// import { DEV_MODE } from '@/api/base.ts';
// Types
import { IStoryBlock } from '@/types/stories.types.ts';
import { IBookingInfo, IRestaurant } from '@/types/restaurant.types.ts';
// Atoms
import { restaurantsListAtom } from '@/atoms/restaurantsListAtom.ts';
import { authAtom, userAtom } from '@/atoms/userAtom.ts';
import { cityListAtom, ICity } from '@/atoms/cityListAtom.ts';
import { currentCityAtom, setCurrentCityAtom } from '@/atoms/currentCityAtom.ts';
// Components
import { Page } from '@/components/Page.tsx';
import { Header } from '@/components/Header/Header.tsx';
import { OptionsNavigation } from '@/components/OptionsNavigation/OptionsNavigation.tsx';
import { RestaurantPreview } from '@/components/RestaurantPreview/RestrauntPreview.tsx';
import { BookingReminder } from '@/components/BookingReminder/BookingReminder.tsx';
import { IConfirmationType } from '@/components/ConfirmationSelect/ConfirmationSelect.types.ts';
import { CitySelect } from '@/components/CitySelect/CitySelect.tsx';
import { Stories } from '@/components/Stories/Stories.tsx';
import { BottomButtonWrapper } from '@/components/BottomButtonWrapper/BottomButtonWrapper.tsx';
// Mocks
import { R } from '@/__mocks__/restaurant.mock.ts';
// Styles
import css from '@/pages/IndexPage/IndexPage.module.css';
// Images
// import superevent from '/img/hh2.jpg';

export const transformToConfirmationFormat = (v: ICity): IConfirmationType => {
    return {
        id: v.name_english,
        text: v.name,
    };
};

export const IndexPage: React.FC = () => {
    const navigate = useNavigate();
    // Atoms
    const [currentCityA] = useAtom(currentCityAtom);
    const [user] = useAtom(userAtom);
    const [auth] = useAtom(authAtom);
    const [, setCurrentCityA] = useAtom(setCurrentCityAtom);
    const [cityListA] = useAtom(cityListAtom);
    const [restaurants] = useAtom(restaurantsListAtom);
    // States
    const [cityListConfirm] = useState<IConfirmationType[]>(
        cityListA.map((v: ICity) => transformToConfirmationFormat(v))
    );
    const [currentCityS, setCurrentCityS] = useState<IConfirmationType>(
        cityListConfirm.find((v) => v.id == currentCityA) ?? {
            id: 'moscow',
            text: 'Москва',
        }
    );
    const [currentBookings, setCurrentBookings] = useState<IBookingInfo[] | null>(null);
    const [storiesBlocks, setStoriesBlocks] = useState<IStoryBlock[] | null>(null);
    const [restaurantsList, setRestaurantsList] = useState<IRestaurant[] | null>(null);

    /**
     * Эффект для инициализации данных страницы.
     *
     * Выполняет следующие действия:
     * 1. Проверяет наличие токена доступа.
     * 2. Загружает текущие бронирования и билеты пользователя.
     * 3. Объединяет бронирования и билеты в общий список для отображения.
     * 4. Проверяет доступ пользователя к спец-событиям.
     */
    useEffect(() => {
        if (!auth?.access_token) {
            return;
        }
        // Запрашиваем текущие бронирования и билеты
        // объединяем в один массив чтобы отображать их в одном списке
        Promise.all([APIGetCurrentBookings(auth.access_token), APIGetTickets(auth.access_token)])
            .then((responses) => {
                const events: IBookingInfo[] = responses[1].data.map((event) => {
                    return {
                        id: event.id,
                        booking_type: 'event',
                        booking_date: moment(event.date_start).format('YYYY-MM-DD'),
                        time: moment(event.date_start).format('HH:mm'),
                        restaurant: event.restaurant,
                        tags: '',
                        duration: 0,
                        guests_count: event.guest_count,
                        children_count: 0,
                        event_title: event.event_title,
                        booking_status: 'confirmed',
                        user_comments: '',
                        certificate_value: 0,
                        certificate_expired_at: '',
                    };
                });
                const bookings = [...events, ...responses[0].data.currentBookings];
                setCurrentBookings(bookings);
            })
            .catch((error) => {
                console.error(error);
                // Кладем пустой массив, чтобы не было ошибки при рендере
                // и блок не отображался
                setCurrentBookings([]);
            });
    }, []);

    const cityId = cityListA.find((item) => item.name_english === currentCityS.id)?.id ?? 1;

    // Запрашиваем блоки историй для текущего города
    useEffect(() => {
        if (auth?.access_token !== undefined && cityId !== undefined) {
            ApiGetStoriesBlocks(auth?.access_token, cityId)
                .then((storiesBlockResponse) => {
                    const stories = storiesBlockResponse.data.filter((s) => {
                        return s.stories.length > 0;
                    });
                    setStoriesBlocks(stories);
                })
                .catch((error) => {
                    console.error(error);
                });
        }
    }, [cityId, auth?.access_token]);

    // Устанавливаем текущий город в state по умолчанию Москва
    useEffect(() => {
        setCurrentCityS(
            cityListConfirm.find((v) => v.id == currentCityA) ?? {
                id: 'moscow',
                text: 'Москва',
            }
        );
    }, [cityListA]);

    // Эффект фильтрации и сортировки списка ресторанов по городу
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
            // Ставим первым в списке ресторан SELF_EDGE_SPB_CHINOIS_ID
            result.unshift(movableValue);
        }

        // Фильтруем рестораны по городу
        const filteredRestaurantsByCity = result.filter((v) => v.city.name_english == currentCityA);
        setRestaurantsList(filteredRestaurantsByCity);
    }, [currentCityA, cityListA, restaurants]);

    // Устнавливаем счетчик посещений, чтобы на третьем посещении пользователь попал на страницу предпочтений
    useEffect(() => {
        const preferencesStatus = JSON.parse(localStorage.getItem('PREFERENCES_STATUS') as string);

        if (!user?.complete_onboarding || !user?.phone_number) return;

        if (!preferencesStatus) {
            localStorage.setItem('PREFERENCES_STATUS', JSON.stringify({ visit_number: 1 }));
            return;
        }

        const { visit_number } = preferencesStatus;

        if (visit_number === 1) {
            localStorage.setItem('PREFERENCES_STATUS', JSON.stringify({ visit_number: 2 }));
            return;
        }

        if (visit_number === 2) {
            localStorage.setItem('PREFERENCES_STATUS', JSON.stringify({ visit_number: 3, preferences_sent: false }));
            navigate('/preferences/1');
            return;
        }
    }, [navigate, user?.complete_onboarding, user?.phone_number]);

    const updateCurrentCity = (city: IConfirmationType) => {
        setCurrentCityS(city);
        setCurrentCityA(city.id);
    };

    const cityOptions = useMemo(
        () => cityListConfirm.filter((v) => v.id !== currentCityS.id),
        [cityListConfirm, currentCityS.id]
    );

    return (
        <Page back={false}>
            <div className={css.pageContainer}>
                <Header />
                <Stories storiesBlocks={storiesBlocks} />
                <div style={{ marginRight: 15 }}>
                    <CitySelect options={cityOptions} currentValue={currentCityS} onChange={updateCurrentCity} />
                </div>
                <BookingReminder bookings={currentBookings} />
                {/* Отображаем блок с супер-мероприятием только для пользователей с разрешением hospitality_heroes */}
                {/* {DEV_MODE && user?.permissions.includes('hospitality_heroes') && (
                    <div style={{ marginRight: 15, height: 85 }}>
                        <Link to={'/privelegies'}>
                            <img
                                src={superevent}
                                style={{ maxWidth: '100%', width: '100%', borderRadius: 16 }}
                                alt={''}
                            />
                        </Link>
                    </div>
                )} */}
                <OptionsNavigation cityId={cityId} isLoading={!restaurantsList} />
                <div className={css.restaurants}>
                    {restaurantsList?.map((rest) => (
                        <RestaurantPreview restaurant={rest} key={`rest-${rest.id}`} clickable />
                    ))}
                </div>
            </div>
            {currentCityA !== 'ekb' && <BottomButtonWrapper onClick={() => navigate('/booking/')} />}
        </Page>
    );
};
