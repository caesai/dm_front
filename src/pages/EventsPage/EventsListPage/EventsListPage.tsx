import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useOutletContext, useSearchParams } from 'react-router-dom';
import { useAtomValue, useSetAtom } from 'jotai';
// Types
import { IEvent, IEventBooking, IEventBookingContext } from '@/types/events.types.ts';
// Atoms
import { eventsListAtom } from '@/atoms/eventListAtom.ts';
import { restaurantsListAtom } from '@/atoms/restaurantsListAtom.ts';
import { cityListAtom, getCurrentCity, setCurrentCityAtom } from '@/atoms/cityListAtom.ts';
// Components
import { EventCard } from '@/components/EventCard/EventCard.tsx';
import { RestaurantsListSelector } from '@/components/RestaurantsListSelector/RestaurantsListSelector.tsx';
import { PickerValueObj } from '@/lib/react-mobile-picker/components/Picker.tsx';
import { CitySelect } from '@/components/CitySelect/CitySelect.tsx';
import { DropDownSelect } from '@/components/DropDownSelect/DropDownSelect.tsx';
import { KitchenIcon } from '@/components/Icons/KitchenIcon.tsx';
// Styles
import css from '@/pages/EventsPage/EventsPage.module.css';

const initialRestaurant: PickerValueObj = {
    title: 'unset',
    value: 'unset',
};

export const EventsListPage: React.FC = (): JSX.Element => {
    const navigate = useNavigate();
    const [params] = useSearchParams();
    const [, setEventBookingInfo] = useOutletContext<IEventBookingContext>();

    // Атомы (только чтение)
    const events = useAtomValue<IEvent[] | null>(eventsListAtom);
    const cities = useAtomValue(cityListAtom);
    const currentCity = useAtomValue(getCurrentCity);
    const restaurants = useAtomValue(restaurantsListAtom);
    const setCurrentCity = useSetAtom(setCurrentCityAtom);

    // Локальные состояния
    const [restaurantListSelectorIsOpen, setRestaurantListSelectorIsOpen] = useState(false);
    const [currentRestaurant, setCurrentRestaurant] = useState<PickerValueObj>(initialRestaurant);

    // Переход на страницу деталей мероприятия
    const goToEventDetails = useCallback(
        (eventId: number) => {
            navigate(`/events/${eventId}/details`, { replace: true });
        },
        [navigate]
    );
    // Фильтруем города по наличию мероприятий
    const citiesList = useMemo(() => {
        return cities.filter((city) => restaurants.some((restaurant) => restaurant.city.id === city.id));
    }, [cities, restaurants]);
    
    // Фильтруем рестораны по текущему городу и наличию мероприятий
    const restaurantsList = useMemo(
        () =>
            restaurants.filter(
                (restaurant) =>
                    restaurant.city.name_english === currentCity.name_english &&
                    events?.some((event) => event.restaurant.id === restaurant.id)
            ),
        [restaurants, currentCity]
    );

    // Фильтруем мероприятия по выбранному ресторану и городу
    const filteredEvents = useMemo(() => {
        return events?.filter((event) => {
            // Если выбран конкретный ресторан — показываем только его мероприятия
            if (currentRestaurant.value !== 'unset') {
                return String(event.restaurant.id) === String(currentRestaurant.value);
            }
            // Иначе показываем мероприятия всех ресторанов текущего города
            return restaurantsList.some((restaurant) => String(restaurant.id) === String(event.restaurant.id));
        });
    }, [events, currentRestaurant, restaurantsList]);

    // Обработка URL-параметров: установка города и ресторана из ссылки (например, из бота)
    useEffect(() => {
        const cityParam = params.get('city');
        const restaurantParam = params.get('restaurant');

        if (cityParam) {
            setCurrentCity(cityParam);
        }

        if (restaurantParam) {
            const foundRestaurant = restaurants.find((restaurant) => String(restaurant.id) === String(restaurantParam));
            if (foundRestaurant) {
                setCurrentRestaurant({
                    title: foundRestaurant.title,
                    address: foundRestaurant.address,
                    value: String(foundRestaurant.id),
                });
                // Устанавливаем город по найденному ресторану
                setCurrentCity(foundRestaurant.city.name_english);
            }
        }
    }, [params, restaurants, setCurrentCity]);

    // Обновляем информацию о бронировании при смене ресторана и города
    useEffect(() => {
        if (currentRestaurant.value === 'unset' || currentCity.name_english === 'unset') {
            setEventBookingInfo(null);
            return;
        }
        setEventBookingInfo(
            (prev) =>
                ({
                    ...prev,
                    restaurantId: String(currentRestaurant.value),
                }) as IEventBooking
        );
    }, [currentRestaurant, setEventBookingInfo, currentCity]);

    // Сбрасываем выбранный ресторан при смене города
    useEffect(() => {
        setCurrentRestaurant(initialRestaurant);
    }, [currentCity]);

    return (
        <div className={css.cards}>
            <RestaurantsListSelector
                isOpen={restaurantListSelectorIsOpen}
                setOpen={setRestaurantListSelectorIsOpen}
                restaurant={currentRestaurant}
                selectRestaurant={setCurrentRestaurant}
                filteredRestaurants={restaurantsList}
            />
            <CitySelect titleStyle={{ fontWeight: '600' }} filteredCitiesList={citiesList}/>
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
            {/** Если данные загружены, но нет доступных мероприятий, то показываем сообщение о том, что мероприятий пока нет */}
            {filteredEvents && !filteredEvents.filter((event) => event.tickets_left > 0).length && (
                <span className={css.header_title}>Мероприятий пока нет</span>
            )}
        </div>
    );
};
