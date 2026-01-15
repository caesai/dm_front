/**
 * @fileoverview Страница детальной информации о ресторане.
 *
 * Отображает полную информацию о ресторане с возможностью:
 * - Просмотра фотогалереи ресторана
 * - Просмотра меню и блюд
 * - Просмотра информации о банкетах
 * - Просмотра предстоящих мероприятий
 * - Покупки сертификатов
 * - Чтения о ресторане и шеф-поваре
 * - Бронирования столика
 * - Открытия местоположения в Яндекс Картах
 * - Вызова такси через Яндекс
 * - Звонка в ресторан
 *
 * @module pages/RestaurantPage/RestaurantPage
 *
 * @see {@link useBookingForm} - хук для работы с формой бронирования
 * @see {@link useGetRestaurantById} - хук получения ресторана по ID
 */

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

/**
 * Страница детальной информации о ресторане.
 *
 * Отображает полную информацию о ресторане, включая:
 * - Превью с основной информацией (название, адрес, рейтинг)
 * - Блок бронирования с выбором даты и времени
 * - Фотогалерею ресторана
 * - Меню с возможностью перехода к детальному просмотру
 * - Информацию о банкетных предложениях
 * - Список предстоящих мероприятий
 * - Блок покупки сертификатов
 * - Описание ресторана и его особенностей
 * - Информацию о шеф-поваре
 * - Адрес с возможностью открытия в картах
 * - Виджет вызова Яндекс Такси
 *
 * Навигация на страницу бронирования происходит с учётом статуса онбординга пользователя:
 * - Если онбординг не завершён — переход на `/onboarding/3` с передачей данных ресторана
 * - Если онбординг завершён — переход на `/restaurant/:id/booking` с выбранной датой и временем
 *
 * @component
 * @returns {JSX.Element} Компонент страницы ресторана
 *
 * @example
 * // Роутинг
 * <Route path="/restaurant/:restaurantId" element={<RestaurantPage />} />
 */
export const RestaurantPage: React.FC = (): JSX.Element => {
    /** Функция навигации из react-router-dom */
    const navigate = useNavigate();

    /** ID ресторана из URL-параметров */
    const { restaurantId } = useParams<{ restaurantId: string }>();

    /**
     * Данные текущего пользователя из глобального состояния.
     * Используется для проверки статуса онбординга.
     */
    const user = useAtomValue(userAtom);

    /**
     * Данные ресторана по ID.
     * Получается через мемоизированный атом restaurantByIdAtom.
     */
    const restaurant = useGetRestaurantById(restaurantId || '');

    /** Состояние открытия попапа звонка в ресторан */
    const [isCallPopupOpen, setIsCallPopupOpen] = useState(false);

    /**
     * Обрабатывает переход к бронированию столика.
     *
     * Если пользователь не завершил онбординг — переход на `/onboarding/3`
     * с передачей данных ресторана.
     *
     * Если онбординг завершён — переход на страницу бронирования
     * `/restaurant/:restaurantId/booking`.
     * Данные формы (дата, время, гости) сохранены в bookingFormAtom через BookingBlock.
     */
    const handleNextButtonClick = () => {
        if (!user?.complete_onboarding) {
            navigate('/onboarding/3', {
                state: {
                    id: restaurantId,
                    sharedRestaurant: true,
                },
            });
        } else {
            navigate(`/restaurant/${restaurantId}/booking`);
        }
    };

    /**
     * Открывает Яндекс Карты с местоположением ресторана в новой вкладке.
     *
     * Формирует URL с параметрами:
     * - ll: координаты ресторана (longitude,latitude)
     * - text: название ресторана для отображения на карте
     * - z: уровень зума (17 — масштаб здания)
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
