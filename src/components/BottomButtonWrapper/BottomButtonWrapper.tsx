import classNames from 'classnames';
import React, { Ref } from 'react';
import css from './BottomButtonWrapper.module.css';

interface BottomButtonWrapperProps {
    isDisabled?: boolean;
    isLoading?: boolean;
    onClick?: () => void;
    forwardedRef?: Ref<HTMLDivElement>;
}

export const BottomButtonWrapper: React.FC<BottomButtonWrapperProps> = ({ isDisabled, isLoading, onClick, forwardedRef }) => {
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
            </div>
        </div>
    )
}
