import React, { useCallback, useMemo } from 'react';
import Popup from 'reactjs-popup';
import styled from 'styled-components';
import classNames from 'classnames';
// Components
import Picker, { PickerValue } from '@/lib/react-mobile-picker';
import { ContentContainer } from '@/components/ContentContainer/ContentContainer.tsx';
// Styles
import css from '@/components/WheelPicker/WheelPicker.module.css';

const StyledPopup = styled(Popup)`
    &-overlay {
        background: #58585869;
        display: flex;
        flex-direction: column-reverse;
        overscroll-behavior: contain;
    }

    &-content {
        width: 100vw!important;
        margin: 0 !important;
        padding: 0;
    }
`;

const handleOpen = () => {
    document.body.style.overflow = 'hidden';
};

const handleClose = () => {
    document.body.style.overflow = '';
};

export interface WheelPickerProps {
    isOpen: boolean;
    setOpen: (isOpen: boolean) => void;
    value: PickerValue | null;
    onChange: (value: PickerValue) => void;
    items: PickerValue[];
    title: string;
    popupHeight?: number;
    itemHeight?: number;
}

export const WheelPicker: React.FC<WheelPickerProps> = ({ value, onChange, items, isOpen, setOpen, title, popupHeight = 120, itemHeight = 36 }) => {
    const onClose = useCallback(() => {
        handleClose();
        setOpen(false);
    }, [setOpen]);

    const picker = useMemo(
        () => (
            <Picker value={value || {}} onChange={onChange} wheelMode="natural" height={popupHeight} itemHeight={itemHeight}>
                <Picker.Column name={'value'}>
                    {items.map((item) => (
                        <Picker.Item key={item.value.toString()} value={item.value}>
                            {({ selected }) => (
                                <div className={css.selectorItem}>
                                    <span className={classNames(css.item, { [css.item__selected]: selected })}>
                                        {item.title.toString()}
                                    </span>
                                    {item.subtitle && (
                                        <span>{item.subtitle.toString()}</span>
                                    )}
                                </div>
                            )}
                        </Picker.Item>
                    ))}
                </Picker.Column>
            </Picker>
        ),
        [value, onChange, items]
    );

    return (
        <StyledPopup open={isOpen} onClose={onClose} modal onOpen={handleOpen}>
            <ContentContainer>
                <div className={css.content}>
                    <h3>{title}</h3>
                    {picker}
                    <button className={css.button} onClick={onClose}>
                        <span className={css.text}>Сохранить</span>
                    </button>
                </div>
            </ContentContainer>
        </StyledPopup>
    );
};
