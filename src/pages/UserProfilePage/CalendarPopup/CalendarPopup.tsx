import Popup from 'reactjs-popup';
import { FC } from 'react';
import { DatePicker } from '@/components/DatePicker/DateInput.tsx';
import styled from 'styled-components';
import { BanquetDatepicker } from '@/components/BanquetDatepicker/BanquetDatepicker.tsx';
import { IBanquetOptions } from '@/types/banquets.types.ts';

interface ICalendarPopup {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    initialDate?: Date;
    currentDate?: Date;
    setDate: (date: Date) => void;
    banquet?: IBanquetOptions;
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
                {p.banquet ? (
                    <BanquetDatepicker
                        initialDate={p.initialDate}
                        currentDate={p.currentDate}
                        onSelectDate={p.setDate}
                        banquet={p.banquet}
                    />
                ) : (
                    <DatePicker
                        initialDate={p.initialDate}
                        onSelectDate={p.setDate}
                    />
                )}
            </div>
        </StyledPopup>
    );
};
