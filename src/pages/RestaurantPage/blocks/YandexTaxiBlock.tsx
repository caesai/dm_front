import React from 'react';
import css from '@/pages/RestaurantPage/RestaurantPage.module.css';
import { useGetRestaurantById } from '@/atoms/restaurantsListAtom.ts';

/**
 * Пропсы компонента YandexTaxiBlock.
 *
 * @interface IYandexTaxiBlockProps
 */
interface IYandexTaxiBlockProps {
    /**
     * ID ресторана.
     */
    restaurantId: string;
}

/**
 * Компонент для отображения блока Яндекс Такси.
 *
 * @component
 * @param {IYandexTaxiBlockProps} props - Пропсы компонента
 * @returns {JSX.Element} Компонент блока Яндекс Такси
 */
export const YandexTaxiBlock: React.FC<IYandexTaxiBlockProps> = ({ restaurantId }): JSX.Element => {
    /**
     * Ресторан.
     */
    const restaurant = useGetRestaurantById(restaurantId);
    /**
     * Если ресторан не найден, то возвращаем пустой элемент.
     */
    if (!restaurant) return <></>;

    /**
     * Возвращаем блок Яндекс Такси.
     */
    return (
        <div className={css.yaTaxi}>
            <div
                key="taxi1"
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
            />
        </div>
    );
};
