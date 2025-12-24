import React, { ReactNode, Ref } from 'react';
import classnames from 'classnames';
// Styles
import css from '@/components/BottomButtonWrapper/BottomButtonWrapper.module.css';

interface IBottomButtonWrapperProps {
    isDisabled?: boolean;
    isLoading?: boolean;
    onClick?: () => void;
    forwardedRef?: Ref<HTMLDivElement>;
    additionalBtns?: ReactNode;
    content?: ReactNode;
    isFixed?: boolean;
    theme?: 'red' | 'primary';
    type?: 'button' | 'submit' | 'reset';
}

export const BottomButtonWrapper: React.FC<IBottomButtonWrapperProps> = ({
    isDisabled,
    isLoading,
    onClick,
    forwardedRef,
    additionalBtns,
    content = 'Забронировать',
    isFixed = true,
    theme = 'red',
    type = 'button',
}) => {
    return (
        <div className={classnames(css.bottom_wrapper, { [css.bottom_wrapper_relative]: !isFixed })} ref={forwardedRef}>
            <div className={css.button_wrapper}>
                <button
                    className={classnames(
                        css.button,
                        {[css.disabled]: isDisabled},
                        {[css.loading]: isLoading},
                        {[css.red]: theme === 'red'},
                        {[css.primary]: theme === 'primary'}
                    )}
                    onClick={onClick}
                    type={type}
                >
                    <span className={css.text}>{content}</span>
                </button>
                {additionalBtns && additionalBtns}
            </div>
        </div>
    );
};
