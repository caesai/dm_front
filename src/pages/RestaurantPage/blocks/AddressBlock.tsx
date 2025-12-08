import React from 'react';
import { ContentContainer } from '@/components/ContentContainer/ContentContainer.tsx';
import { ContentBlock } from '@/components/ContentBlock/ContentBlock.tsx';
import { HeaderContainer } from '@/components/ContentBlock/HeaderContainer/HeaderContainer.tsx';
import { HeaderContent } from '@/components/ContentBlock/HeaderContainer/HeaderContent/HeaderContainer.tsx';
import css from '@/pages/RestaurantPage/RestaurantPage.module.css';

import {
    YMap,
    YMapComponentsProvider,
    YMapDefaultFeaturesLayer,
    YMapDefaultSchemeLayer,
    YMapMarker,
} from 'ymap3-components';

interface AddressBlockProps {
    longitude: number;
    latitude: number;
    logo_url: string;
    address: string;
    address_station_color?: string;
}

export const AddressBlock: React.FC<AddressBlockProps> = ({
    longitude,
    latitude,
    logo_url,
    address_station_color,
    address,
}) => {
    /**
     * Конфигурация местоположения для карты
     */
    const mapLocation = {
        center: [longitude, latitude] as [number, number],
        zoom: 17,
    };

    /**
     * Рендерит элемент метро с цветным индикатором, если указан цвет станции
     * @returns {JSX.Element | null} Элемент метро или null
     */
    const renderMetroInfo = (): JSX.Element | null => {
        if (!address_station_color) return null;

        return (
            <div className={css.mapInfoMetro}>
                <div className={css.mapInfoMetroCircle} style={{ backgroundColor: address_station_color }} />
                <span className={css.mapInfoMetroText}>{address}</span>
            </div>
        );
    };

    return (
        <ContentContainer>
            <ContentBlock>
                <HeaderContainer>
                    <HeaderContent title="Адрес" />
                </HeaderContainer>

                <div className={css.mapContainer}>
                    <div className={css.map}>
                        <YMapComponentsProvider
                            apiKey={String(import.meta.env.VITE_YANDEX_MAPS_API_KEY)}
                            lang={String(import.meta.env.VITE_YANDEX_MAPS_API_LANG)}
                        >
                            <YMap location={mapLocation}>
                                <YMapDefaultSchemeLayer />
                                <YMapDefaultFeaturesLayer />
                                <YMapMarker coordinates={[longitude, latitude]} draggable={false}>
                                    <div className={css.mapPoint}>
                                        <img width={50} src={logo_url} alt="Логотип ресторана" />
                                    </div>
                                </YMapMarker>
                            </YMap>

                            <section className={css.infoContainer}>
                                <div className={css.RestInfo}>
                                    <div className={css.mapInfo}>
                                        {renderMetroInfo()}
                                        <div className={css.mapInfoAddress}>{address}</div>
                                    </div>
                                </div>
                            </section>
                        </YMapComponentsProvider>
                    </div>
                </div>
            </ContentBlock>
        </ContentContainer>
    );
};
