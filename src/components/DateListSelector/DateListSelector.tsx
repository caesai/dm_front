import React, { Dispatch, SetStateAction, useEffect } from 'react';
import Popup from 'reactjs-popup';
import styled from 'styled-components';
import classNames from 'classnames';
import { PickerValueObj } from '@/lib/react-mobile-picker/components/Picker.tsx';
import Picker, { PickerValue } from '@/lib/react-mobile-picker';
import { ContentContainer } from '@/components/ContentContainer/ContentContainer.tsx';
import { formatDate } from '@/utils.ts';
import css from '@/components/DateListSelector/DateListSelector.module.css';

interface DateListSelectorProps {
    isOpen: boolean;
    setOpen: (x: boolean) => void;
    date: PickerValue;
    setDate: Dispatch<SetStateAction<PickerValueObj>>;
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

const handleOpen = () => {
    document.body.style.overflow = 'hidden';
};

const handleClose = () => {
    document.body.style.overflow = 'unset'; // Or '' to remove the style
};

export const DateListSelector: React.FC<DateListSelectorProps> = ({
    isOpen,
    setOpen,
    date,
    setDate,
    values,
}) => {
    const onClose = () => {
        handleClose();
        setOpen(false);
    };

    useEffect(() => {
        if (values.length && isOpen && date.value == 'unset') {
            setDate(values[0]);
        }
    }, [isOpen, values]);
    const onChange = (val: PickerValueObj) => {
        setDate({
            title: formatDate(val.value),
            value: val.value,
        });
    };
    const picker = (
        <>
            <Picker value={date as unknown as PickerValueObj} onChange={onChange} wheelMode="natural" height={120}>
                <Picker.Column name={'value'}>
                    {values.map((option) => (
                        <Picker.Item key={option.value} value={option} data-testid="date-item">
                            {({ selected }) => (
                                <div className={css.selectorItem}>
                                    <span className={classNames(css.item, { [css.item__selected]: selected })}>
                                        {formatDate(option.value)}
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
        <StyledPopup open={isOpen} onClose={onClose} modal onOpen={handleOpen}>
            <ContentContainer>
                <div className={css.content}>
                    <h3>Выберите дату</h3>

                    {values.length ? picker : <h3>Загрузка</h3>}
                </div>
            </ContentContainer>
        </StyledPopup>
    );
};
