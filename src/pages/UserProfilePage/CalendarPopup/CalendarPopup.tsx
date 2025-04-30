import Popup from 'reactjs-popup';
import { FC } from 'react';
import { DatePicker } from '@/components/DatePicker/DateInput.tsx';
import styled from 'styled-components';

interface ICalendarPopup {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    initialDate?: Date;
    setDate: (date: Date) => void;
}

const StyledPopup = styled(Popup)`
    &-overlay {
    }

    &-content {
        width: auto;
        background-color: transparent;
        border: none;
        padding: 0;
    }
`;

export const CalendarPopup: FC<ICalendarPopup> = (p) => {
    const onClose = () => p.setIsOpen(false);

    return (
        <StyledPopup open={p.isOpen} onClose={onClose}>
            <div>
                <DatePicker
                    initialDate={p.initialDate}
                    onSelectDate={p.setDate}
                />
            </div>
        </StyledPopup>
    );
};
