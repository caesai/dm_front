import React, { CSSProperties, ReactNode } from 'react';
import classNames from 'classnames';
import { DownArrow } from '@/components/Icons/DownArrow.tsx';
import css from './DropDownSelect.module.css';

interface DropDownSelectProps {
    title: string;
    onClick?: () => void;
    isValid?: boolean;
    icon?: ReactNode;
    textStyle?: CSSProperties;
    disabled?: boolean;
}

export const DropDownSelect: React.FC<DropDownSelectProps> = ({title, onClick, isValid, icon, textStyle, disabled}) => {
    return (
        <div
            className={classNames(
                css.dropdown, {
                    [css.disabled]: disabled,
                    [css.invalid]: !isValid,
                },
            )}
            onClick={disabled ? undefined : onClick}
        >
            <div
                className={css.select}
            >
                {icon && icon}
                <span
                    style={textStyle}
                    className={
                        css.select_text
                    }
                >
                    {title}
                </span>
            </div>
            <div
                className={
                    css.select_arrow
                }
            >
                <DownArrow />
            </div>
        </div>
    );
};
