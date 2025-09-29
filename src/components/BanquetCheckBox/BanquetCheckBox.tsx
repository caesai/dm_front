import React, { ReactNode } from 'react';
import css from './BanquetCheckBox.module.css';

interface CheckBoxInputProps {
    checked: boolean;
    toggle: () => void;
    label: ReactNode;
}

export const BanquetCheckBox: React.FC<CheckBoxInputProps> = ({checked, toggle, label}) => {
    return (
        <label className={css.agreeCheckbox_container}>
            <input
                type="checkbox"
                className={css.agreeCheckbox}
                checked={checked}
                onChange={toggle}
            />
            <span
                className={css.agreeCheckbox_label}
            >
                {label}
            </span>
        </label>
    )
}
