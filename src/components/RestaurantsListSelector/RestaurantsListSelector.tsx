import React, { useCallback, useMemo, useState } from 'react';
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
}
/**
 * Компонент выбора ресторана из списка
 * @param {function} onSelect - Функция выбора ресторана
 * @returns {JSX.Element} - Компонент выбора ресторана из списка
 */
export const RestaurantsListSelector: React.FC<IRestaurantsListSelectorProps> = ({
    onSelect,
    filteredRestaurants,
}: IRestaurantsListSelectorProps): JSX.Element => {
    const restaurants = useAtomValue(restaurantsListAtom);
    const [selectedRestaurant, setSelectedRestaurant] = useState<PickerValue | null>(null);
    const [isPickerOpen, setIsPickerOpen] = useState(false);
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
    }, [restaurants]);
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
                setSelectedRestaurant({
                    title: fullRestaurantOption.title,
                    value: fullRestaurantOption.id,
                    subtitle: fullRestaurantOption.address,
                });
                onSelect(value);
            } else {
                // Обработка случая, когда ресторан не найден
                console.error('Не найден ресторан по id:', selectedValue);
            }
        },
        [setSelectedRestaurant, restaurants]
    );

    return (
        <ContentBlock>
            <WheelPicker 
                value={selectedRestaurant}
                onChange={handlePickerChange}
                items={restaurantList}
                isOpen={isPickerOpen}
                setOpen={setIsPickerOpen}
                title={'Выберите ресторан'}
                popupHeight={200}
                itemHeight={66}
            />
            <DropDownSelect
                title={selectedRestaurant ? selectedRestaurant.title.toString() : 'Ресторан'}
                isValid={true}
                icon={<KitchenIcon size={24} />}
                onClick={togglePicker}
            />
        </ContentBlock>
    );
};
