import React from 'react';
import css from './GastronomyOrderPopup.module.css';
import styled from 'styled-components';
import Popup from 'reactjs-popup';
import { UniversalButton } from '@/components/Buttons/UniversalButton/UniversalButton.tsx';
import { RoundedButton } from '@/components/RoundedButton/RoundedButton.tsx';
import { MiniCrossIcon } from '@/components/Icons/MiniCrossIcon.tsx';
import { APIPostCancelOrder } from '@/api/gastronomy.api.ts';
import { useAtom } from 'jotai';
import { authAtom } from '@/atoms/userAtom.ts';
import useToastState from '@/hooks/useToastState.ts';

interface IGastronomyOrderProps {
    isOpen: boolean;
    setOpen: (x: boolean) => void;
    order_id: string;
}

const StyledPopup = styled(Popup)`

    &-content {
        background-color: transparent;
        border: 0;
        padding: 0 15px;
        width: 100%;
    }
`;

const GastronomyOrderPopup: React.FC<IGastronomyOrderProps> = ({ isOpen, setOpen, order_id }) => {
    const [auth] = useAtom(authAtom);
    const { showToast } = useToastState();

    const onClose = () => {
        setOpen(false);
    };

    const cancelOrder = () => {
        if (auth) {
            APIPostCancelOrder(order_id, auth?.access_token)
                .then(() => {
                    // TODO: Возможно нужен тост или какое то сообщение об успехе
                })
                .catch(err => {
                    console.error(err);
                    showToast('Возникла ошибка. Повторите снова.');
                });
        }
    };

    return (
        <StyledPopup
            open={isOpen}
            onClose={onClose}
        >
            <div className={css.content}>
                <div className={css.closeButton}>
                    <RoundedButton
                        icon={<MiniCrossIcon color={'black'} />}
                        bgColor={'var(--secondary-background)'}
                        action={() => onClose()}
                        style={{
                            width: '44px',
                            height: '44px',
                            minWidth: '44px',
                        }}
                    />
                </div>
                <span className={css.text}>Вы уверены, что хотите отменить заказ?</span>
                <div className={css.buttons}>
                    <UniversalButton width={'full'} title={'Нет, оставить'} theme={'red'} action={onClose} />
                    <UniversalButton width={'full'} title={'Да, отменить'} action={cancelOrder} />
                </div>
            </div>
        </StyledPopup>
    );
};

export default GastronomyOrderPopup;
