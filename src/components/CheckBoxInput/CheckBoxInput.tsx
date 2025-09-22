import React, { ReactNode } from 'react';
import css from './CheckBoxInput.module.css';

interface CheckBoxInputProps {
    checked: boolean;
    toggle: () => void;
    label: ReactNode;
}

export const CheckBoxInput: React.FC<CheckBoxInputProps> = ({checked, toggle, label}) => {
    return (
        <div className={css.agreeCheckbox_container}>
            <input
                type="checkbox"
                id={'agree'}
                className={css.agreeCheckbox}
                checked={checked}
                onChange={toggle}
            />
            <label
                htmlFor="agree"
                className={css.agreeCheckbox_label}
            >
                {label}
            </label>
        </div>
    )
}
