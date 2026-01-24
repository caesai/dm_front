/**
 * Компонент WheelPicker для выбора даты и времени
 * @fileoverview WheelPicker.tsx
 * @description Компонент WheelPicker для выбора даты и времени
 */
import React, { useCallback, useMemo } from 'react';
import Popup from 'reactjs-popup';
import styled from 'styled-components';
import classNames from 'classnames';
// Components
import Picker, { PickerValue } from '@/lib/react-mobile-picker';
import { ContentContainer } from '@/components/ContentContainer/ContentContainer.tsx';
// Styles
import css from '@/components/WheelPicker/WheelPicker.module.css';
import { UniversalButton } from '@/components/Buttons/UniversalButton/UniversalButton.tsx';

const StyledPopup = styled(Popup)`
    &-overlay {
        background: #58585869;
        display: flex;
        flex-direction: column-reverse;
        overscroll-behavior: contain;
    }

    &-content {
        width: 100vw !important;
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
/**
 * Пропсы компонента WheelPicker
 */
export interface WheelPickerProps {
    /** Флаг открытия пикера */
    isOpen: boolean;
    /** Функция установки открытия пикера */
    setOpen: (isOpen: boolean) => void;
    /** Значение пикера */
    value: PickerValue | null;
    /** Функция изменения значения пикера (вызывается при скролле) */
    onChange: (value: PickerValue) => void;
    /** Функция сохранения значения (вызывается при нажатии "Сохранить"). Если не передана, вызывается onChange */
    onSave?: (value: PickerValue) => void;
    /** Список элементов пикера */
    items: PickerValue[];
    /** Заголовок пикера */
    title: string;
    /** Высота пикера */
    popupHeight?: number;
    /** Высота элемента пикера */
    itemHeight?: number;
    /** Выравнивание текста элементов пикера */
    textAlign?: 'left' | 'center' | 'right';
}

export const WheelPicker: React.FC<WheelPickerProps> = ({
    value,
    onChange,
    onSave,
    items,
    isOpen,
    setOpen,
    title,
    popupHeight = 120,
    itemHeight = 36,
    textAlign = 'left',
}) => {
    const onClose = useCallback(() => {
        handleClose();
        setOpen(false);
    }, [setOpen]);

    const handleSave = useCallback(() => {
        if (value && onSave) {
            // Находим полный объект из items по выбранному значению
            const selectedItem = items.find((item) => item.value === value.value);
            onSave(selectedItem ?? value);
        }
        onClose();
    }, [value, onSave, onClose, items]);

    const picker = useMemo(
        () => (
            <Picker
                value={value || { title: '', value: '' }}
                onChange={onChange}
                wheelMode="natural"
                height={popupHeight}
                itemHeight={itemHeight}
            >
                <Picker.Column name={'value'}>
                    {items
                        .filter((item) => item && item.value !== undefined)
                        .map((item) => (
                            <Picker.Item key={String(item.value)} value={item.value}>
                                {({ selected }) => (
                                    <div className={css.selectorItem}>
                                        <span
                                            className={classNames(
                                                css.item,
                                                { [css.item__selected]: selected },
                                                css[textAlign]
                                            )}
                                        >
                                            {String(item.title || '')}
                                        </span>
                                        {item.subtitle && <span>{String(item.subtitle)}</span>}
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
                    <UniversalButton title={'Сохранить'} width={'full'} theme={'secondary'} action={handleSave} />
                </div>
            </ContentContainer>
        </StyledPopup>
    );
};
