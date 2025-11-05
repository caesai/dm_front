import React from 'react';
import { CheckboxIcon } from '@/components/Icons/CheckboxIcon.tsx';
import css from '@/components/CheckBoxInput/CheckBoxInput.module.css';
import classnames from 'classnames';

interface CheckBoxInputProps {
    checked: boolean;
    toggle: () => void;
    label: React.ReactNode;
    noBackground?: boolean;
}

export const CheckBoxInput: React.FC<CheckBoxInputProps> = ({ checked, toggle, label, noBackground }) => {
    return (
        <label className={classnames(css.agreeCheckbox_container, { [css.noBackground]: noBackground })} onClick={toggle}>
            <div className={`${css.checkbox} ${checked ? css.checked : ''}`}>
                {checked && <CheckboxIcon size={14} />}
            </div>
            {label}
        </label>
    );
};
