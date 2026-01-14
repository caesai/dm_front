import React, { useMemo } from 'react';
// Atoms
import { useGetRestaurantById } from '@/atoms/restaurantsListAtom.ts';
// Components
import { ContentContainer } from '@/components/ContentContainer/ContentContainer.tsx';
import { ContentBlock } from '@/components/ContentBlock/ContentBlock.tsx';
import { HeaderContainer } from '@/components/ContentBlock/HeaderContainer/HeaderContainer.tsx';
import { HeaderContent } from '@/components/ContentBlock/HeaderContainer/HeaderContent/HeaderContainer.tsx';
import {
    YMap,
    YMapComponentsProvider,
    YMapDefaultFeaturesLayer,
    YMapDefaultSchemeLayer,
    YMapMarker,
} from 'ymap3-components';
// Styles
import css from '@/pages/RestaurantPage/RestaurantPage.module.css';

/**
 * Пропсы компонента AddressBlock.
 *
 * @interface IAddressBlockProps
 */
interface IAddressBlockProps {
    /**
     * ID ресторана.
     */
    restaurantId: string;
}

/**
 * Компонент для отображения адреса ресторана.
 *
 * @component
 * @example
 * <AddressBlock restaurantId="1" />
 */
export const AddressBlock: React.FC<IAddressBlockProps> = ({ restaurantId }): JSX.Element => {
    /**
     * Ресторан.
     */
    const restaurant = useGetRestaurantById(restaurantId);

    const logoUrl = useMemo(() => restaurant?.logo_url || '', [restaurant?.logo_url]);
    const address = useMemo(() => restaurant?.address || '', [restaurant?.address]);
    const addressStationColor = useMemo(() => restaurant?.address_station_color || '', [restaurant?.address_station_color]);
    /**
     * Извлекает координаты из строки адреса
     * @returns {{longitude: number, latitude: number}} Объект с координатами
     */
    const getRestaurantCoordinates = (): { longitude: number; latitude: number } => {
        if (!restaurant?.address_lonlng) {
            return { longitude: 0, latitude: 0 };
        }

        const [longitude, latitude] = restaurant.address_lonlng.split(',').map(Number);
        return {
            longitude,
            latitude: latitude - 0.0003, // Корректировка для смещения маркера
        };
    };
    const coordinates = useMemo(() => getRestaurantCoordinates(), [restaurant?.address_lonlng]);

    /**
     * Конфигурация местоположения для карты
     */
    const mapLocation = {
        center: [coordinates.longitude, coordinates.latitude] as [number, number],
        zoom: 17,
    };

    /**
     * Рендерит элемент метро с цветным индикатором, если указан цвет станции
     * @returns {JSX.Element | null} Элемент метро или null
     */
    const renderMetroInfo = (): JSX.Element | null => {
        if (!addressStationColor) return null;

        return (
            <div className={css.mapInfoMetro}>
                <div className={css.mapInfoMetroCircle} style={{ backgroundColor: addressStationColor }} />
                <span className={css.mapInfoMetroText}>{address}</span>
            </div>
        );
    };

    return (
        <ContentContainer id="address">
            <HeaderContainer>
                <HeaderContent title="Адрес" />
            </HeaderContainer>

            <ContentBlock className={css.mapContainer}>
                <div className={css.map}>
                        <YMapComponentsProvider
                            apiKey={String(import.meta.env.VITE_YANDEX_MAPS_API_KEY)}
                            lang={String(import.meta.env.VITE_YANDEX_MAPS_API_LANG)}
                        >
                            <YMap location={mapLocation}>
                                <YMapDefaultSchemeLayer />
                                <YMapDefaultFeaturesLayer />
                                <YMapMarker coordinates={[coordinates.longitude, coordinates.latitude]} draggable={false}>
                                    <div className={css.mapPoint}>
                                        {/** Логотип ресторана */}
                                        <img width={50} src={logoUrl} alt={restaurant?.title || ''} />
                                    </div>
                                </YMapMarker>
                            </YMap>

                            <section className={css.infoContainer}>
                                <div className={css.RestInfo}>
                                    <div className={css.mapInfo}>
                                        {renderMetroInfo()}
                                        <address className={css.mapInfoAddress}>{address}</address>
                                    </div>
                                </div>
                            </section>
                        </YMapComponentsProvider>
                </div>
            </ContentBlock>
        </ContentContainer>
    );
};
