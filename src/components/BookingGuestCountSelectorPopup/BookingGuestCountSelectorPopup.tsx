import Popup from 'reactjs-popup';
import { Dispatch, FC, SetStateAction, useEffect } from 'react';
import styled from 'styled-components';
import { ContentContainer } from '@/components/ContentContainer/ContentContainer.tsx';
import css from './BookingGuestCountSelector.module.css';
import Picker from '@/lib/react-mobile-picker';
import {
    PickerValueData,
    PickerValueObj,
} from '@/lib/react-mobile-picker/components/Picker.tsx';
import classNames from 'classnames';

interface Props {
    isOpen: boolean;
    setOpen: (x: boolean) => void;
    guestCount: PickerValueData;
    setGuestCount: Dispatch<SetStateAction<PickerValueObj>>;
    maxGuestsNumber: number;
    serviceFeeMessage: string;
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

export const BookingGuestCountSelectorPopup: FC<Props> = (p) => {
    if (typeof p.guestCount !== 'object') {
        return;
    }

    // Create selector values as objects with 'title' and 'value' properties
    const selectorOptions = Array.from({ length: p.maxGuestsNumber }, (_, i) => {
      const value = (i + 1).toString();
      return { title: value, value };
    });

    const onClose = () => p.setOpen(false);

    useEffect(() => {
        if (typeof p.guestCount === 'object') {
            if (p.isOpen && p.guestCount.value == 'unset') {
                p.setGuestCount({ title: '1', value: '1' });
            }
        }
    }, [p.isOpen]);

    return (
        <StyledPopup open={p.isOpen} onClose={onClose} modal>
            <ContentContainer>
                <div className={css.content}>
                    <h3>Количество гостей</h3>
                    <h5>
                        {p.serviceFeeMessage ?? p.serviceFeeMessage}
                    </h5>

                    <Picker
                        value={p.guestCount}
                        onChange={p.setGuestCount}
                        wheelMode="natural"
                        height={120}
                    >
                        <Picker.Column name={'value'}>
                            {selectorOptions.map((option) => (
                                <Picker.Item key={option.value} value={option}>
                                    {({ selected }) => (
                                        <div className={css.selectorItem}>
                                            <span
                                                className={classNames(
                                                    css.item,
                                                    selected
                                                        ? css.item__selected
                                                        : null
                                                )}
                                            >
                                                {option.title}
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
                </div>
            </ContentContainer>
        </StyledPopup>
    );
};
