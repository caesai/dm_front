import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAtomValue } from 'jotai';
// Atoms
import { userAtom } from '@/atoms/userAtom.ts';
import { useGetRestaurantById } from '@/atoms/restaurantsListAtom.ts';
// Components
import { Page } from '@/components/Page.tsx';
import { RoundedButton } from '@/components/RoundedButton/RoundedButton.tsx';
import { RestaurantTopPreview } from '@/components/RestaurantTopPreview/RestaurantTopPreview.tsx';
import { GoToPathIcon } from '@/components/Icons/GoToPathIcon.tsx';
import { CallRestaurantPopup } from '@/components/CallRestaurantPopup/CallRestaurantPopup.tsx';
import { BottomButtonWrapper } from '@/components/BottomButtonWrapper/BottomButtonWrapper.tsx';
import { PageContainer } from '@/components/PageContainer/PageContainer.tsx';
// Page Blocks
import { BookingBlock } from '@/pages/RestaurantPage/blocks/BookingsBlock.tsx';
import { GalleryBlock } from '@/pages/RestaurantPage/blocks/GalleryBlock.tsx';
import { MenuBlock } from '@/pages/RestaurantPage/blocks/MenuBlock.tsx';
import { BanquetsBlock } from '@/pages/RestaurantPage/blocks/BanquetsBlock.tsx';
import { CertificateBlock } from '@/pages/RestaurantPage/blocks/CertificateBlock.tsx';
import { EventsBlock } from '@/pages/RestaurantPage/blocks/EventsBlock.tsx';
import { AboutBlock } from '@/pages/RestaurantPage/blocks/AboutBlock.tsx';
import { ChefBlock } from '@/pages/RestaurantPage/blocks/ChefBlock.tsx';
import { AddressBlock } from '@/pages/RestaurantPage/blocks/AddressBlock.tsx';
import { NavigationBlock } from '@/pages/RestaurantPage/blocks/NavigationBlock.tsx';
import { YandexTaxiBlock } from '@/pages/RestaurantPage/blocks/YandexTaxiBlock.tsx';
// Hooks
import useToastState from '@/hooks/useToastState.ts';
import { useRestaurantPageData } from '@/hooks/useRestaurantPageData.ts';

/**
 * Страница ресторана.
 *
 * Позволяет просматривать информацию о ресторане, его меню, банкетах, событиях, гастрономии и других данных.
 *
 * @component
 * @returns {JSX.Element} Компонент страницы ресторана
 */
export const RestaurantPage: React.FC = (): JSX.Element => {
    const navigate = useNavigate();
    const { restaurantId } = useParams<{ restaurantId: string }>();
    // Atoms
    const user = useAtomValue(userAtom);
    const restaurant = useGetRestaurantById(restaurantId || '');
    // Toast для ошибок
    const { showToast } = useToastState();

    // Оптимизированная загрузка данных через хук
    const { currentSelectedTime, date } = useRestaurantPageData({
        restaurantId: restaurantId || '',
        onError: showToast,
    });

    // Локальные состояния
    const [isCallPopupOpen, setIsCallPopupOpen] = useState(false);
    /**
     * Обрабатывает переход к бронированию столика
     */
    const handleNextButtonClick = () => {
        if (!user?.complete_onboarding) {
            navigate('/onboarding/3', {
                state: {
                    id: restaurantId,
                    bookedDate: date, // Передаём полный PickerValue объект
                    bookedTime: currentSelectedTime,
                    sharedRestaurant: true,
                },
            });
        } else {
            navigate(`/restaurant/${restaurantId}/booking`, {
                state: {
                    bookedDate: date, // Передаём полный PickerValue объект
                    bookedTime: currentSelectedTime,
                },
            });
        }
    };

    /**
     * Открывает Яндекс Карты с местоположением ресторана
     */
    const handleOpenYandexMaps = () => {
        window.open(`https://maps.yandex.ru/?ll=${restaurant?.address_lonlng}&text=${restaurant?.title}&z=17`);
    };

    return (
        <Page back={true}>
            <CallRestaurantPopup
                isOpen={isCallPopupOpen}
                setOpen={setIsCallPopupOpen}
                phone={restaurant?.phone_number || ''}
            />

            <NavigationBlock restaurantId={restaurantId || ''} />

            <PageContainer>
                <RestaurantTopPreview restaurantId={restaurantId || ''} />

                {/* Яндекс Такси виджет */}
                <YandexTaxiBlock restaurantId={restaurantId || ''} />

                <BookingBlock restaurantId={restaurantId || ''} />

                {/* Галерея */}
                <GalleryBlock restaurantId={restaurantId || ''} />

                {/* Меню */}
                <MenuBlock restaurantId={restaurantId || ''} />

                {/* Банкеты */}
                <BanquetsBlock restaurantId={restaurantId || ''} />

                {/* События */}
                <EventsBlock restaurantId={restaurantId || ''} />

                <CertificateBlock />

                {/* О месте */}
                <AboutBlock restaurantId={restaurantId || ''} />

                {/* О шефе */}
                <ChefBlock restaurantId={restaurantId || ''} />

                {/* Адрес */}
                <AddressBlock restaurantId={restaurantId || ''} />
                <BottomButtonWrapper
                    onClick={handleNextButtonClick}
                    additionalBtns={
                        <RoundedButton
                            icon={<GoToPathIcon size={24} color="var(--dark-grey)" />}
                            action={handleOpenYandexMaps}
                        />
                    }
                />
            </PageContainer>
        </Page>
    );
};
