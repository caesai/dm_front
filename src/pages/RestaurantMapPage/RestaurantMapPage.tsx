import { Page } from '@/components/Page.tsx';
import css from './RestaurantMapPage.module.css';
import { RoundedButton } from '@/components/RoundedButton/RoundedButton.tsx';
import { BackIcon } from '@/components/Icons/BackIcon.tsx';
import { useNavigate, useSearchParams } from 'react-router-dom';
import classNames from 'classnames';
import { useCallback, useEffect, useState } from 'react';
import { InputSlider } from '@/pages/RestaurantMapPage/InputSlider/InputSlider.tsx';
import { RestaurantOnMapIcon } from '@/components/Icons/RestaurantOnMapIcon.tsx';
import { RestaurantOnMapSelectedIcon } from '@/components/Icons/RestaurantOnMapIconSelected.tsx';
import {
    YMap,
    YMapComponentsProvider,
    YMapCustomClusterer,
    YMapDefaultFeaturesLayer,
    YMapDefaultSchemeLayer,
    YMapMarker,
} from 'ymap3-components';
import * as YMaps from '@yandex/ymaps3-types';
import { Feature } from '@yandex/ymaps3-types/packages/clusterer';
import { useAtom } from 'jotai';
import { getCurrentCity } from '@/atoms/cityListAtom.ts';
import { IRestaurant } from '@/types/restaurant.ts';
import { IconlyLocation } from '@/components/Icons/Location.tsx';
import { TimeCircle } from '@/components/Icons/TimeCircle.tsx';
import {
    callPhone,
    formatWorkTime,
    getCurrentTimeShort,
    getCurrentWeekdayShort,
    getRestaurantStatus,
} from '@/utils.ts';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode } from 'swiper/modules';
import { PhoneCallIcon } from '@/components/Icons/PhoneCallIcon.tsx';
import { backButtonAtom } from '@/atoms/backButtonAtom.ts';
import { restaurantsListAtom } from '@/atoms/restaurantsListAtom.ts';
import { Taxi } from '@/components/YandexTaxi/Taxi.tsx';
import { Discovery } from 'react-iconly';
import { openLink } from '@telegram-apps/sdk-react';

interface IRestaurantDetails {
    selectedRest: IRestaurant;
}

