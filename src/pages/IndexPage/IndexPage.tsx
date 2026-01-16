import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAtomValue } from 'jotai';
// Atoms
import { userAtom } from '@/atoms/userAtom.ts';
import { getCurrentCity, getCurrentCityId } from '@/atoms/cityListAtom.ts';
// Components
import { Page } from '@/components/Page.tsx';
import { Header } from '@/components/Header/Header.tsx';
import { PageContainer } from '@/components/PageContainer/PageContainer.tsx';
import { OptionsNavigation } from '@/components/OptionsNavigation/OptionsNavigation.tsx';
import { RestaurantsList } from '@/components/RestaurantsList/RestaurantsList.tsx';
import { BookingReminder } from '@/components/BookingReminder/BookingReminder.tsx';
import { CitySelect } from '@/components/CitySelect/CitySelect.tsx';
import { Stories } from '@/components/Stories/Stories.tsx';
import { BottomButtonWrapper } from '@/components/BottomButtonWrapper/BottomButtonWrapper.tsx';
// Hooks
import { useIndexPageData } from '@/hooks/useIndexPageData.ts';
// Styles
import css from '@/pages/IndexPage/IndexPage.module.css';
import { Banner } from '@/components/Banners/Banner.tsx';

/**
 * Главная страница приложения.
 *
 * Показывает истории, города, бронирования, опции и рестораны.
 * Также отображает кнопку бронирования в городах, кроме Екатеринбурга.
 *
 * @component
 * @returns {JSX.Element} Компонент главной страницы
 */
export const IndexPage: React.FC = (): JSX.Element => {
    const navigate = useNavigate();

    // Атомы (только чтение)
    const user = useAtomValue(userAtom);
    const currentCity = useAtomValue(getCurrentCity);
    const currentCityId = useAtomValue(getCurrentCityId);

    // Оптимизированная загрузка данных через хук
    const { currentBookings, storiesBlocks } = useIndexPageData({
        currentCity: currentCity.name_english,
        cityId: currentCityId,
    });

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

    // Переход на страницу бронирования
    const goToBooking = () => {
        navigate('/booking/');
    };

    return (
        <Page back={false}>
            <PageContainer className={css.indexPageContainer}>
                <Header />
                <Stories storiesBlocks={storiesBlocks} />
                <Banner />
                <BookingReminder bookings={currentBookings} />
                <OptionsNavigation />
                <CitySelect />
                <RestaurantsList clickable />
                {currentCity.name_english !== 'ekb' &&
                    <BottomButtonWrapper
                        onClick={goToBooking}
                    />
                }
            </PageContainer>
        </Page>
    );
};
