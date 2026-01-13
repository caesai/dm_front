import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useAtomValue } from 'jotai/index';
// Atoms
import { restaurantsListAtom } from '@/atoms/restaurantsListAtom.ts';
// Components
import { ContentBlock } from '@/components/ContentBlock/ContentBlock.tsx';
import { KitchenIcon } from '@/components/Icons/KitchenIcon.tsx';
import { DropDownSelect } from '@/components/DropDownSelect/DropDownSelect.tsx';
import { WheelPicker } from '@/components/WheelPicker/WheelPicker.tsx';
// Styles
import { PickerValue } from '@/lib/react-mobile-picker/components/Picker';
import { IRestaurant } from '@/types/restaurant.types';

interface IRestaurantsListSelectorProps {
    onSelect: (value: PickerValue) => void;
    filteredRestaurants?: IRestaurant[];
    selectedRestaurant?: PickerValue;
}
/**
 * Компонент выбора ресторана из списка
 * @param {function} onSelect - Функция выбора ресторана
 * @param {IRestaurant[]} filteredRestaurants - Список ресторанов для фильтрации
 * @param {PickerValue} selectedRestaurant - Выбранный ресторан
 * @example
 * <RestaurantsListSelector
 *     onSelect={(value: PickerValue) => setSelectedRestaurant(value)}
 *     filteredRestaurants={restaurantsList}
 *     selectedRestaurant={selectedRestaurant}
 * />
 * @returns {JSX.Element} - Компонент выбора ресторана из списка
 */
export const RestaurantsListSelector: React.FC<IRestaurantsListSelectorProps> = ({
    onSelect,
    filteredRestaurants,
    selectedRestaurant,
}: IRestaurantsListSelectorProps): JSX.Element => {
    const restaurants = useAtomValue(restaurantsListAtom);
    const [selectedRestaurantState, setSelectedRestaurantState] = useState<PickerValue | null>(selectedRestaurant || null);
    const [isPickerOpen, setIsPickerOpen] = useState(false);

    // Синхронизация пропса selectedRestaurant с состоянием
    useEffect(() => {
        if (selectedRestaurant) {
            setSelectedRestaurantState(selectedRestaurant);
        }
    }, [selectedRestaurant]);
    const restaurantList = useMemo(() => {
        return filteredRestaurants ? filteredRestaurants.map((r) => ({
            title: r.title,
                value: r.id,
                subtitle: r.address,
            }))
          : restaurants.map((r) => ({
                title: r.title,
                value: r.id,
                subtitle: r.address,
            }));
    }, [restaurants, filteredRestaurants]);
    // Открытие/закрытие пикера
    const togglePicker = useCallback(() => {
        setIsPickerOpen(!isPickerOpen);
    }, [setIsPickerOpen]);

    // Выбор ресторана из списка
    const handlePickerChange = useCallback(
        (value: PickerValue) => {
            const selectedValue = value.value;
            // Поиск ресторана по id
            const fullRestaurantOption = restaurants.find((r) => r.id === selectedValue);

            if (fullRestaurantOption) {
                // Создаём полный объект с названием ресторана
                const restaurantPickerValue: PickerValue = {
                    title: fullRestaurantOption.title,
                    value: fullRestaurantOption.id,
                    subtitle: fullRestaurantOption.address,
                };
                
                setSelectedRestaurantState(restaurantPickerValue);
                // Передаём полный объект, а не исходный value из WheelPicker,
                // который может не содержать title
                onSelect(restaurantPickerValue);
            } else {
                // Обработка случая, когда ресторан не найден
                console.error('Не найден ресторан по id:', selectedValue);
            }
        },
        [setSelectedRestaurantState, restaurants, onSelect]
    );

    return (
        <ContentBlock>
            <WheelPicker 
                value={selectedRestaurantState}
                onChange={handlePickerChange}
                items={restaurantList}
                isOpen={isPickerOpen}
                setOpen={setIsPickerOpen}
                title={'Выберите ресторан'}
                popupHeight={200}
                itemHeight={66}
            />
            <DropDownSelect
                title={selectedRestaurantState?.title !== 'unset' && selectedRestaurantState?.title?.toString() || 'Ресторан'}
                isValid={true}
                icon={<KitchenIcon size={24} />}
                onClick={togglePicker}
            />
        </ContentBlock>
    );
};
