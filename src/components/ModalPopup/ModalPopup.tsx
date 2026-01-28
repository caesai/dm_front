import React from 'react';
import Popup from 'reactjs-popup';
import { RoundedButton } from '@/components/RoundedButton/RoundedButton.tsx';
import { CrossIcon } from '@/components/Icons/CrossIcon.tsx';
import classNames from 'classnames';
import css from '@/components/ModalPopup/ModalPopup.module.css';

// Стили overlay в глобальном index.css для мгновенной загрузки
// Стили content передаём через props для избежания styled-components

const contentStyle = {
    margin: 0,
    padding: 0,
    borderRadius: '15px',
    width: 'calc(100vw - 30px)',
    maxWidth: '340px',
    height: 'max-content',
};

const overlayStyle = {
    padding: '0 15px',
    alignItems: 'center',
    justifyContent: 'center',
};

interface ModalProps {
    isOpen: boolean;
    setOpen: () => void;
    text?: string;
    title?: string;
    subtitle?: string;
    button?: boolean;
    btnAction?: () => void;
    btnDisabled?: boolean;
    btnText?: string;
    btnScndrText?: string;
    btnScndrAction?: () => void;
    btnsColumn?: boolean;
    list?: React.ReactNode;
    reverseButton?: boolean;
}

export const ModalPopup: React.FC<ModalProps> = (
    {
        isOpen,
        title,
        subtitle,
        text,
        setOpen,
        button = false,
        btnAction,
        btnDisabled,
        btnText,
        btnScndrText,
        btnScndrAction,
        list,
        reverseButton,
        btnsColumn,
    },
) => {
    const handleSecondButton = () => {
        if (btnScndrAction) {
            btnScndrAction();
            return;
        }
        setOpen();
    };
    return (
        <Popup 
            open={isOpen} 
            closeOnDocumentClick={false}
            contentStyle={contentStyle}
            overlayStyle={overlayStyle}
        >
            <div className={css.popup}>
                <div className={css.end}>
                    <RoundedButton
                        icon={<CrossIcon size={44} color={'black'} />}
                        action={setOpen}
                    />
                </div>
                <div style={{ paddingTop: 5 }} />
                {title && <span className={css.title}>{title}</span>}
                {subtitle && <span className={css.sub_title}>{subtitle}</span>}
                {text && (
                    <div className={css.center}>
                        <span className={classNames(css.text, { [css.margin_bottom]: !button })}>{text}</span>
                    </div>
                )}
                {list && list}
                {button && (
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '10px',
                        flexDirection: reverseButton ? 'row-reverse' : btnsColumn ? 'column' : 'row',
                    }}>
                        <button className={classNames(css.button, btnDisabled ? css.button__disabled : '')}
                                onClick={btnAction} disabled={btnDisabled}>
                            {btnText}
                        </button>
                        {btnScndrText !== undefined && (
                            <button className={classNames(css.button, css.button__disabled)}
                                    onClick={handleSecondButton}>
                                {btnScndrText}
                            </button>
                        )}
                    </div>
                )}
            </div>
        </Popup>
    );
};
