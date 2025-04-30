import { FC } from 'react';
import Popup from 'reactjs-popup';
import css from './CallRestaurantPopup.module.css';
import { UniversalButton } from '@/components/Buttons/UniversalButton/UniversalButton.tsx';
import { callPhone } from '@/utils.ts';
import styled from 'styled-components';

interface Props {
    isOpen: boolean;
    setOpen: (x: boolean) => void;
    phone: string;
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

export const CallRestaurantPopup: FC<Props> = (p) => {
    const onClose = () => p.setOpen(false);

    return (
        <StyledPopup
            open={p.isOpen}
            onClose={onClose}
            position={'top center'}
            contentStyle={{ width: 'calc(100vw-30px)' }}
            modal
        >
            <div className={css.popup}>
                <div className={css.info}>
                    <span>Позвонить по номеру</span>
                    <span>{p.phone}</span>
                </div>
                <div className={css.buttons}>
                    <UniversalButton
                        width={'full'}
                        title={'Позже'}
                        action={onClose}
                    ></UniversalButton>
                    <UniversalButton
                        width={'full'}
                        title={'Позвонить'}
                        action={() => callPhone(p.phone)}
                        theme={'red'}
                    ></UniversalButton>
                </div>
            </div>
        </StyledPopup>
    );
};
