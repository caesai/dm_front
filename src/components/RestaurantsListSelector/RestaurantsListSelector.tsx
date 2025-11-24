import Popup from 'reactjs-popup';
import { FC, SetStateAction, useCallback, useMemo } from 'react';
import Picker from '@/lib/react-mobile-picker';
import styled from 'styled-components';
import { ContentContainer } from '@/components/ContentContainer/ContentContainer.tsx';
// Define a clear interface for the data structure used
import classNames from 'classnames';
import css from '@/components/RestaurantsListSelector/RestaurantsListSelector.module.css';
import { PickerValueObj } from '@/lib/react-mobile-picker/components/Picker.tsx';
import { useAtom } from 'jotai/index';
import { restaurantsListAtom } from '@/atoms/restaurantsListAtom.ts';
import { IRestaurant } from '@/types/restaurant.ts';

type SetAtom<Args extends unknown[], Result> = <A extends Args>(...args: A) => Result;

interface RestaurantsListSelectorProps {
    isOpen: boolean;
    setOpen: (x: boolean) => void;
    restaurant: PickerValueObj;
    selectRestaurant: SetAtom<[SetStateAction<PickerValueObj>], void>; // Use the specific type here
    filteredRestaurants?: IRestaurant[]
}

const StyledPopup = styled(Popup)`
    &-overlay {
        background: #58585869;
        display: flex;
        flex-direction: column-reverse;
        overscroll-behavior: contain;
    }

    &-content {
        width: 100vw;
        margin: 0 !important;
        padding: 0;
    }
`;

// Extracted SaveButton for better readability and separation of concerns
const SaveButton: FC<{ onClose: () => void }> = ({ onClose }) => (
    <div>
        <div className={css.redButton} onClick={onClose}>
            <span className={css.text}>Сохранить</span>
        </div>
    </div>
);

export const RestaurantsListSelector: FC<RestaurantsListSelectorProps> = (
    {
        isOpen,
        setOpen,
        restaurant,
        selectRestaurant,
        filteredRestaurants,
    },
) => {
    const onClose = useCallback(() => setOpen(false), [setOpen]);

    const [allRestaurants] = useAtom(restaurantsListAtom);

    const restaurants = useMemo(() => {
        return filteredRestaurants ? filteredRestaurants : allRestaurants
    }, [filteredRestaurants, allRestaurants])

    // Memoize the mapping process to create the Picker-compatible list
    const restaurantList: PickerValueObj[] = useMemo(() =>
        restaurants.map(({ title, address, id }) => ({
            title,
            address,
            value: String(id),
        })), [restaurants]
    );
    // Ensure the handler used in Picker is stable
    const handlePickerChange = useCallback((valueObj: PickerValueObj) => {
        const selectedValue = valueObj.value;
        // Find the complete object from the list using the value provided by the picker
        const fullRestaurantOption = restaurantList.find(r => r.value === selectedValue);

        if (fullRestaurantOption) {
            selectRestaurant(fullRestaurantOption);
        } else {
            // Optional: Handle case where lookup fails (e.g., set to unset or log error)
            console.error("Could not find full restaurant object for value:", selectedValue);
        }
    }, [selectRestaurant, restaurantList]); // Depend on restaurantList

    // Set default selection logic when the popup opens
    // useEffect(() => {
    //     // Check if we have values, if the popup is open, and if a value hasn't been set yet (using a reliable 'unset' check)
    //     if (restaurant?.value === 'unset') {
    //         selectRestaurant(restaurantList[0]);
    //     }
    // }, [isOpen, restaurantList, restaurant, selectRestaurant]);
    // Memoize the picker UI part if values are loaded
    const picker = useMemo(() => (
        <>
            <Picker
                value={restaurant}
                onChange={handlePickerChange}
                wheelMode="natural"
                height={200}
                itemHeight={66}
            >
                <Picker.Column name={'value'}>
                    {restaurantList.map((option) => (
                        // Key off option.value which should be unique
                        <Picker.Item key={option.value} value={option}>
                            {({ selected }) => (
                                <div className={css.selectorItem}>
                                    <span
                                        className={classNames(
                                            css.item,
                                            selected ? css.item__selected : null,
                                        )}
                                    >
                                        {option.title}
                                    </span>
                                    {/* Use optional chaining safely */}
                                    <span>
                                        {option.address || ''}
                                    </span>
                                </div>
                            )}
                        </Picker.Item>
                    ))}
                </Picker.Column>
            </Picker>
            <SaveButton onClose={onClose} />
        </>
    ), [restaurant, handlePickerChange, onClose]);

    return (
        <StyledPopup open={isOpen} onClose={onClose} modal>
            <ContentContainer>
                <div className={css.content}>
                    <h3>Выберите ресторан</h3>
                    {picker}
                </div>
            </ContentContainer>
        </StyledPopup>
    );
};
