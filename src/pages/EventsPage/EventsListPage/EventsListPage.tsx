import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useOutletContext, useSearchParams } from 'react-router-dom';
import { useAtom } from 'jotai';
// Types
import { IEvent, IEventBooking, IEventBookingContext } from '@/types/events.types.ts';
// Atoms
import { currentCityAtom, setCurrentCityAtom } from '@/atoms/currentCityAtom.ts';
import { cityListAtom, ICity } from '@/atoms/cityListAtom.ts';
import { eventsListAtom } from '@/atoms/eventListAtom.ts';
import { restaurantsListAtom } from '@/atoms/restaurantsListAtom.ts';
// Components
import { EventCard } from '@/components/EventCard/EventCard.tsx';
import { RestaurantsListSelector } from '@/components/RestaurantsListSelector/RestaurantsListSelector.tsx';
import { PickerValueObj } from '@/lib/react-mobile-picker/components/Picker.tsx';
import { IConfirmationType } from '@/components/CitySelect/CitySelect.types.ts';
import { CitySelect } from '@/components/CitySelect/CitySelect.tsx';
import { DropDownSelect } from '@/components/DropDownSelect/DropDownSelect.tsx';
import { KitchenIcon } from '@/components/Icons/KitchenIcon.tsx';
// Styles
import css from '@/pages/EventsPage/EventsPage.module.css';
// Utils
import { transformToConfirmationFormat } from '@/pages/IndexPage/IndexPage.tsx';

const initialRestaurant: PickerValueObj = {
    title: 'unset',
    value: 'unset',
};

export const EventsListPage: React.FC = () => {
    const navigate = useNavigate();
    const [params] = useSearchParams();
    const [, setEventBookingInfo] = useOutletContext<IEventBookingContext>();
    // Atoms
    const [events] = useAtom<IEvent[] | null>(eventsListAtom);
    const [cityListA] = useAtom(cityListAtom);
    const [, setCurrentCityA] = useAtom(setCurrentCityAtom);
    const [currentCityA] = useAtom(currentCityAtom);
    const [restaurants] = useAtom(restaurantsListAtom);
    // States
    const [cityListConfirm] = useState<IConfirmationType[]>(
        cityListA.map((v: ICity) => transformToConfirmationFormat(v))
    );
    const [currentCityS, setCurrentCityS] = useState<IConfirmationType>(
        cityListConfirm.find((v) => v.id === currentCityA) ?? {
            id: 'moscow',
            text: 'Москва',
        }
    );
    const [restaurantListSelectorIsOpen, setRestaurantListSelectorIsOpen] = useState(false);
    const [currentRestaurant, setCurrentRestaurant] = useState<PickerValueObj>(initialRestaurant);

    // Переход на страницу деталей мероприятия
    const goToEventDetails = useCallback(
        (eventId: number) => {
            navigate(`/events/${eventId}/details`, { replace: true });
        },
        [navigate]
    );

    // Обновление текущего города
    const updateCurrentCity = useCallback(
        (city: IConfirmationType) => {
            setCurrentCityS(city);
            setCurrentCityA(city.id);
            setCurrentRestaurant(initialRestaurant);
        },
        [setCurrentCityA, setCurrentCityS, setCurrentRestaurant]
    );

    // Обновляем ресторан
    useEffect(() => {
        setEventBookingInfo(
            (prev) =>
                ({
                    ...prev,
                    restaurantId: String(currentRestaurant.value),
                }) as IEventBooking
        );
    }, [currentRestaurant, currentCityS, setEventBookingInfo]);

    // Фильтруем рестораны по выбранному городу
    const restaurantsList = useMemo(() => {
        return restaurants.filter((restaurant) => restaurant.city.name_english === currentCityS.id);
    }, [restaurants, currentCityS]);

    // Фильтруем мероприятия по выбранному ресторану и городу
    const filteredEvents = useMemo(() => {
        return events?.filter((event) => {
            if (currentRestaurant.value !== 'unset' && event.restaurant.id === Number(currentRestaurant.value)) {
                return true;
            } else if (
                currentRestaurant.value === 'unset' &&
                restaurantsList.find((restaurant) => restaurant.id === event.restaurant.id)
            ) {
                return true;
            } else {
                return false;
            }
        });
    }, [events, currentCityS, currentRestaurant, restaurantsList]);

    // Если перешли по ссылке из бота на страницу списка мероприятий в выбранном городе, то устанавливаем текущий город
    // или из бота на страницу списка мероприятий в выбранном ресторане, то устанавливаем текущий ресторан
    useEffect(() => {
        if (params.get('city')) {
            // Устанавливаем текущий город
            setCurrentCityS(
                cityListConfirm.find((v) => v.id === params.get('city')) ?? {
                    id: 'moscow',
                    text: 'Москва',
                }
            );
        }
        if (params.get('restaurant')) {
            // Устанавливаем текущий ресторан
            setCurrentRestaurant({
                title:
                    restaurants.find((restaurant) => restaurant.id === Number(params.get('restaurant')))?.title ??
                    'unset',
                address:
                    restaurants.find((restaurant) => restaurant.id === Number(params.get('restaurant')))?.address ??
                    'unset',
                value:
                    String(restaurants.find((restaurant) => restaurant.id === Number(params.get('restaurant')))?.id) ??
                    'unset',
            });
            // Устанавливаем текущий город по выбранному ресторану
            setCurrentCityS(
                cityListConfirm.find(
                    (v) =>
                        v.id ===
                        restaurants.find((restaurant) => restaurant.id === Number(params.get('restaurant')))?.city
                            .name_english
                ) ?? {
                    id: 'moscow',
                    text: 'Москва',
                }
            );
        }
    }, [params, restaurants]);
    return (
        <div className={css.cards}>
            <RestaurantsListSelector
                isOpen={restaurantListSelectorIsOpen}
                setOpen={setRestaurantListSelectorIsOpen}
                restaurant={currentRestaurant}
                selectRestaurant={setCurrentRestaurant}
                filteredRestaurants={restaurantsList}
            />
            <CitySelect
                options={cityListConfirm}
                currentValue={currentCityS}
                onChange={updateCurrentCity}
                titleStyle={{ fontWeight: '600' }}
            />
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
            {/** Если данные загружены, то показываем список мероприятий, иначе показываем 10 placeholder блоков */}
            {filteredEvents
                ? filteredEvents
                      .filter((event) => event.tickets_left > 0)
                      .map((event) => <EventCard key={event.name} {...event} onClick={goToEventDetails} />)
                : [...Array(10)].map((event, index) => <EventCard key={index} {...event} />)}
            {/** Если данныех нет или нет доступных мероприятий, то показываем сообщение о том, что мероприятий пока нет */}
            {!filteredEvents ||
                (!filteredEvents.filter((event) => event.tickets_left > 0).length && (
                    <span className={css.header_title}>Мероприятий пока нет</span>
                ))}
        </div>
    );
};
