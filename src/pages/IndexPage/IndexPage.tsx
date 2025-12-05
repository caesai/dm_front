import { FC, useEffect, useMemo, useState } from 'react';
import css from './IndexPage.module.css';
import { Page } from '@/components/Page.tsx';
import { Header } from '@/components/Header/Header.tsx';
import { OptionsNavigation } from '@/components/OptionsNavigation/OptionsNavigation.tsx';
import { RestaurantPreview } from '@/components/RestaurantPreview/RestrauntPreview.tsx';
import { BookingReminder } from '@/components/BookingReminder/BookingReminder.tsx';
import { useAtom } from 'jotai';
import { currentCityAtom, setCurrentCityAtom } from '@/atoms/currentCityAtom.ts';
import { cityListAtom, ICity } from '@/atoms/cityListAtom.ts';
import { IConfirmationType } from '@/components/ConfirmationSelect/ConfirmationSelect.types.ts';
import { CitySelect } from '@/components/CitySelect/CitySelect.tsx';
import { IBookingInfo, IRestaurant } from '@/types/restaurant.types.ts';
import { restaurantsListAtom } from '@/atoms/restaurantsListAtom.ts';
import { APIGetCurrentBookings } from '@/api/restaurants.ts';
import { authAtom, userAtom } from '@/atoms/userAtom.ts';
import { PlaceholderBlock } from '@/components/PlaceholderBlock/PlaceholderBlock.tsx';
import { Stories } from '@/components/Stories/Stories.tsx';
import { BottomButtonWrapper } from '@/components/BottomButtonWrapper/BottomButtonWrapper.tsx';
import { Link, useNavigate } from 'react-router-dom';
import { APIGetSuperEventHasAccess, APIGetTickets } from '@/api/events.ts';
import moment from 'moment';
import superevent from '/img/hh2.jpg';
import { IStoryBlock } from '@/types/stories.types.ts';
import { ApiGetStoriesBlocks } from '@/api/stories.api.ts';
import { getDataFromLocalStorage } from '@/utils.ts';
import { mockNewSelfEdgeChinoisRestaurant } from '@/__mocks__/restaurant.mock';
import { APIGetGastronomyDishes } from '@/api/gastronomy.api';
import { allGastronomyDishesListAtom } from '@/atoms/dishesListAtom';

export const transformToConfirmationFormat = (v: ICity): IConfirmationType => {
    return {
        id: v.name_english,
        text: v.name,
    };
};

