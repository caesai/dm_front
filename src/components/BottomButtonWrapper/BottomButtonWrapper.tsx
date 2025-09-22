import classNames from 'classnames';
import React, { ReactNode, Ref } from 'react';
import css from './BottomButtonWrapper.module.css';

interface BottomButtonWrapperProps {
    isDisabled?: boolean;
    isLoading?: boolean;
    onClick?: () => void;
    forwardedRef?: Ref<HTMLDivElement>;
    additionalBtns?: ReactNode;
}

export const BottomButtonWrapper: React.FC<BottomButtonWrapperProps> = ({ isDisabled, isLoading, onClick, forwardedRef, additionalBtns }) => {
    return (
        <div className={css.absoluteBottom} ref={forwardedRef}>
            <div className={css.absoluteBottom_wrapper}>
                <div
                    className={classNames(
                        css.redButton,
                        isDisabled ? null : css.disabledButton,
                        isLoading && css.loadingButton
                    )}
                    onClick={onClick}
                >
                    <span className={css.text}>Забронировать</span>
                </div>
                {additionalBtns && additionalBtns}
            </div>
        </div>
    )
}
