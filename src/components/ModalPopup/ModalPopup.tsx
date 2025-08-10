import styled from 'styled-components';
import React from 'react';
import Popup from 'reactjs-popup';
import css from './ModalPopup.module.css';
import { RoundedButton } from '@/components/RoundedButton/RoundedButton.tsx';
import { CrossIcon } from '@/components/Icons/CrossIcon.tsx';
import classNames from 'classnames';

const StyledPopup = styled(Popup)`
    &-overlay {
        background: #58585869;
        padding: 0 15px;
    }
    // use your custom style for ".popup-content"
    &-content {
        //background-color: transparent;
        margin: 0;
        padding: 0;
        border-radius: 10px;
        width: calc(100vw - 30px);
        max-width: 340px;
    }
`;

interface ModalProps {
    isOpen: boolean;
    setOpen: (x: boolean) => void;
    text?: string;
    title?: string;
    subtitle?: string;
    button?: boolean;
    btnAction?: () => void;
    btnText?: string;
}

export const ModalPopup: React.FC<ModalProps> = ({
    isOpen,
    title,
    subtitle,
    text,
    setOpen,
    button = false,
    btnAction,
    btnText,
}) => {
    const close = () => {
        console.log('wtf');
        setOpen(false);
    }
    return (
        <StyledPopup open={isOpen} onClose={close}>
            <div className={css.popup}>
                <div className={css.end}>
                    <RoundedButton
                        icon={<CrossIcon size={44} color={'black'} />}
                        action={close}
                    />
                </div>
                {title && <span className={css.title}>{title}</span>}
                {subtitle && <span className={css.sub_title}>{subtitle}</span>}
                <div className={css.center}>
                    <span className={css.text}>{text}</span>
                </div>
                {button && (
                    <>
                        <button className={classNames(css.button)} onClick={btnAction}>
                            {btnText}
                        </button>
                        <button className={classNames(css.button, css.button__disabled)} onClick={close}>
                            Отменить
                        </button>
                    </>
                )}
            </div>
        </StyledPopup>
    );
};
