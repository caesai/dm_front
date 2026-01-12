import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAtomValue, useSetAtom } from 'jotai';
// Types
import { IEvent } from '@/types/events.types.ts';
// Atoms
import { eventsListAtom } from '@/atoms/eventListAtom.ts';
import { restaurantsListAtom } from '@/atoms/restaurantsListAtom.ts';
import { cityListAtom, getCurrentCity, setCurrentCityAtom } from '@/atoms/cityListAtom.ts';
// Components
import { Page } from '@/components/Page.tsx';
import { EventCard } from '@/components/EventCard/EventCard.tsx';
import { RestaurantsListSelector } from '@/components/RestaurantsListSelector/RestaurantsListSelector.tsx';
import { PickerValue } from '@/lib/react-mobile-picker/components/Picker.tsx';
import { CitySelect } from '@/components/CitySelect/CitySelect.tsx';
import { ContentBlock } from '@/components/ContentBlock/ContentBlock.tsx';
import { RoundedButton } from '@/components/RoundedButton/RoundedButton.tsx';
import { HeaderContent } from '@/components/ContentBlock/HeaderContainer/HeaderContent/HeaderContainer.tsx';
import { Share } from '@/components/Icons/Share.tsx';
import { BackIcon } from '@/components/Icons/BackIcon.tsx';
// Styles
import css from '@/pages/EventsPage/EventsPage.module.css';
// Hooks
import { useNavigationHistory } from '@/hooks/useNavigationHistory.ts';
import { PageContainer } from '@/components/PageContainer/PageContainer';

const initialRestaurant: PickerValue = {
    title: 'unset',
    value: 'unset',
};

export const EventsListPage: React.FC = (): JSX.Element => {
    const navigate = useNavigate();
    const [params] = useSearchParams();
    const { goBack } = useNavigationHistory();
    // Атомы (только чтение)
    const events = useAtomValue<IEvent[] | null>(eventsListAtom);
    const cities = useAtomValue(cityListAtom);
    const currentCity = useAtomValue(getCurrentCity);
    const restaurants = useAtomValue(restaurantsListAtom);
    const setCurrentCity = useSetAtom(setCurrentCityAtom);
    const [selectedRestaurant, setSelectedRestaurant] = useState<PickerValue>(initialRestaurant);
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
            if (selectedRestaurant.value !== 'unset') {
                return String(event.restaurant.id) === String(selectedRestaurant.value);
            }
            // Иначе показываем мероприятия всех ресторанов текущего города
            return restaurantsList.some((restaurant) => String(restaurant.id) === String(event.restaurant.id));
        });
    }, [events, selectedRestaurant, restaurantsList]);

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
                setSelectedRestaurant({
                    title: foundRestaurant.title,
                    address: foundRestaurant.address,
                    value: String(foundRestaurant.id),
                });
                // Устанавливаем город по найденному ресторану
                setCurrentCity(foundRestaurant.city.name_english);
            }
        }
    }, [params, restaurants, setCurrentCity]);

    const handleGoBack = useCallback(() => {
        goBack();
    }, [goBack]);

    const shareEvent = () => {};

    const handleSelectRestaurant = useCallback(
        (value: PickerValue) => {
            setSelectedRestaurant(value);
        },
        [setSelectedRestaurant]
    );

    // Сбрасываем выбранный ресторан при смене города
    useEffect(() => {
        if (currentCity.name_english !== 'unset') {
            setSelectedRestaurant(initialRestaurant);
        }
    }, [currentCity]);

    return (
        <Page back={true}>
            <PageContainer className={css.eventsListPage}>
                <ContentBlock className={css.header}>
                    <RoundedButton icon={<BackIcon color={'var(--dark-grey)'} />} action={handleGoBack} />
                    <HeaderContent className={css.headerTitle} title="Мероприятия" />
                    <RoundedButton icon={<Share color={'var(--dark-grey)'} />} action={shareEvent} />
                </ContentBlock>
                <CitySelect titleStyle={{ fontWeight: '600' }} filteredCitiesList={citiesList} />
                <RestaurantsListSelector onSelect={handleSelectRestaurant} filteredRestaurants={restaurantsList} />
                <ContentBlock className={css.cards}>
                    {/** Если данные загружены, то показываем список мероприятий, иначе показываем 10 placeholder блоков */}
                    {filteredEvents
                        ? filteredEvents
                              .filter((event) => event.tickets_left > 0)
                              .map((event) => <EventCard key={event.name} {...event} onClick={goToEventDetails} />)
                        : [...Array(10)].map((event, index) => <EventCard key={index} {...event} />)}
                    {/** Если данные загружены, но нет доступных мероприятий, то показываем сообщение о том, что мероприятий пока нет */}
                    {filteredEvents && !filteredEvents.filter((event) => event.tickets_left > 0).length && (
                        <span className={css.headerTitle}>Мероприятий пока нет</span>
                    )}
                </ContentBlock>
            </PageContainer>
        </Page>
    );
};
