import React from 'react';
import classNames from "classnames";
import { useAtom } from 'jotai';
import { toastAtom } from '@/atoms/toastAtom.ts';
import css from '@/components/Toast/Toast.module.css';

export const Toast: React.FC = ( ) => {
    const [toastState] = useAtom(toastAtom);
    if (!toastState.isVisible) {
        return null;
    }
    return (
        <div id="snackbar" className={classNames(css.snackbar, css.show )} data-testid={'toast-message'}>
            {toastState.message}
        </div>
    )
}
