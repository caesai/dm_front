import React, { useEffect } from 'react';
import Popup from 'reactjs-popup';
import styled from 'styled-components';
import classNames from 'classnames';
import css from '../BookingErrorPopup/BookingErrorPopup.module.css';

import { CrossIcon } from '@/components/Icons/CrossIcon.tsx';
import { RoundedButton } from '@/components/RoundedButton/RoundedButton.tsx';
// import { BASE_BOT } from '@/api/base.ts';

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

interface BookingSpecialPopupProps {
    isOpen: boolean;
    setOpen: (x: boolean) => void;
    resId: number;
    createBooking: () => void;
    setMenuPopupOpen: (x: boolean) => void;
}

export const BookingSpecialPopup: React.FC<BookingSpecialPopupProps> = (props) => {
    const close = () => props.setOpen(false);
    // const [isClosing, setIsClosing] = useState(false);
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
    //
    // useEffect(() => {
    //     if (isClosing) {
    //         setTimeout(() => close(), 200);
    //     }
    // }, [isClosing]);
    //
    // useEffect(() => {
    //     if (props.isOpen) {
    //         setIsClosing(false);
    //     }
    // }, [props.isOpen]);

    const showMenuPopup = () => {
        props.setMenuPopupOpen(true);
    }

    return (
        <StyledPopup
            open={props.isOpen}
            // onClose={close}
            // closeOnDocumentClick={true}
            className={'popup'}

        >

            <div
                className={classNames(
                    css.popup,
                    // isClosing ? css.popup__closing : null,
                )}
            >
                <div style={{position: 'absolute', top: 10, right: 10}}>
                    <RoundedButton
                        icon={<CrossIcon size={44} color={'black'} />}
                        bgColor={'var(--primary-background) !important'}
                        action={() => close()}
                    />
                </div>
                <span className={css.title}>Обращаем ваше внимание. </span>
                <span className={css.tags_title}>В это время будет действовать специальное меню, посвящённое Blackchops Steak Club.</span>

                <button
                    className={classNames(
                        css.button, css.button__disabled,
                    )}
                    onClick={showMenuPopup}
                >
                    Посмотреть меню
                </button>
                <button
                    className={classNames(
                        css.button,
                    )}
                    onClick={props.createBooking}
                >
                    Забронировать
                </button>
            </div>
        </StyledPopup>
    );
};
