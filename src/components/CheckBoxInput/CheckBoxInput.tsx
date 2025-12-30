import React from 'react';
import { CheckboxIcon } from '@/components/Icons/CheckboxIcon.tsx';
import css from '@/components/CheckBoxInput/CheckBoxInput.module.css';
import classnames from 'classnames';

interface CheckBoxInputProps {
    checked: boolean;
    toggle: () => void;
    label: React.ReactNode;
    noBackground?: boolean;
    bold?: boolean;
    fontSize?: number;
}

export const CheckBoxInput: React.FC<CheckBoxInputProps> = ({
    checked,
    toggle,
    label,
    noBackground,
    bold,
    fontSize,
}) => {
    return (
        <label
            style={fontSize !== undefined ? { fontSize } : undefined}
            className={classnames(css.agreeCheckbox_container, css.agreeCheckbox_label, {
                [css.noBackground]: noBackground,
                [css.boldLabel]: bold,
            })}
            onClick={toggle}
        >
            <div className={`${css.checkbox} ${checked ? css.checked : ''}`}>
                {checked && <CheckboxIcon size={14} />}
            </div>
            {label}
        </label>
    );
};
