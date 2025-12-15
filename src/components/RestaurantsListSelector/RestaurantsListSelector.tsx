import React, { SetStateAction, useCallback, useMemo } from 'react';
import Popup from 'reactjs-popup';
import Picker from '@/lib/react-mobile-picker';
import styled from 'styled-components';
import classNames from 'classnames';
import { useAtom } from 'jotai/index';
// Types
import { IRestaurant } from '@/types/restaurant.types.ts';
// Atoms
import { isUserInGuestListAtom } from '@/atoms/userAtom';
import { restaurantsListAtom } from '@/atoms/restaurantsListAtom.ts';
// Components
import { ContentContainer } from '@/components/ContentContainer/ContentContainer.tsx';
import { PickerValueObj } from '@/lib/react-mobile-picker/components/Picker.tsx';
// Mocks
import { R } from '@/__mocks__/restaurant.mock';
// Styles
import css from '@/components/RestaurantsListSelector/RestaurantsListSelector.module.css';
import { isUserInTestGroup } from '@/utils';

type SetAtom<Args extends unknown[], Result> = <A extends Args>(...args: A) => Result;

interface IRestaurantsListSelectorProps {
    isOpen: boolean;
    setOpen: (x: boolean) => void;
    restaurant: PickerValueObj;
    selectRestaurant: SetAtom<[SetStateAction<PickerValueObj>], void>; // Use the specific type here
    filteredRestaurants?: IRestaurant[];
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

const handleOpen = () => {
    document.body.style.overflow = 'hidden';
};

const handleClose = () => {
    document.body.style.overflow = ''; // Or '' to remove the style
};

// Extracted SaveButton for better readability and separation of concerns
const SaveButton: React.FC<{ onClose: () => void }> = ({ onClose }) => (
    <div>
        <div className={css.redButton} onClick={onClose}>
            <span className={css.text}>Сохранить</span>
        </div>
    </div>
);

export const RestaurantsListSelector: React.FC<IRestaurantsListSelectorProps> = ({
    isOpen,
    setOpen,
    restaurant,
    selectRestaurant,
    filteredRestaurants,
}) => {
    const onClose = useCallback(() => {
        handleClose();
        setOpen(false);
    }, [setOpen]);

    const [allRestaurants] = useAtom(restaurantsListAtom);
    const [isUserInGuestList] = useAtom(isUserInGuestListAtom);

    const restaurants = useMemo(() => {
        return filteredRestaurants
            ? filteredRestaurants
            : allRestaurants.filter((v) => {
                  if (!isUserInGuestList && !isUserInTestGroup) {
                      // Если не в гест листе и не в тестовой группе то ресторан SELF_EDGE_SPB_CHINOIS_ID не показываем
                      return v.id !== Number(R.SELF_EDGE_SPB_CHINOIS_ID);
                  } else {
                      // Если в гест листе или в тестовой группе то показываем все рестораны
                      return true;
                  }
              });
    }, [filteredRestaurants, allRestaurants, isUserInGuestList, isUserInTestGroup]);

    // Memoize the mapping process to create the Picker-compatible list
    const restaurantList: PickerValueObj[] = useMemo(
        () =>
            restaurants.map(({ title, address, id }) => ({
                title,
                address,
                value: String(id),
            })),
        [restaurants]
    );
    // Ensure the handler used in Picker is stable
    const handlePickerChange = useCallback(
        (valueObj: PickerValueObj) => {
            const selectedValue = valueObj.value;
            // Find the complete object from the list using the value provided by the picker
            const fullRestaurantOption = restaurantList.find((r) => r.value === selectedValue);

            if (fullRestaurantOption) {
                selectRestaurant(fullRestaurantOption);
            } else {
                // Optional: Handle case where lookup fails (e.g., set to unset or log error)
                console.error('Could not find full restaurant object for value:', selectedValue);
            }
        },
        [selectRestaurant, restaurantList]
    );

    const picker = useMemo(
        () => (
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
                                        <span className={classNames(css.item, selected ? css.item__selected : null)}>
                                            {option.title}
                                        </span>
                                        {/* Use optional chaining safely */}
                                        <span>{option.address || ''}</span>
                                    </div>
                                )}
                            </Picker.Item>
                        ))}
                    </Picker.Column>
                </Picker>
                <SaveButton onClose={onClose} />
            </>
        ),
        [restaurant, restaurantList, handlePickerChange, onClose]
    );

    return (
        <StyledPopup open={isOpen} onClose={onClose} modal onOpen={handleOpen}>
            <ContentContainer>
                <div className={css.content}>
                    <h3>Выберите ресторан</h3>
                    {picker}
                </div>
            </ContentContainer>
        </StyledPopup>
    );
};
