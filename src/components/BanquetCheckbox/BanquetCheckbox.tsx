import React, { ReactNode } from 'react';
import css from './BanquetCheckbox.module.css';
import { CheckboxIcon } from '@/components/Icons/CheckboxIcon.tsx';

interface CheckBoxInputProps {
    checked: boolean;
    toggle: () => void;
    label: ReactNode;
}

export const BanquetCheckbox: React.FC<CheckBoxInputProps> = ({ checked, toggle, label }) => {
    return (
        <label className={css.agreeCheckbox_container} onClick={toggle}>
            <div className={`${css.checkbox} ${checked ? css.checked : ''}`}>
                {checked && <CheckboxIcon size={14} />}
            </div>
            <span className={css.agreeCheckbox_label}>
                {label}
            </span>
        </label>
    );
};