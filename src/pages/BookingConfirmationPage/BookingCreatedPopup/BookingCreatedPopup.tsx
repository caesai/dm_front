import { FC } from 'react';
import styled from 'styled-components';
import Popup from 'reactjs-popup';
import { useNavigate } from 'react-router-dom';
import css from './BookingCreatedPopup.module.css';
import { RoundedButton } from '@/components/RoundedButton/RoundedButton.tsx';
import { CrossIcon } from '@/components/Icons/CrossIcon.tsx';

interface Props {
    isOpen: boolean;
    rest_title: string;
    rest_address: string;
    booking_date: string;
    booking_time: string;
}

const StyledPopup = styled(Popup)`
    &-overlay {
        background: #58585869;
    }
    // use your custom style for ".popup-content"
    &-content {
        border-radius: 10px;
        margin: 0;
        padding: 0;
        width: calc(100% - 30px);
    }
`;

export const BookingCreatedPopup: FC<Props> = ({
    isOpen,
    rest_title,
    rest_address,
    booking_date,
    booking_time,
}) => {
    const navigate = useNavigate();

    const onClose = () => navigate('/myBookings');

    return (
        <StyledPopup open={isOpen} onClose={onClose}>
            <div className={css.wrapper}>
                <div className={css.nav}>
                    <RoundedButton
                        action={onClose}
                        icon={
                            <CrossIcon size={44} color={'var(--dark-grey)'} />
                        }
                    />
                </div>
                <span className={css.text}>
                    Будем ждать вас в{' '}
                    <span className={css.dontBreak}>{rest_title}</span> по
                    адресу <span className={css.dontBreak}>{rest_address}</span>{' '}
                    <span className={css.dontBreak}>{booking_date}</span> в{' '}
                    <span className={css.dontBreak}>{booking_time}</span>
                </span>
            </div>
        </StyledPopup>
    );
};
