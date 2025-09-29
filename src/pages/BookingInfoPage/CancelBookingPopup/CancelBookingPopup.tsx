import Popup from 'reactjs-popup';
import styled from 'styled-components';
import css from './CancelBookingPopup.module.css';
import { UniversalButton } from '@/components/Buttons/UniversalButton/UniversalButton.tsx';

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

interface Props {
    isOpen: boolean;
    setOpen: (x: boolean) => void;
    onSubmit: () => void;
}

export const CancelBookingPopup = ({ isOpen, setOpen, onSubmit }: Props) => {
    const close = () => setOpen(false);
    return (
        <StyledPopup open={isOpen} onClose={close}>
            <div className={css.popup}>
                <span className={css.text}>
                    Вы уверены, что хотите отменить бронирование?
                </span>
                <div className={css.buttons}>
                    <UniversalButton
                        width={'full'}
                        title={'Нет'}
                        action={close}
                    />
                    <UniversalButton
                        width={'full'}
                        title={'Да'}
                        theme={'red'}
                        action={onSubmit}
                    />
                </div>
            </div>
        </StyledPopup>
    );
};
