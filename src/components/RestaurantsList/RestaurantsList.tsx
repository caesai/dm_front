import React, { useEffect, useRef, useState } from 'react';
import { useAtomValue } from 'jotai/index';
// Types
import { IRestaurant } from '@/types/restaurant.types.ts';
// Atoms
import { restaurantsListAtom } from '@/atoms/restaurantsListAtom.ts';
import { cityListAtom, getCurrentCity } from '@/atoms/cityListAtom.ts';
// Components
import { RestaurantPreview } from '@/components/RestaurantPreview/RestrauntPreview.tsx';
import { RestaurantPreviewSkeletonList } from '@/components/RestaurantPreview/RestaurantPreviewSkeleton.tsx';
// Mocks
import { R } from '@/__mocks__/restaurant.mock.ts';
// Styles
import css from '@/components/RestaurantsList/RestaurantsList.module.css';

/**
 * Пропсы компонента RestaurantsList.
 *
 * @interface IRestaurantsListProps
 */
interface IRestaurantsListProps {
    /**
     * Флаг, определяющий, являются ли карточки ресторанов кликабельными.
     * При `true` карточки становятся ссылками на страницы ресторанов.
     *
     * @default false
     */
    clickable?: boolean;
}

/**
 * Компонент для отображения списка ресторанов с фильтрацией по текущему городу.
 *
 * Особенности:
 * - Отображает skeleton только во время первоначальной загрузки данных
 * - Не показывает skeleton для городов с пустым списком ресторанов
 * - Фильтрует рестораны по выбранному городу из глобального состояния
 * - Реагирует на изменение текущего города
 *
 * @component
 * @example
 * // Базовое использование (некликабельный список)
 * <RestaurantsList />
 *
 * @example
 * // Кликабельный список с переходом на страницы ресторанов
 * <RestaurantsList clickable={true} />
 *
 * @param {IRestaurantsListProps} props - Пропсы компонента
 * @returns {JSX.Element} Список карточек ресторанов или skeleton при загрузке
 */
export const RestaurantsList: React.FC<IRestaurantsListProps> = ({ clickable = false }: IRestaurantsListProps): JSX.Element => {
    const cityList = useAtomValue(cityListAtom);
    const currentCity = useAtomValue(getCurrentCity);
    const restaurants = useAtomValue(restaurantsListAtom);
    const [restaurantsList, setRestaurantsList] = useState<IRestaurant[]>([]);
    
    // Отслеживаем, были ли данные загружены хотя бы раз
    const hasInitializedRef = useRef(false);

    useEffect(() => {
        // Отмечаем, что данные были загружены, если список не пуст
        if (restaurants.length > 0) {
            hasInitializedRef.current = true;
        }

        let result: IRestaurant[] = [];
        let movableValue = null;
        // Помещаем ресторан Self Edge SPB Chinois (id: 13) в начало списка
        restaurants.map((e) => {
            if (e.id !== R.SELF_EDGE_SPB_CHINOIS_ID) {
                result.push(e);
            } else if (e.id === R.SELF_EDGE_SPB_CHINOIS_ID) {
                movableValue = e;
            }
        });

        if (movableValue !== null) {
            result.unshift(movableValue);
        }
        // Фильтруем рестораны по городу
        result = result.filter((v) => v.city.name_english == currentCity.name_english);
        setRestaurantsList(result);
    }, [currentCity, cityList, restaurants]);

    // Показываем skeleton только если данные ещё не были загружены
    const isLoading = !hasInitializedRef.current && restaurants.length === 0;

    return (
        <div className={css.container}>
            <div className={css.restaurants}>
                {isLoading ? (
                    <RestaurantPreviewSkeletonList count={3} />
                ) : (
                    restaurantsList.map((rest) => (
                        <RestaurantPreview restaurant={rest} key={`rest-${rest.id}`} clickable={clickable} />
                    ))
                )}
            </div>
        </div>
    );
};
