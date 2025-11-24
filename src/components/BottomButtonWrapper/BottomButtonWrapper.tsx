import React, { ReactNode, Ref } from 'react';
import classnames from 'classnames';
import css from './BottomButtonWrapper.module.css';

interface BottomButtonWrapperProps {
    isDisabled?: boolean;
    isLoading?: boolean;
    onClick?: () => void;
    forwardedRef?: Ref<HTMLDivElement>;
    additionalBtns?: ReactNode;
    content?: ReactNode;
    isFixed?: boolean;
    theme?: 'red' | 'primary';
}

export const BottomButtonWrapper: React.FC<BottomButtonWrapperProps> =
    ({
         isDisabled,
         isLoading,
         onClick,
         forwardedRef,
         additionalBtns,
         content = 'Забронировать',
         isFixed = true,
         theme = 'red',
    }) => {
    return (
        <div className={classnames(css.absoluteBottom, { [css.relativeBottom]: !isFixed})} ref={forwardedRef}>
            <div className={css.absoluteBottom_wrapper}>
                <div
                    className={classnames(
                        css.redButton,
                        isDisabled ? null : css.disabledButton,
                        isLoading && css.loadingButton,
                        theme === 'red' ? css.red : css.primary,
                    )}
                    onClick={onClick}
                >
                    <span className={css.text}>{content}</span>
                </div>
                {additionalBtns && additionalBtns}
            </div>
        </div>
    )
}