const RestaurantDetails = ({ selectedRest }: IRestaurantDetails) => {
    const navigate = useNavigate();

    return (
        <div className={css.restInfoContainer}>
            <div className={css.restInfo}>
                <span className={classNames(css.p15, css.restInfo__title)}>
                    {selectedRest?.title}
                </span>
                <div className={classNames(css.p15, css.restInfo)}>
                    <div className={css.restInfo_block}>
                        <IconlyLocation
                            size={18}
                            color={'var(--dark-grey)'}
                        ></IconlyLocation>
                        <div className={css.restInfo_block__payload}>
                            <span
                                className={classNames(
                                    css.mont,
                                    css.restInfo__address
                                )}
                            >
                                {selectedRest?.address}
                            </span>
                            <div className={css.restInfo__metro_block}>
                                <div
                                    className={css.restInfo__metro}
                                    style={{
                                        backgroundColor: `${selectedRest?.address_station_color}`,
                                    }}
                                />
                                <span
                                    className={classNames(
                                        css.mont,
                                        css.restInfo__address
                                    )}
                                >
                                    {selectedRest?.address_station}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className={css.restInfo_block}>
                        <TimeCircle size={18} color={'var(--dark-grey)'} />
                        <div className={css.restInfo_block__payload}>
                            {selectedRest?.worktime
                                ? formatWorkTime(selectedRest?.worktime).map(
                                      (v, index) => (
                                          <span
                                              className={classNames(
                                                  css.mont,
                                                  css.restInfo__address
                                              )}
                                              key={index}
                                          >
                                              {v}
                                          </span>
                                      )
                                  )
                                : null}
                        </div>
                    </div>
                    {/*<span*/}
                    {/*    className={classNames(*/}
                    {/*        css.mont,*/}
                    {/*        css.restInfo__address,*/}
                    {/*        css.restInfo_about*/}
                    {/*    )}*/}
                    {/*>*/}
                    {/*    {selectedRest?.about_text}*/}
                    {/*</span>*/}
                </div>
                <div>
                    <Swiper
                        modules={[FreeMode]}
                        freeMode={true}
                        slidesPerView={'auto'}
                        slidesOffsetAfter={64}
                        slidesOffsetBefore={15}
                        spaceBetween={8}
                    >
                        <SwiperSlide style={{ width: 'max-content' }}>
                            <span
                                className={classNames(
                                    css.mont,
                                    css.swiper_slide
                                )}
                            >
                                {getRestaurantStatus(
                                    selectedRest?.worktime,
                                    getCurrentWeekdayShort(),
                                    getCurrentTimeShort()
                                )}
                            </span>
                        </SwiperSlide>
                        {selectedRest?.about_kitchen.split(',').map((v) => (
                            <SwiperSlide
                                key={v}
                                style={{ width: 'max-content' }}
                            >
                                <span
                                    className={classNames(
                                        css.mont,
                                        css.swiper_slide
                                    )}
                                >
                                    {v} кухня
                                </span>
                            </SwiperSlide>
                        ))}
                        <SwiperSlide style={{ width: 'max-content' }}>
                            <span
                                className={classNames(
                                    css.mont,
                                    css.swiper_slide
                                )}
                            >
                                Средний чек {selectedRest?.avg_cheque} ₽
                            </span>
                        </SwiperSlide>
                    </Swiper>
                </div>
                <div className={css.p15}>
                    <Taxi
                        lonlng={selectedRest.address_lonlng}
                        address={selectedRest.address}
                    />
                </div>
                <div className={classNames(css.p15, css.buttons)}>
                    <div
                        className={css.redButton}
                        onClick={() => navigate(`/booking/${selectedRest.id}`)}
                    >
                        <span className={css.mont}>Забронировать</span>
                    </div>

                    <div
                        className={css.roundButton}
                        onClick={() =>
                            openLink(
                                `https://maps.yandex.ru/?ll=${selectedRest.address_lonlng}&text=${selectedRest.title}&z=17`,
                                { tryInstantView: false }
                            )
                        }
                    >
                        <Discovery
                            size={24}
                            primaryColor={'var(--dark-grey)'}
                        />
                    </div>
                    <div
                        className={css.roundButton}
                        onClick={() => callPhone(selectedRest.phone_number)}
                    >
                        <PhoneCallIcon size={24} color={'var(--dark-grey)'} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export const RestaurantMapPage = () => {
    const [location, setLocation] = useState({
        center: [37.618878, 55.751427],
        zoom: 12,
    });
    const [features, setFeatures] = useState<Feature[]>([]);
    const navigate = useNavigate();
    const [, setYmap] = useState<YMaps.YMap>();
    const [selectedPoint, setSelectedPoint] = useState<string | null>(null);
    const [city] = useAtom(getCurrentCity);
    const [searchParams, setSearchParams] = useSearchParams();
    const [switchCurrent, setSwitchCurrent] = useState('map');
    const [, setBackButton] = useAtom(backButtonAtom);
    const [restaurants] = useAtom(restaurantsListAtom);
    const [selectedRest, setSelectedRest] = useState<IRestaurant>();

    useEffect(() => {
        const search_id = searchParams.get('restaurant');
        console.log('search_id :', search_id);
        if (!search_id) {
            return;
        }

        const res = restaurants.find((v) => v.id == Number(search_id));
        if (res) {
            console.log('set rest', res);
            setSelectedRest(res);
        }
    }, []);

    useEffect(() => {
        if (selectedRest) {
            setSearchParams(() => ({
                restaurant: String(selectedRest.id),
            }));
        }

        console.log('selected rest', selectedRest?.id);
    }, [selectedRest]);

    useEffect(() => {
        setFeatures(
            restaurants.map((v) => ({
                type: 'Feature',
                id: `${v.id}`,
                properties: {
                    name: `${v.title}`,
                    description: 'rest',
                },
                geometry: {
                    type: 'Point',
                    coordinates: [
                        Number(v.address_lonlng.split(',')[0]),
                        Number(v.address_lonlng.split(',')[1]),
                    ],
                },
            }))
        );
    }, []);

    useEffect(() => {
        switch (city?.name_english) {
            case 'moscow':
                setLocation({
                    center: [37.618878, 55.751427],
                    zoom: 12,
                });
                break;
            case 'spb':
                setLocation({
                    center: [30.314997, 59.938784],
                    zoom: 12,
                });
                break;
            case 'ekb':
                setLocation({
                    center: [60.597474, 56.838011],
                    zoom: 12,
                });
                break;
        }
    }, [city]);

    useEffect(() => {
        const rest = restaurants.find((v) => v.id == Number(selectedPoint));
        if (rest) {
            setSelectedRest(rest);
        } else {
            setSelectedRest(undefined);
        }
    }, [selectedPoint]);

    useEffect(() => {
        // setSelectedRest(undefined);
        setSelectedPoint(null);
    }, [switchCurrent]);

    // hack to prevent from scrolling on page
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'scroll';
        };
    }, []);

    const navigateToRestaurant = (id: number) => {
        setBackButton('/map');
        navigate(`/restaurant/${id}`);
    };

    const updateSelectedPoint = (id: string) => {
        if (selectedPoint == id) {
            setSelectedPoint(null);
        } else {
            setSelectedPoint(id);
        }
    };
    const cluster = useCallback(
        (coordinates: YMaps.LngLat, features: Feature[]) => (
            <YMapMarker coordinates={coordinates}>
                <span
                    style={{
                        borderRadius: '8%',
                        background: 'black',
                        color: 'white',
                        width: 42,
                        height: 42,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        fontFamily: 'Mont, sans-serif',
                        fontWeight: '700',
                        fontSize: '18px',
                    }}
                >
                    {features.length}
                </span>
            </YMapMarker>
        ),
        []
    );
    const marker = useCallback(
        (feature: Feature) => (
            <YMapMarker
                coordinates={feature.geometry.coordinates}
                onClick={() => updateSelectedPoint(feature.id)}
            >
                {selectedPoint == feature.id ? (
                    <div className={css.mapPoint__selected}>
                        <RestaurantOnMapSelectedIcon />
                    </div>
                ) : (
                    <div className={css.mapPoint}>
                        <RestaurantOnMapIcon size={24} />
                    </div>
                )}
            </YMapMarker>
        ),
        [selectedPoint]
    );

    return (
        <Page back={true}>
            <div className={css.page}>
                {selectedRest ? (
                    <RestaurantDetails selectedRest={selectedRest} />
                ) : null}
                <div className={classNames(css.fixedHeader)}>
                    <div className={css.header}>
                        <RoundedButton
                            icon={
                                <BackIcon
                                    size={24}
                                    color={'var(--dark-grey)'}
                                />
                            }
                            action={() => navigate(-1)}
                            bgColor={'var(--primary-background)'}
                        />
                        <span className={css.header_title}>
                            Рестораны в{' '}
                            <span className={css.red}>{city?.name_dative}</span>
                        </span>
                        <div className={css.header_spacer} />
                    </div>
                    <InputSlider
                        itemsList={[
                            { id: 'map', value: 'На карте' },
                            { id: 'list', value: 'Списком' },
                        ]}
                        state={switchCurrent}
                        setState={setSwitchCurrent}
                    />
                </div>
                {switchCurrent === 'map' ? (
                    <div className={css.bottomEl}>
                        <YMapComponentsProvider
                            apiKey={'73a95f3b-fa74-4525-99e3-86ee1309f266'}
                            lang={'ru_RU'}
                        >
                            <YMap
                                location={location}
                                mode="vector"
                                ref={(ymap: YMaps.YMap) => setYmap(ymap)}
                            >
                                <YMapDefaultSchemeLayer />
                                <YMapDefaultFeaturesLayer />
                                <YMapCustomClusterer
                                    features={features}
                                    marker={marker}
                                    gridSize={64}
                                    cluster={cluster}
                                />
                            </YMap>
                        </YMapComponentsProvider>
                    </div>
                ) : (
                    <div className={css.bottomEl}>
                        <div className={css.restListContainer}>
                            {restaurants
                                .filter(
                                    (v) =>
                                        v.city.name_english ===
                                        city?.name_english
                                )
                                .map((v) => (
                                    <div
                                        className={css.restList_item}
                                        key={v.title}
                                        onClick={() =>
                                            navigateToRestaurant(v.id)
                                        }
                                    >
                                        <span
                                            className={css.restList_item_title}
                                        >
                                            {v.title}
                                        </span>
                                        <span
                                            className={classNames(
                                                css.mont,
                                                css.restList_item_subtitle
                                            )}
                                        >
                                            {v.address}
                                        </span>
                                    </div>
                                ))}
                        </div>
                    </div>
                )}
            </div>
        </Page>
    );
};
