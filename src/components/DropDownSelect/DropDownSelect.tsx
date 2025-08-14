import React, { ReactNode } from 'react';
import classNames from 'classnames';
import { DownArrow } from '@/components/Icons/DownArrow.tsx';
import css from './DropDownSelect.module.css';

interface DropDownSelectProps {
    title: string;
    onClick?: () => void;
    isValid: boolean;
    icon?: ReactNode;
}

export const DropDownSelect: React.FC<DropDownSelectProps> = ({title, onClick, isValid, icon}) => {
    return (
        <div
            className={classNames(
                css.dropdown,
                !isValid ? css.invalid : null,
            )}
            onClick={onClick}
        >
            <div
                className={css.select}
            >
                {icon && icon}
                <span
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
