import { Page } from '@/components/Page.tsx';
import css from './Restaurant.module.css';
import { RoundedButton } from '@/components/RoundedButton/RoundedButton.tsx';
import { RestaurantTopPreview } from '@/components/RestaurantTopPreview/RestaurantTopPreview.tsx';
import { useNavigate, useParams } from 'react-router-dom';
import 'swiper/css/bundle';
import 'swiper/css/zoom';
import { useEffect, useMemo, useState } from 'react';
import { GoToPathIcon } from '@/components/Icons/GoToPathIcon.tsx';
import { GalleryCollection, GalleryPhoto } from '@/pages/Restaurant/Restaurant.types.ts';
import { CallRestaurantPopup } from '@/components/CallRestaurantPopup/CallRestaurantPopup.tsx';
import { useAtom } from 'jotai';
import { IPhotoCard, IRestaurant } from '@/types/restaurant.ts';
import { restaurantsListAtom } from '@/atoms/restaurantsListAtom.ts';
import { formatDate } from '@/utils.ts';
import { PickerValueObj } from '@/lib/react-mobile-picker/components/Picker.tsx';
import { ITimeSlot } from '@/pages/BookingPage/BookingPage.types.ts';
import { authAtom, userAtom } from '@/atoms/userAtom.ts';
import { APIGetAvailableDays, APIGetAvailableTimeSlots, APIGetEventsInRestaurant } from '@/api/restaurants.ts';
import { bookingDateAtom, timeslotAtom } from '@/atoms/bookingInfoAtom.ts';
import { IEventInRestaurant } from '@/types/events.ts';
import { BottomButtonWrapper } from '@/components/BottomButtonWrapper/BottomButtonWrapper.tsx';
import { mockEventsUsersList } from '@/__mocks__/events.mock.ts';
import { IBanquet } from '@/types/banquets.types.ts';
import { APIGetBanquetOptions } from '@/api/banquet.api.ts';
import { certificateBlock } from '@/__mocks__/certificates.mock.ts';
import { BookingBlock } from '@/pages/Restaurant/blocks/BookingsBlock.tsx';
import { GalleryBlock } from '@/pages/Restaurant/blocks/GalleryBlock.tsx';
import { MenuBlock } from '@/pages/Restaurant/blocks/MenuBlock.tsx';
import { BanquetsBlock } from '@/pages/Restaurant/blocks/BanquetsBlock.tsx';
import { CertificateBlock } from '@/pages/Restaurant/blocks/CertificateBlock.tsx';
import { EventsBlock } from '@/pages/Restaurant/blocks/EventsBlock.tsx';
import { AboutBlock } from '@/pages/Restaurant/blocks/AboutBlock.tsx';
import { ChefBlock } from '@/pages/Restaurant/blocks/ChefBlock.tsx';
import { AddressBlock } from '@/pages/Restaurant/blocks/AddressBlock.tsx';
import { NavigationBlock } from '@/pages/Restaurant/blocks/NavigationBlock.tsx';
import { GastronomyBlock } from '@/pages/Restaurant/blocks/GastronomyBlock.tsx';
import { NewYearCookingData } from '@/__mocks__/gastronomy.mock.ts';
import { DEV_MODE } from '@/api/base.ts';

/**
 * Преобразует массив фотографий в структурированную галерею с группировкой по категориям
 * @param {IPhotoCard[]} gallery - Массив фотографий ресторана
 * @returns {GalleryCollection[]} Структурированная галерея с категориями
 */
export const transformGallery = (gallery: IPhotoCard[]): GalleryCollection[] => {
    const groupedByCategory: Record<string, GalleryPhoto[]> = {};

    gallery.forEach((photo) => {
        if (!groupedByCategory[photo.category]) {
            groupedByCategory[photo.category] = [];
        }
        groupedByCategory[photo.category].push({ link: photo.url });
    });

    return Object.entries(groupedByCategory).map(([title, photos]) => ({
        title,
        photos,
    }));
};

