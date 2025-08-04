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

interface BookingInfoPopupProps {
    isOpen: boolean;
    setOpen: (x: boolean) => void;
}

export const BookingInfoPopup: React.FC<BookingInfoPopupProps> = (props) => {
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

    return (
        <StyledPopup
            open={props.isOpen}
            onClose={close}
            closeOnDocumentClick={true}
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
                <span className={css.tags_title}>У вас есть возможность оформить предзаказ к вашему бронированию. Просто нажмите галочку и в течение 30 минут мы свяжемся с вами для уточнения деталей. Если вы оформляете бронь вне рабочего времени ресторана, мы обязательно свяжемся с вами сразу после открытия ресторана.</span>

            </div>
        </StyledPopup>
    );
};
