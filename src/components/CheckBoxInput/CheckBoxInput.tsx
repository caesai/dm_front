import React from 'react';
import css from './CheckBoxInput.module.css';
import { CheckboxIcon } from '@/components/Icons/CheckboxIcon.tsx';

interface CheckBoxInputProps {
    checked: boolean;
    toggle: () => void;
    label: React.ReactNode;
}

export const CheckBoxInput: React.FC<CheckBoxInputProps> = ({ checked, toggle, label }) => {
    return (
        <label className={css.agreeCheckbox_container} onClick={toggle}>
            <div className={`${css.checkbox} ${checked ? css.checked : ''}`}>
                {checked && <CheckboxIcon size={14} />}
            </div>
            {label}
        </label>
    );
};