export const Restaurant = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [auth] = useAtom(authAtom);
    const [user] = useAtom(userAtom);
    const [restaurants] = useAtom(restaurantsListAtom);
    const [bookingDate, setBookingDate] = useAtom(bookingDateAtom);
    const [currentSelectedTime, setCurrentSelectedTime] = useAtom<ITimeSlot | null>(timeslotAtom);

    const [restaurant, setRestaurant] = useState<IRestaurant>();
    const [bookingDates, setBookingDates] = useState<PickerValueObj[]>([]);
    const [availableTimeslots, setAvailableTimeslots] = useState<ITimeSlot[]>([]);
    const [timeslotLoading, setTimeslotLoading] = useState(true);
    const [isCallPopupOpen, setIsCallPopupOpen] = useState(false);
    const [events, setEvents] = useState<IEventInRestaurant[] | null>(null);
    const [banquets, setBanquets] = useState<IBanquet | null>(null);
    const [nyCookings] = useState(NewYearCookingData);

    const tg_id = window.Telegram?.WebApp?.initDataUnsafe?.user?.id;

    /**
     * Обрабатывает переход к бронированию столика
     */
    const handleNextButtonClick = () => {
        if (!user?.complete_onboarding) {
            navigate('/onboarding/3', {
                state: {
                    id,
                    bookedDate: bookingDate,
                    bookedTime: currentSelectedTime,
                    sharedRestaurant: true
                },
            });
        } else {
            navigate(`/restaurant/${id}/booking`, {
                state: {
                    bookedDate: bookingDate,
                    bookedTime: currentSelectedTime
                },
            });
        }
    };

    /**
     * Открывает Яндекс Карты с местоположением ресторана
     */
    const handleOpenYandexMaps = () => {
        window.open(
            `https://maps.yandex.ru/?ll=${restaurant?.address_lonlng}&text=${restaurant?.title}&z=17`
        );
    };

    /**
     * Проверяет, есть ли у пользователя доступ к платным событиям
     * @returns {boolean} true если пользователь имеет доступ к платным событиям
     */
    const hasPaidEventsAccess = (): boolean => {
        return Boolean(tg_id && mockEventsUsersList.includes(tg_id));
    };

    /**
     * Фильтрует события в зависимости от доступа пользователя
     * @returns {IEventInRestaurant[] | undefined} Отфильтрованный список событий
     */
    const getFilteredEvents = (): IEventInRestaurant[] | undefined => {
        if (!events) return undefined;

        return events.filter((event) => {
            if (hasPaidEventsAccess()) {
                return event.tickets_left > 0;
            } else {
                return event.tickets_left > 0 && event.ticket_price === 0;
            }
        });
    };

    /**
     * Извлекает координаты из строки адреса
     * @returns {{longitude: number, latitude: number}} Объект с координатами
     */
    const getRestaurantCoordinates = () => {
        if (!restaurant?.address_lonlng) {
            return { longitude: 0, latitude: 0 };
        }

        const [longitude, latitude] = restaurant.address_lonlng.split(',').map(Number);
        return {
            longitude,
            latitude: latitude - 0.0003 // Корректировка для смещения маркера
        };
    };

    // Загрузка данных о банкетах
    useEffect(() => {
        APIGetBanquetOptions(String(auth?.access_token), Number(id)).then((res) => {
            setBanquets(res.data);
        });
    }, [id, auth?.access_token]);

    // Инициализация ресторана и событий
    useEffect(() => {
        setRestaurant(restaurants.find((rest) => rest.id === Number(id)));
        setCurrentSelectedTime(null);
        setBookingDate({ value: 'unset', title: 'unset' });
        APIGetEventsInRestaurant(Number(id), String(auth?.access_token)).then((res) => setEvents(res.data));
    }, [id, restaurants, auth?.access_token]);

    // Загрузка доступных дней для бронирования
    useEffect(() => {
        if (!auth?.access_token) return;

        APIGetAvailableDays(auth.access_token, Number(id), 1)
            .then((res) => {
                const formattedDates = res.data.map((date) => ({
                    title: formatDate(date),
                    value: date,
                }));
                setBookingDates(formattedDates);

                if (formattedDates.length > 0) {
                    setBookingDate(formattedDates[0]);
                }
            });
    }, [auth?.access_token, id]);

    // Загрузка доступных таймслотов для выбранной даты
    useEffect(() => {
        if (!auth?.access_token || bookingDate.value === 'unset') return;

        setTimeslotLoading(true);
        APIGetAvailableTimeSlots(auth.access_token, Number(id), bookingDate.value, 1)
            .then((res) => setAvailableTimeslots(res.data))
            .finally(() => setTimeslotLoading(false));
    }, [auth?.access_token, bookingDate, id]);

    const filteredEvents = useMemo(() => getFilteredEvents(), [events, tg_id]);
    const coordinates = useMemo(() => getRestaurantCoordinates(), [restaurant?.address_lonlng]);
    const hasBanquets = banquets && banquets.banquet_options.length > 0;
    const hasEvents = useMemo(() => Boolean(filteredEvents && filteredEvents.length > 0), [filteredEvents]);
    const shouldShowCertificate = useMemo(() => hasPaidEventsAccess(), [tg_id]);

    return (
        <Page back={true}>
            <CallRestaurantPopup
                isOpen={isCallPopupOpen}
                setOpen={setIsCallPopupOpen}
                phone={restaurant?.phone_number || ''}
            />

            {restaurant && events && banquets && filteredEvents !== undefined && (
                <NavigationBlock
                    restaurant_id={Number(id)}
                    restaurant={restaurant}
                    events={events}
                    banquets={banquets}
                    filteredEvents={filteredEvents}
                />
            )}

            <div className={css.floatingFooter}>
                <BottomButtonWrapper
                    onClick={handleNextButtonClick}
                    additionalBtns={
                        <RoundedButton
                            icon={<GoToPathIcon size={24} color="var(--dark-grey)" />}
                            action={handleOpenYandexMaps}
                        />
                    }
                />
            </div>

            <div className={css.pageContainer}>
                <RestaurantTopPreview rest={restaurant} />

                {/* Яндекс Такси виджет */}
                <div className={css.yaTaxi}>
                    <div
                        key="taxi1"
                        className="ya-taxi-widget"
                        data-ref="https%3A%2F%2Fdemo.efinskiy.ru%2F"
                        data-proxy-url="https://{app}.redirect.appmetrica.yandex.com/route?end-lat={end-lat}&amp;end-lon={end-lon}&amp;tariffClass={tariff}&amp;ref={ref}&amp;appmetrica_tracking_id={redirect}&amp;lang={lang}&amp;erid={erid}"
                        data-tariff="econom"
                        data-app="3"
                        data-lang="ru"
                        data-redirect="1178268795219780156"
                        data-description={restaurant?.address}
                        data-size="s"
                        data-theme="normal"
                        data-title="Вызвать такси"
                        data-use-location="false"
                        data-point-a=""
                        data-point-b={restaurant?.address_lonlng}
                    />
                </div>

                <BookingBlock
                    currentSelectedTime={currentSelectedTime}
                    workTime={restaurant?.worktime}
                    bookingDate={bookingDate}
                    bookingDates={bookingDates}
                    setBookingDate={setBookingDate}
                    timeslotLoading={timeslotLoading}
                    availableTimeslots={availableTimeslots}
                    setCurrentSelectedTime={setCurrentSelectedTime}
                    isNavigationLoading={events == null && banquets == null}
                    isShow={hasPaidEventsAccess()}
                    isBanquets={Boolean(hasBanquets)}
                    isEvents={hasEvents}
                />

                <GalleryBlock restaurant_gallery={restaurant?.gallery} />
                <MenuBlock menu={restaurant?.menu} menu_imgs={restaurant?.menu_imgs} />

                {restaurant && hasBanquets && (
                    <BanquetsBlock
                        image={banquets.image}
                        description={banquets.description}
                        restaurant={restaurant}
                        workTime={restaurant?.worktime}
                        banquets={banquets}
                    />
                )}

                {hasEvents && <EventsBlock events={events} />}

                {shouldShowCertificate && (
                    <CertificateBlock
                        image={certificateBlock.image}
                        description={certificateBlock.description}
                    />
                )}

                {DEV_MODE && restaurant && (
                    <GastronomyBlock
                        description={nyCookings.description}
                        image={nyCookings.image}
                        currentRestaurant={restaurant}
                    />
                )}

                <AboutBlock
                    about_text={String(restaurant?.about_text)}
                    about_dishes={String(restaurant?.about_dishes)}
                    about_kitchen={String(restaurant?.about_kitchen)}
                    about_features={String(restaurant?.about_features)}
                    avg_cheque={String(restaurant?.avg_cheque)}
                    workTime={restaurant?.worktime}
                />

                <ChefBlock
                    about={String(restaurant?.brand_chef.about)}
                    photo_url={String(restaurant?.brand_chef.photo_url)}
                    chef_name={String(restaurant?.brand_chef.name)}
                />

                <AddressBlock
                    longitude={coordinates.longitude}
                    latitude={coordinates.latitude}
                    address={String(restaurant?.address)}
                    logo_url={String(restaurant?.logo_url)}
                    address_station_color={String(restaurant?.address_station_color)}
                />
            </div>
        </Page>
    );
};
