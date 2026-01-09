import React, { CSSProperties, ReactNode } from 'react';
import classNames from 'classnames';
// Icons
import { DownArrow } from '@/components/Icons/DownArrow.tsx';
// Styles
import css from './DropDownSelect.module.css';

/**
 * Пропсы компонента DropDownSelect.
 * @interface IDropDownSelectProps
 */
export interface IDropDownSelectProps {
    title: string;
    onClick?: () => void;
    /** Флаг валидности */
    isValid?: boolean;
    /** Иконка */
    icon?: ReactNode;
    /** Стили текста */
    textStyle?: CSSProperties;
    /** Флаг disabled */
    disabled?: boolean;
}

/**
 * Компонент выбора даты из списка
 * @param {IDropDownSelectProps} props - Пропсы компонента
 * @returns {JSX.Element} Компонент выбора даты из списка
 */
export const DropDownSelect: React.FC<IDropDownSelectProps> = ({
    title,
    onClick,
    isValid,
    icon,
    textStyle,
    disabled,
}): JSX.Element => {
    return (
        <button
            type="button"
            className={classNames(css.dropdown, {
                [css.disabled]: disabled,
                [css.invalid]: !isValid,
            })}
            onClick={onClick}
            disabled={disabled}
        >
            <div className={css.select}>
                {icon && icon}
                <span style={textStyle} className={css.select_text}>
                    {title}
                </span>
            </div>
            <div className={css.select_arrow}>
                <DownArrow />
            </div>
        </button>
    );
};
