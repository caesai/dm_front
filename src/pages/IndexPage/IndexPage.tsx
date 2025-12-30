import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAtom } from 'jotai';
// Atoms
import { userAtom } from '@/atoms/userAtom.ts';
import { cityListAtom, ICity } from '@/atoms/cityListAtom.ts';
import { currentCityAtom, setCurrentCityAtom } from '@/atoms/currentCityAtom.ts';
// Components
import { Page } from '@/components/Page.tsx';
import { Header } from '@/components/Header/Header.tsx';
import { OptionsNavigation } from '@/components/OptionsNavigation/OptionsNavigation.tsx';
import { RestaurantPreview } from '@/components/RestaurantPreview/RestrauntPreview.tsx';
import { RestaurantPreviewSkeletonList } from '@/components/RestaurantPreview/RestaurantPreviewSkeleton.tsx';
import { BookingReminder } from '@/components/BookingReminder/BookingReminder.tsx';
import { IConfirmationType } from '@/components/ConfirmationSelect/ConfirmationSelect.types.ts';
import { CitySelect } from '@/components/CitySelect/CitySelect.tsx';
import { Stories } from '@/components/Stories/Stories.tsx';
import { BottomButtonWrapper } from '@/components/BottomButtonWrapper/BottomButtonWrapper.tsx';
// Hooks
import { useIndexPageData } from '@/hooks/useIndexPageData.ts';
// Styles
import css from '@/pages/IndexPage/IndexPage.module.css';

export const transformToConfirmationFormat = (v: ICity): IConfirmationType => {
    return {
        id: v.name_english,
        text: v.name,
    };
};

export const IndexPage: React.FC = () => {
    const navigate = useNavigate();
    
    // Atoms
    const [currentCityA] = useAtom(currentCityAtom);
    const [user] = useAtom(userAtom);
    const [, setCurrentCityA] = useAtom(setCurrentCityAtom);
    const [cityListA] = useAtom(cityListAtom);
    
    // Состояния для города
    const [cityListConfirm] = useState<IConfirmationType[]>(
        cityListA.map((v: ICity) => transformToConfirmationFormat(v))
    );
    const [currentCityS, setCurrentCityS] = useState<IConfirmationType>(
        cityListConfirm.find((v) => v.id == currentCityA) ?? {
            id: 'moscow',
            text: 'Москва',
        }
    );

    // Вычисляем cityId
    const cityId = cityListA.find((item) => item.name_english === currentCityS.id)?.id ?? 1;

    // Оптимизированная загрузка данных через хук
    const {
        currentBookings,
        storiesBlocks,
        restaurantsList,
        restaurantsLoading,
    } = useIndexPageData({
        currentCity: currentCityA,
        cityId,
    });

    // Синхронизация локального состояния города с атомом
    useEffect(() => {
        setCurrentCityS(
            cityListConfirm.find((v) => v.id == currentCityA) ?? {
                id: 'moscow',
                text: 'Москва',
            }
        );
    }, [cityListA, currentCityA, cityListConfirm]);

    // Устнавливаем счетчик посещений, чтобы на третьем посещении пользователь попал на страницу предпочтений
    useEffect(() => {
        const preferencesStatus = JSON.parse(localStorage.getItem('PREFERENCES_STATUS') as string);

        if (!user?.complete_onboarding || !user?.phone_number) return;

        if (!preferencesStatus) {
            localStorage.setItem('PREFERENCES_STATUS', JSON.stringify({ visit_number: 1 }));
            return;
        }

        const { visit_number } = preferencesStatus;

        if (visit_number === 1) {
            localStorage.setItem('PREFERENCES_STATUS', JSON.stringify({ visit_number: 2 }));
            return;
        }

        if (visit_number === 2) {
            localStorage.setItem('PREFERENCES_STATUS', JSON.stringify({ visit_number: 3, preferences_sent: false }));
            navigate('/preferences/1');
            return;
        }
    }, [navigate, user?.complete_onboarding, user?.phone_number]);

    const updateCurrentCity = (city: IConfirmationType) => {
        setCurrentCityS(city);
        setCurrentCityA(city.id);
    };

    const cityOptions = useMemo(
        () => cityListConfirm.filter((v) => v.id !== currentCityS.id),
        [cityListConfirm, currentCityS.id]
    );

    return (
        <Page back={false}>
            <div className={css.pageContainer}>
                <Header />
                <Stories storiesBlocks={storiesBlocks} />
                <div style={{ marginRight: 15 }}>
                    <CitySelect options={cityOptions} currentValue={currentCityS} onChange={updateCurrentCity} />
                </div>
                <BookingReminder bookings={currentBookings} />
                <OptionsNavigation cityId={cityId} isLoading={restaurantsLoading} />
                <div className={css.restaurants}>
                    {restaurantsLoading ? (
                        <RestaurantPreviewSkeletonList count={3} />
                    ) : (
                        restaurantsList.map((rest) => (
                            <RestaurantPreview restaurant={rest} key={`rest-${rest.id}`} clickable />
                        ))
                    )}
                </div>
            </div>
            {currentCityA !== 'ekb' && <BottomButtonWrapper onClick={() => navigate('/booking/')} />}
        </Page>
    );
};
