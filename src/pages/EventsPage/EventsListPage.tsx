/**
 * @fileoverview Страница списка мероприятий.
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAtomValue, useSetAtom } from 'jotai';
// APIs
import { BASE_BOT } from '@/api/base.ts';
// Types
import { IEvent } from '@/types/events.types.ts';
// Atoms
import { eventsListAtom } from '@/atoms/eventListAtom.ts';
import { restaurantsListAtom } from '@/atoms/restaurantsListAtom.ts';
import { cityListAtom, getCurrentCity, setCurrentCityAtom } from '@/atoms/cityListAtom.ts';
// Components
import { Page } from '@/components/Page.tsx';
import { PageContainer } from '@/components/PageContainer/PageContainer.tsx';
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

const initialRestaurant: PickerValue = {
    title: 'unset',
    value: 'unset',
};

/**
 * Страница списка мероприятий.
 *
 * Позволяет просматривать список мероприятий и детали конкретного мероприятия.
 * Также предоставляет возможность шэринга мероприятия.
 *
 * @component
 * @returns {JSX.Element} - Компонент страницы списка мероприятий
 */
export const EventsListPage: React.FC = (): JSX.Element => {
    const navigate = useNavigate();
    /** State из URL параметров */
    const location = useLocation();
    const state = location.state;
    // Атомы (только чтение)
    const events = useAtomValue<IEvent[] | null>(eventsListAtom);
    const cities = useAtomValue(cityListAtom);
    const currentCity = useAtomValue(getCurrentCity);
    const restaurants = useAtomValue(restaurantsListAtom);
    const setCurrentCity = useSetAtom(setCurrentCityAtom);
    const [selectedRestaurant, setSelectedRestaurant] = useState<PickerValue>(initialRestaurant);
    /** Флаг для пропуска сброса ресторана при смене города из shared-ссылки */
    const skipResetOnCityChange = useRef(false);
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
        [restaurants, currentCity, events]
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

    /**
     * Обработка state из URL параметров: установка города и ресторана из ссылки (например, из бота)
     * @param state - state из URL параметров
     * @param restaurants - список ресторанов
     * @param setCurrentCity - функция установки текущего города
     */
    useEffect(() => {
        const sharedRestaurantId = state?.restaurantId;
        const sharedCityId = state?.cityId;
        if (state?.shared) {
            if (sharedRestaurantId) {
                // Поиск ресторана по id
                const foundRestaurant = restaurants.find(
                    (restaurant) => String(restaurant.id) === String(sharedRestaurantId)
                );
                if (foundRestaurant) {
                    // Пропускаем сброс ресторана при смене города из shared-ссылки
                    skipResetOnCityChange.current = true;
                    // Установка текущего города (делаем до установки ресторана)
                    setCurrentCity(foundRestaurant.city.name_english);
                    // Установка выбранного ресторана
                    setSelectedRestaurant({
                        title: foundRestaurant.title,
                        address: foundRestaurant.address,
                        value: String(foundRestaurant.id),
                    });
                }
            }
            if (sharedCityId) {
                // Установка текущего города
                setCurrentCity(sharedCityId);
            }
        }
    }, [state, restaurants, setCurrentCity]);

    const handleGoBack = () => {
        navigate('/');
    };

    const shareEvent = useCallback(() => {
        let url = '';
        const title = '';
        // Если выбран конкретный ресторан, то шэрим ссылку на мероприятия в выбранном ресторане, иначе шэрим ссылку на мероприятия в выбранном городе
        if (selectedRestaurant.value !== 'unset') {
            url = encodeURI(`https://t.me/${BASE_BOT}?startapp=event_restaurantId_${selectedRestaurant.value}`);
        } else {
            url = encodeURI(`https://t.me/${BASE_BOT}?startapp=event_cityId_${currentCity.name_english}`);
        }
        const shareData = {
            title,
            url,
        };
        try {
            if (navigator && navigator.canShare(shareData)) {
                navigator
                    .share(shareData)
                    .then()
                    .catch((err) => {
                        console.error(JSON.stringify(err));
                    });
            }
        } catch (e) {
            window.open(`https://t.me/share/url?url=${url}&text=${title}`, '_blank');
        }
    }, [selectedRestaurant.value, currentCity.name_english]);

    const handleSelectRestaurant = useCallback(
        (value: PickerValue) => {
            setSelectedRestaurant(value);
        },
        [setSelectedRestaurant]
    );

    // Сбрасываем выбранный ресторан при смене города
    useEffect(() => {
        // Пропускаем сброс если город был изменён из shared-ссылки
        if (skipResetOnCityChange.current) {
            skipResetOnCityChange.current = false;
            return;
        }
        if (currentCity.name_english !== 'unset') {
            setSelectedRestaurant(initialRestaurant);
        }
    }, [currentCity]);

    return (
        <Page back={!state?.shared}>
            <PageContainer className={css.eventsListPage}>
                <ContentBlock className={css.header}>
                    <RoundedButton icon={<BackIcon color={'var(--dark-grey)'} />} action={handleGoBack} />
                    <HeaderContent className={css.headerTitle} title="Мероприятия" />
                    <RoundedButton icon={<Share color={'var(--dark-grey)'} />} action={shareEvent} />
                </ContentBlock>
                <CitySelect titleStyle={{ fontWeight: '600' }} filteredCitiesList={citiesList} />
                <RestaurantsListSelector
                    onSelect={handleSelectRestaurant}
                    filteredRestaurants={restaurantsList}
                    selectedRestaurant={selectedRestaurant}
                />
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
