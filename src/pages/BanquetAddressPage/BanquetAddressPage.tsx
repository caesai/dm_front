/**
 * @fileoverview Страница выбора ресторана для банкета.
 * 
 * Первый шаг в процессе бронирования банкета:
 * 1. BanquetAddressPage (выбор ресторана) <- текущая страница
 * 2. ChooseBanquetOptionsPage (выбор опции банкета)
 * 3. BanquetOptionPage (настройка банкета)
 * 4. BanquetAdditionalServicesPage (дополнительные услуги) - опционально
 * 5. BanquetReservationPage (подтверждение)
 * 
 * Особенности логики:
 * - Показываются только рестораны с banquet_options.length > 0
 * - При переходе со страницы ресторана ресторан предвыбирается из URL
 * - Навигация назад зависит от статуса онбординга пользователя
 * - Не прошедшие онбординг пользователи перенаправляются на /onboarding/3
 * 
 * @module pages/BanquetAddressPage
 * 
 * @see {@link ChooseBanquetOptionsPage} - следующий шаг в процессе
 * @see {@link RestaurantsListSelector} - компонент выбора ресторана
 */
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAtomValue } from 'jotai/index';
// Atoms
import { userAtom } from '@/atoms/userAtom.ts';
import { restaurantsListAtom, useGetRestaurantById } from '@/atoms/restaurantsListAtom.ts';
// Components
import { Page } from '@/components/Page.tsx';
import { ContentBlock } from '@/components/ContentBlock/ContentBlock.tsx';
import { HeaderContent } from '@/components/ContentBlock/HeaderContainer/HeaderContent/HeaderContainer.tsx';
import { ContentContainer } from '@/components/ContentContainer/ContentContainer.tsx';
import { RoundedButton } from '@/components/RoundedButton/RoundedButton.tsx';
import { BackIcon } from '@/components/Icons/BackIcon.tsx';
import { BottomButtonWrapper } from '@/components/BottomButtonWrapper/BottomButtonWrapper.tsx';
import { PickerValue } from '@/lib/react-mobile-picker/components/Picker.tsx';
import { RestaurantsListSelector } from '@/components/RestaurantsListSelector/RestaurantsListSelector.tsx';
// Styles
import css from '@/pages/BanquetAddressPage/BanquetAddressPage.module.css';
import BanquetImg from '/img/banquet_img.png';

/**
 * Начальное значение для селектора ресторана.
 * Используется когда ресторан ещё не выбран.
 * @constant
 */
const initialRestaurant: PickerValue = {
    title: 'unset',
    value: 'unset',
};

/**
 * Страница выбора ресторана для банкета.
 * 
 * Отображает информационный блок о банкетах и селектор ресторанов.
 * Фильтрует рестораны, показывая только те, у которых есть банкетные опции.
 * 
 * @returns {JSX.Element} - Компонент страницы выбора ресторана для банкета
 * 
 * @example
 * // URL: /banquets/:restaurantId
 * // Если restaurantId - конкретный ID, ресторан будет предвыбран
 * // Если restaurantId - :restaurantId (placeholder), пользователь выбирает сам
 */
export const BanquetAddressPage: React.FC = (): JSX.Element => {
    const navigate = useNavigate();
    const { restaurantId } = useParams();
    const user = useAtomValue(userAtom);
    const restaurants = useAtomValue(restaurantsListAtom);
    const [currentRestaurant, setCurrentRestaurant] = useState<PickerValue>(initialRestaurant);
    const restaurant = useGetRestaurantById(restaurantId || '');
    
    /**
     * Отфильтрованный список ресторанов с банкетными опциями.
     * Рестораны без banquet_options не отображаются в селекторе.
     */
    const restaurantsList = useMemo(() => {
        return restaurants.filter((item) => item.banquets?.banquet_options?.length > 0);
    }, [restaurants]);
    
    /** Флаг, указывающий что кнопка "Продолжить" заблокирована */
    const isDisabled = currentRestaurant.value === 'unset';

    /**
     * Обрабатывает нажатие кнопки "Назад".
     * 
     * Логика навигации:
     * - Если пользователь прошёл онбординг:
     *   - При :restaurantId (placeholder) -> главная страница
     *   - При конкретном restaurantId -> страница ресторана
     * - Если пользователь не прошёл онбординг -> /onboarding/3
     */
    const handleGoBack = () => {
        if (user?.complete_onboarding) {
            if (restaurantId === ':restaurantId') {
                navigate('/');
            } else {
                navigate(`/restaurant/${restaurantId}`);
            }
        } else {
            navigate('/onboarding/3');
        }
    };

    /**
     * Обрабатывает нажатие кнопки "Продолжить".
     * 
     * Логика навигации:
     * - Если пользователь прошёл онбординг -> страница выбора опций банкета
     * - Если пользователь не прошёл онбординг -> /onboarding/3 с данными банкета
     * 
     * @remarks
     * Функция не выполняется если ресторан не выбран (isDisabled = true)
     */
    const goNextPage = () => {
        if (!isDisabled) {
            if (user?.complete_onboarding) {
                navigate(`/banquets/${currentRestaurant.value}/choose`);
            } else {
                navigate('/onboarding/3', {
                    state: {
                        id: currentRestaurant.value,
                        sharedBanquet: true,
                    },
                });
            }
        }
    };

    /**
     * Эффект для предвыбора ресторана из URL параметров.
     * 
     * Если restaurantId в URL соответствует существующему ресторану,
     * автоматически устанавливает его как выбранный.
     */
    useEffect(() => {
        if (restaurant) {
            setCurrentRestaurant({
                value: String(restaurant.id),
                title: restaurant.title,
                subtitle: restaurant.address,
            });
        }
    }, [restaurant]);

    return (
        <Page back={true} className={css.page}>
            <ContentContainer className={css.pageWrapper}>
                <ContentBlock className={css.header}>
                    <RoundedButton icon={<BackIcon color={'var(--dark-grey)'} />} action={handleGoBack}></RoundedButton>
                    <HeaderContent title="Банкеты" className={css.header_title} />
                    <div style={{ width: 40 }} />
                </ContentBlock>
                <ContentBlock className={css.container}>
                    <ContentBlock className={css.banquet_content}>
                        <img src={BanquetImg} alt={'Банкет'} className={css.banquet_img} />
                        <span className={css.banquet_text}>
                            Для тех, кто планирует важное событие. Здесь можно собрать частный ужин, семейный праздник
                            или деловую встречу — мы предложим пространство, меню и сопровождение под ваш формат.
                        </span>
                    </ContentBlock>
                    <ContentBlock className={css.address_content}>
                        <h3 className={css.content_title}>Адрес ресторана</h3>
                        <RestaurantsListSelector
                            onSelect={(value: PickerValue) => setCurrentRestaurant(value)}
                            filteredRestaurants={restaurantsList}
                            selectedRestaurant={currentRestaurant}
                        />
                    </ContentBlock>
                </ContentBlock>
                <BottomButtonWrapper content={'Продолжить'} onClick={goNextPage} isDisabled={isDisabled} />
            </ContentContainer>
        </Page>
    );
};
