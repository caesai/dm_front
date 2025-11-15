import React from 'react';
import { ContentContainer } from '@/components/ContentContainer/ContentContainer.tsx';
import { ContentBlock } from '@/components/ContentBlock/ContentBlock.tsx';
import { HeaderContainer } from '@/components/ContentBlock/HeaderContainer/HeaderContainer.tsx';
import { HeaderContent } from '@/components/ContentBlock/HeaderContainer/HeaderContent/HeaderContainer.tsx';
import css from '@/pages/Restaurant/Restaurant.module.css';
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
    const location = {
        center: [longitude, latitude],
        zoom: 17,
    };
    return (
        <ContentContainer>
            <ContentBlock>
                <HeaderContainer>
                    <HeaderContent title={'Адрес'} />
                </HeaderContainer>
                <div className={css.mapContainer}>
                    <div className={css.map}>
                        <YMapComponentsProvider apiKey={'73a95f3b-fa74-4525-99e3-86ee1309f266'} lang={'ru_RU'}>
                            <YMap location={location}>
                                <YMapDefaultSchemeLayer />
                                <YMapDefaultFeaturesLayer />
                                <YMapMarker coordinates={[longitude, latitude]} draggable={false}>
                                    <div className={css.mapPoint}>
                                        <img width={50} src={logo_url} alt={''} />
                                    </div>
                                </YMapMarker>
                            </YMap>
                            <section className={css.infoContainer}>
                                <div className={css.RestInfo}>
                                    <div className={css.mapInfo}>
                                        <div className={css.mapInfoMetro}>
                                            {address_station_color ? (
                                                <div
                                                    className={css.mapInfoMetroCircle}
                                                    style={{
                                                        backgroundColor: `${address_station_color}`,
                                                    }}
                                                ></div>
                                            ) : null}
                                            <span className={css.mapInfoMetroText}>{address}</span>
                                        </div>
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