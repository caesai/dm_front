import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAtom } from 'jotai';
// Types
import { IEvent } from '@/types/events.types';
// Atoms
import { currentCityAtom, setCurrentCityAtom } from '@/atoms/currentCityAtom';
import { cityListAtom, ICity } from '@/atoms/cityListAtom';
import { eventsListAtom } from '@/atoms/eventListAtom.ts';
// Components
import { EventCard } from '@/components/EventCard/EventCard.tsx';
import { RestaurantsListSelector } from '@/components/RestaurantsListSelector/RestaurantsListSelector';
import { PickerValueObj } from '@/lib/react-mobile-picker/components/Picker';
import { IConfirmationType } from '@/components/CitySelect/CitySelect.types';
import { CitySelect } from '@/components/CitySelect/CitySelect';
import { DropDownSelect } from '@/components/DropDownSelect/DropDownSelect';
import { KitchenIcon } from '@/components/Icons/KitchenIcon';
// Styles
import css from '@/pages/EventsPage/EventsPage.module.css';
// Utils
import { transformToConfirmationFormat } from '@/pages/IndexPage/IndexPage';
import { restaurantsListAtom } from '@/atoms/restaurantsListAtom';

const initialRestaurant: PickerValueObj = {
    title: 'unset',
    value: 'unset',
};

export const EventsListPage: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    console.log('id: ', id);
    const [events] = useAtom<IEvent[]>(eventsListAtom);
    const [cityListA] = useAtom(cityListAtom);
    const [, setCurrentCityA] = useAtom(setCurrentCityAtom);
    const [currentCityA] = useAtom(currentCityAtom);
    const [restaurants] = useAtom(restaurantsListAtom);
    const [cityListConfirm] = useState<IConfirmationType[]>(
        cityListA.map((v: ICity) => transformToConfirmationFormat(v))
    );

    const [currentCityS, setCurrentCityS] = useState<IConfirmationType>(
        cityListConfirm.find((v) => v.id == currentCityA) ?? {
            id: 'moscow',
            text: 'Москва',
        }
    );
    const [restaurantListSelectorIsOpen, setRestaurantListSelectorIsOpen] = useState(false);
    const [currentRestaurant, setCurrentRestaurant] = useState<PickerValueObj>(initialRestaurant);

    const next = (id: number) => {
        navigate(`/events/${id}/details`);
    };

    const updateCurrentCity = (city: IConfirmationType) => {
        setCurrentCityS(city);
        setCurrentCityA(city.id);
        setCurrentRestaurant(initialRestaurant);
    };

    const restaurantsList = useMemo(() => {
        return restaurants.filter((restaurant) => restaurant.city.name_english == currentCityS.id);
    }, [restaurants, currentCityS]);

    const filteredEvents = useMemo(() => {
        return events.filter(
            (event) =>{ 
                if (currentRestaurant.value !== 'unset' && event.restaurant.id === Number(currentRestaurant.value)) {
                    return true;
                } else if (currentRestaurant.value === 'unset' && restaurantsList.find((restaurant) => restaurant.id == event.restaurant.id)) {
                    return true;
                } else {
                    return false;
                }
            }
        );
    }, [events, currentCityS, currentRestaurant, restaurantsList]);

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
            {filteredEvents
                .filter((event) => event.tickets_left > 0)
                .map((event) => (
                    <EventCard key={event.name} {...event} onClick={next} />
                ))}
            {!filteredEvents.filter((event) => event.tickets_left > 0).length && (
                <span className={css.header_title}>Мероприятий пока нет</span>
            )}
        </div>
    );
};
