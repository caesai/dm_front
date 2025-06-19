import {FC} from 'react';
import Popup from 'reactjs-popup';
import css from './PrivelegiesPopup.module.css';
import styled from 'styled-components';
import {CloseIcon} from "@/components/Icons/CloseIcon.tsx";

interface Props {
    isOpen: boolean;
    setOpen: (x: boolean) => void;
}

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

export const PrivelegiesPopup: FC<Props> = (p) => {
    const onClose = () => p.setOpen(false);

    return (
        <StyledPopup
            open={p.isOpen}
            onClose={onClose}
            position={'top center'}
            contentStyle={{width: 'calc(100vw-30px)'}}
            modal
        >
            <div className={css.popup}>
                <span className={css.closeIcon} onClick={onClose}>
                    <CloseIcon size={44}/>
                </span>
                <div className={css.info}>
                    <span>Ваш уровень<br/> лояльности: Партнер</span>
                </div>
                <div className={css.discount}>
                    <span>Скидка 10% во всех ресторанах<br/> Self Edge Japanese.</span>
                </div>

            </div>
        </StyledPopup>
    );
};
