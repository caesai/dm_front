import Popup from 'reactjs-popup';
import { Dispatch, FC, SetStateAction, useEffect } from 'react';
import styled from 'styled-components';
import { ContentContainer } from '@/components/ContentContainer/ContentContainer.tsx';
import Picker, { PickerValue } from '@/lib/react-mobile-picker';
import { PickerValueObj } from '@/lib/react-mobile-picker/components/Picker.tsx';
import classNames from 'classnames';
import css from './BookingRestaurantsSelectorPopup.module.css';

interface Props {
    isOpen: boolean;
    setOpen: (x: boolean) => void;
    bookingRestaurant: PickerValue;
    setBookingRestaurant: Dispatch<SetStateAction<PickerValueObj>>;
    values: PickerValueObj[];
}

const StyledPopup = styled(Popup)`
    &-overlay {
        background: #58585869;
        display: flex;
        flex-direction: column-reverse;
        overscroll-behavior: contain;
    }

    // use your custom style for ".popup-content"

    &-content {
        width: 100vw;
        margin: 0 !important;
        padding: 0;
    }
`;

export const BookingRestaurantsSelectorPopup: FC<Props> = ({
    isOpen,
    setOpen,
    bookingRestaurant,
    setBookingRestaurant,
    values,
}) => {
    const onClose = () => setOpen(false);
    useEffect(() => {
        if (values.length && isOpen && bookingRestaurant.value == 'unset') {
            setBookingRestaurant(values[0]);
        }
    }, [isOpen, values]);

    const picker = (
        <>
            <Picker
                value={bookingRestaurant}
                // @ts-expect-error broken-lib
                onChange={setBookingRestaurant}
                // wheelMode="natural"
                height={120}
            >
                <Picker.Column name={'value'}>
                    {values.map((option) => (
                        <Picker.Item key={option.value} value={option}>
                            {({ selected }) => (
                                <div className={css.selectorItem}>
                                    <span
                                        className={classNames(
                                            css.item,
                                            selected ? css.item__selected : null
                                        )}
                                    >
                                        {option.title}
                                    </span>
                                    <span>
                                        {option?.address}
                                    </span>
                                </div>
                            )}
                        </Picker.Item>
                    ))}
                </Picker.Column>
            </Picker>
            <div>
                <div className={css.redButton} onClick={onClose}>
                    <span className={css.text}>Сохранить</span>
                </div>
            </div>
        </>
    );

    return (
        <StyledPopup open={isOpen} onClose={onClose} modal>
            <ContentContainer>
                <div className={css.content}>
                    <h3>Выберите ресторан</h3>

                    {values.length ? picker : <h3>Загрузка</h3>}
                </div>
            </ContentContainer>
        </StyledPopup>
    );
};
