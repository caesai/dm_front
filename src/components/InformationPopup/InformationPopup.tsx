import styled from 'styled-components';
import Popup from 'reactjs-popup';
import css from './InformationPopup.module.css';
import { RoundedButton } from '@/components/RoundedButton/RoundedButton.tsx';
import { CrossIcon } from '@/components/Icons/CrossIcon.tsx';
import { useNavigate } from 'react-router-dom';

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
    text?: string;
}

export const InformationPopup = ({ isOpen, text }: Props) => {
    const close = () => navigate('/myBookings');
    const navigate = useNavigate();
    return (
        <StyledPopup open={isOpen} onClose={close}>
            <div className={css.popup}>
                <div className={css.end}>
                    <RoundedButton
                        icon={<CrossIcon size={44} color={'black'} />}
                        action={close}
                    />
                </div>
                <div className={css.center}>
                    <span className={css.text}>{text}</span>
                </div>
            </div>
        </StyledPopup>
    );
};
