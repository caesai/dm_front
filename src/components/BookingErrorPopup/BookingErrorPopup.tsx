import React, { useEffect, useState } from 'react';
import Popup from 'reactjs-popup';
import styled from 'styled-components';
import classNames from 'classnames';
import css from './BookingErrorPopup.module.css';
import { BASE_BOT } from '@/api/base.ts';

const StyledPopup = styled(Popup)`
    &-overlay {
        background: #58585869;
    }

    // use your custom style for ".popup-content"

    &-content {
        padding: 0;
        width: calc(100vw - 30px);
        border-radius: 12px;
    }
`;

interface BookingErrorPopupProps {
    isOpen: boolean;
    setOpen: (x: boolean) => void;
    resId: number;
}

export const BookingErrorPopup: React.FC<BookingErrorPopupProps> = (props) => {
    const close = () => props.setOpen(false);
    const [isClosing, setIsClosing] = useState(false);
    // hack to prevent from scrolling on page
    useEffect(() => {
        if (props.isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'scroll';
        }
        return () => {
            document.body.style.overflow = 'scroll';
        };
    }, [props]);

    useEffect(() => {
        if (isClosing) {
            setTimeout(() => close(), 200);
        }
    }, [isClosing]);

    useEffect(() => {
        if (props.isOpen) {
            setIsClosing(false);
        }
    }, [props.isOpen]);

    const sendToTelegram = () => {
        if (window.Telegram.WebApp) {
            window.location.href = `https://t.me/${BASE_BOT}?start=error_booking-${Number(props.resId)}`
            // window.Telegram.WebApp.close();
        } else {
            window.location.href = `https://t.me/${BASE_BOT}?start=error_booking-${Number(props.resId)}`
        }
    }

    return (
        <StyledPopup
            open={props.isOpen}
            onClose={close}
            closeOnDocumentClick={true}
            className={isClosing ? 'popupClose' : 'popup'}
        >
            <div
                className={classNames(
                    css.popup,
                    isClosing ? css.popup__closing : null,
                )}
            >
                <span className={css.title}>Произошла ошибка бронирования</span>
                <span className={css.tags_title}>Попробуйте еще раз или свяжитесь с нами</span>
                <button
                    className={classNames(
                        css.button,
                    )}
                    onClick={sendToTelegram}
                >
                    Написать в Telegram
                </button>
                <button
                    className={classNames(
                        css.button, css.button__disabled,
                    )}
                    // onClick={close}
                >
                    Позвонить
                </button>
            </div>
        </StyledPopup>
    );
};