export const IndexPage: FC = () => {
    const [currentCityA] = useAtom(currentCityAtom);
    const [user] = useAtom(userAtom);
    const [, setCurrentCityA] = useAtom(setCurrentCityAtom);
    const [cityListA] = useAtom(cityListAtom);
    const [cityListConfirm] = useState<IConfirmationType[]>(
        cityListA.map((v: ICity) => transformToConfirmationFormat(v))
    );
    const [, setAllGastronomyDishesList] = useAtom(allGastronomyDishesListAtom);
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
    // const tg_id = window.Telegram.WebApp.initDataUnsafe.user.id;
    const [hasSuperEventAccess, setHasSuperEventAccess] = useState(false);
    const [storiesBlocks, setStoriesBlocks] = useState<IStoryBlock[]>([]);

    const want_first = getDataFromLocalStorage('want_first');

    useEffect(() => {
        if (!auth?.access_token) {
            return;
        }
        setCurrentBookingsLoading(true);

        // Запрашиваем текущие бронирования и билеты
        // объединяем в один массив чтобы отображать их в одном списке
        Promise.all([APIGetCurrentBookings(auth.access_token), APIGetTickets(auth.access_token)])
            .then((responses) => {
                // TODO: доделать типизацию
                // @ts-expect-error
                const events: IBookingInfo[] = responses[1].data.map((event) => {
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
                    };
                });
                const bookings = [...events, ...responses[0].data.currentBookings];
                setCurrentBookings(bookings);
            })
            .finally(() => {
                setCurrentBookingsLoading(false);
            });
        // Запрашиваем доступ к спец-событию
        APIGetSuperEventHasAccess(auth.access_token).then((response) => {
            setHasSuperEventAccess(response.data);
        });
    }, []);

    const cityId = cityListA.find((item) => item.name_english === currentCityS.id)?.id ?? 1;

    // Запрашиваем блоки историй для текущего города
    useEffect(() => {
        if (auth?.access_token !== undefined && cityId !== undefined) {
            ApiGetStoriesBlocks(auth?.access_token, cityId).then((storiesBlockResponse) => {
                const stories = storiesBlockResponse.data.filter((s) => {
                    return s.stories.length > 0;
                });
                setStoriesBlocks(stories);
            });
        }
    }, [cityId]);

    // Устанавливаем текущий город в state по умлочанию Москва
    useEffect(() => {
        setCurrentCityS(
            cityListConfirm.find((v) => v.id == currentCityA) ?? {
                id: 'moscow',
                text: 'Москва',
            }
        );
    }, [cityListA]);

    // Эффект фильтрации и сортировки списка ресторанов по городу
    // и добавления мока ресторана в Санкт-Петербург если это первый запуск приложения
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
        const filteredRestaurantsByCity = result.filter((v) => v.city.name_english == currentCityA);

        const restaurantsListWithMock =
            currentCityA === 'spb' && !wantFirstParsed?.done
                ? [mockNewSelfEdgeChinoisRestaurant, ...filteredRestaurantsByCity]
                : filteredRestaurantsByCity;

        setRestaurantsList(restaurantsListWithMock);
    }, [currentCityA, cityListA]);

    // Устанвливаем счетчик посещений, чтобы на третьем посещении пользователь попал на страницу предпочтений
    useEffect(() => {
        const preferencesStatus = JSON.parse(localStorage.getItem('PREFERENCES_STATUS') as string);

        if (!user?.license_agreement || !user.complete_onboarding || !user?.phone_number) return;

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
    }, [navigate, user?.license_agreement, user?.complete_onboarding, user?.phone_number]);

    /**
     * Вызываем API для получения списка всех блюд во всех ресторанах
     * и по этому списку фильтруем рестораны, которые имеют блюда
     * и устанавливаем их в restaurantsList
     */
    useEffect(() => {
        if (!auth?.access_token) {
            return;
        }
        APIGetGastronomyDishes(auth?.access_token)
            .then((res) => {
                setAllGastronomyDishesList(res.data);
            })
            .catch((err) => {
                console.error(err);
            });
    }, [auth?.access_token]);

    const updateCurrentCity = (city: IConfirmationType) => {
        setCurrentCityS(city);
        setCurrentCityA(city.id);
    };

    const cityOptions = useMemo(
        () => cityListConfirm.filter((v) => v.id !== currentCityS.id),
        [cityListConfirm, currentCityS.id]
    );

    // Получаем статус первого запуска приложения и если это первый запуск, то добавляем мок ресторана в Санкт-Петербург
    // Проверяем нажал ли пользователь на кнопку "Хочу быть первым"
    let wantFirstParsed: any = {};

    try {
        wantFirstParsed = JSON.parse(String(want_first));
    } catch (e) {
        wantFirstParsed = {};
    }

    return (
        <Page back={false}>
            <div className={css.pageContainer}>
                <Header />
                <Stories storiesBlocks={storiesBlocks} />
                <div style={{ marginRight: 15 }}>
                    <CitySelect options={cityOptions} currentValue={currentCityS} onChange={updateCurrentCity} />
                </div>
                {currentBookingsLoading ? (
                    <div style={{ marginRight: '15px' }}>
                        <PlaceholderBlock width={'100%'} height={'108px'} rounded={'16px'} />
                    </div>
                ) : (
                    currentBookings
                        .filter((book) => {
                            return (
                                new Date(new Date().setUTCHours(0, 0, 0, 0)).getTime() <=
                                new Date(book.booking_date).getTime()
                            );
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
                    <div style={{ marginRight: 15, height: 85 }}>
                        <Link to={'/events/super'}>
                            <img
                                src={superevent}
                                style={{ maxWidth: '100%', width: '100%', borderRadius: 16 }}
                                alt={''}
                            />
                        </Link>
                    </div>
                )}

                <OptionsNavigation cityId={cityId}/>

                <div className={css.restaurants}>
                    {restaurantsList.map((rest) => (
                        <RestaurantPreview restaurant={rest} key={`rest-${rest.id}`} clickable />
                    ))}
                </div>
            </div>
            {currentCityA !== 'ekb' && <BottomButtonWrapper onClick={() => navigate('/booking/')} />}
        </Page>
    );
};
