import { Page } from '@/components/Page.tsx';
import css from './Restaurant.module.css';
import { RoundedButton } from '@/components/RoundedButton/RoundedButton.tsx';
import { RestaurantTopPreview } from '@/components/RestaurantTopPreview/RestaurantTopPreview.tsx';
import { useNavigate, useParams } from 'react-router-dom';
import 'swiper/css/bundle';
import 'swiper/css/zoom';
import { useEffect, useState } from 'react';
import { GoToPathIcon } from '@/components/Icons/GoToPathIcon.tsx';
import { GalleryCollection, GalleryPhoto } from '@/pages/Restaurant/Restaurant.types.ts';
import { CallRestaurantPopup } from '@/components/CallRestaurantPopup/CallRestaurantPopup.tsx';
import { useAtom } from 'jotai';
import { IPhotoCard, IRestaurant } from '@/types/restaurant.ts';
import { restaurantsListAtom } from '@/atoms/restaurantsListAtom.ts';
import {
    formatDate,
} from '@/utils.ts';
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
import { NewYearCooking } from '@/pages/Restaurant/blocks/NewYearCooking.tsx';
import { NewYearCookingData } from '@/__mocks__/new_year_cooking.mock.ts';
import { DEV_MODE } from '@/api/base.ts';

export const transformGallery = (gallery: IPhotoCard[]): GalleryCollection[] => {
    // Создаем объект для группировки по категориям
    const groupedByCategory: Record<string, GalleryPhoto[]> = {};

    // Группируем фотографии по категориям
    gallery.forEach((photo) => {
        if (!groupedByCategory[photo.category]) {
            groupedByCategory[photo.category] = [];
        }
        groupedByCategory[photo.category].push({ link: photo.url });
    });

    // Преобразуем объект в массив GalleryCollection
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


    const [callPopup, setCallPopup] = useState(false);

    const [events, setEvents] = useState<IEventInRestaurant[] | null>(null);
    const [banquets, setBanquets] = useState<IBanquet | null>(null);
    const [ny_cookings,] = useState(NewYearCookingData)

    const tg_id = window.Telegram.WebApp.initDataUnsafe.user.id;

    const handleNextBtn = () => {
        if (!user?.complete_onboarding) {
            navigate('/onboarding/3', {
                state: { id, bookedDate: bookingDate, bookedTime: currentSelectedTime, sharedRestaurant: true },
            });
        } else {
            navigate(`/restaurant/${id}/booking`, {
                state: { bookedDate: bookingDate, bookedTime: currentSelectedTime },
            });
        }
    };

    useEffect(() => {
        APIGetBanquetOptions(String(auth?.access_token), Number(id)).then((res) => {
            setBanquets(res.data);
        });
    }, [id]);

    useEffect(() => {
        setRestaurant(restaurants.find((v) => v.id === Number(id)));
        setCurrentSelectedTime(null);
        setBookingDate({ value: 'unset', title: 'unset' });
        APIGetEventsInRestaurant(Number(id), String(auth?.access_token)).then((res) => setEvents(res.data));
    }, [id]);

    useEffect(() => {
        if (!auth?.access_token) {
            return;
        }
        APIGetAvailableDays(auth?.access_token, Number(id), 1)
            .then((res) => {
                setBookingDates(
                    res.data.map((v) => ({
                        title: formatDate(v),
                        value: v,
                    }))
                );
                return res;
            })
            .then((res) => {
                setBookingDate({
                    title: formatDate(res.data[0]),
                    value: res.data[0],
                });
            });
    }, []);

    useEffect(() => {
        if (!auth?.access_token || bookingDate.value == 'unset') {
            return;
        }
        setTimeslotLoading(true);
        APIGetAvailableTimeSlots(auth.access_token, Number(id), bookingDate.value, 1)
            .then((res) => setAvailableTimeslots(res.data))
            .finally(() => setTimeslotLoading(false));
    }, [bookingDate]);

    const filteredEvents = events?.filter((event) => {
        return event.tickets_left > 0;
    });

    return (
        <Page back={true}>
            <CallRestaurantPopup
                isOpen={callPopup}
                setOpen={setCallPopup}
                phone={restaurant?.phone_number ? restaurant?.phone_number : ''}
            />
            {restaurant && events && banquets && filteredEvents !== undefined && (
                <NavigationBlock restaurant_id={Number(id)} restaurant={restaurant} events={events} banquets={banquets} filteredEvents={filteredEvents} />
            )}
            <div className={css.floatingFooter}>
                <BottomButtonWrapper
                    onClick={handleNextBtn}
                    additionalBtns={
                        <>
                            <RoundedButton
                                icon={<GoToPathIcon size={24} color={'var(--dark-grey)'} />}
                                action={() =>
                                    // ,
                                    window.open(
                                        `https://maps.yandex.ru/?ll=${restaurant?.address_lonlng}&text=${restaurant?.title}&z=17`
                                    )
                                }
                            />
                        </>
                    }
                />
            </div>
            <div className={css.pageContainer}>
                <RestaurantTopPreview rest={restaurant} />
                <div className={css.yaTaxi}>
                    <div
                        key={'taxi1'}
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
                    ></div>
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
                    isShow={
                        tg_id && mockEventsUsersList.includes(tg_id) && banquets && banquets?.banquet_options.length > 0
                    }
                    isEvents={Boolean(filteredEvents && filteredEvents?.length > 0)}
                />
                <GalleryBlock restaurant_gallery={restaurant?.gallery} />
                <MenuBlock menu={restaurant?.menu} menu_imgs={restaurant?.menu_imgs} />
                {tg_id && mockEventsUsersList.includes(tg_id) && banquets && banquets?.banquet_options.length > 0 && (
                    <BanquetsBlock
                        image={banquets.image}
                        description={banquets.description}
                        restaurant_id={Number(id)}
                        restaurant_title={String(restaurant?.title)}
                        workTime={restaurant?.worktime}
                        banquets={banquets}
                    />
                )}
                {Boolean(filteredEvents && filteredEvents?.length > 0) && <EventsBlock events={events} />}
                <CertificateBlock image={certificateBlock.image} description={certificateBlock.description} />
                {DEV_MODE && (<NewYearCooking description={ny_cookings.description} image={ny_cookings.image} />)}
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
                    longitude={Number(restaurant?.address_lonlng.split(',')[0])}
                    latitude={Number(restaurant?.address_lonlng.split(',')[1]) - 0.0003}
                    address={String(restaurant?.address)}
                    logo_url={String(restaurant?.logo_url)}
                    address_station_color={String(restaurant?.address_station_color)}
                />
            </div>
        </Page>
    );
};
