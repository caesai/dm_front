import React from 'react';
import css from './Toast.module.css';
import classNames from "classnames";

interface IToastProps {
    message: string | null;
    showClose: boolean;
}

export const Toast: React.FC<IToastProps> = (p ) => {
    if (!p.message) {
        return <></>;
    }
    return (
        <div
            id="snackbar"
             className={classNames(
                css.snackbar,
                p.showClose ? css.show : null
            )}
            data-testid={'toast-message'}
        >{p.message}</div>
    )
}
