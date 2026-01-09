import React, { Dispatch, SetStateAction } from 'react';
// Components
import { ContentBlock } from '@/components/ContentBlock/ContentBlock';
import { HeaderContent } from '@/components/ContentBlock/HeaderContainer/HeaderContent/HeaderContainer';
import { ContentContainer } from '@/components/ContentContainer/ContentContainer';
import { DateListSelector } from '@/components/DateListSelector/DateListSelector';
import { GuestCountSelector } from '@/components/GuestCountSelector/GuestCountSelector';
import { CrossIcon } from '@/components/Icons/CrossIcon';
import { RestaurantsListSelector } from '@/components/RestaurantsListSelector/RestaurantsListSelector';
import { RoundedButton } from '@/components/RoundedButton/RoundedButton';
// Styles
import css from '@/pages/BookingPage/BookingPage.module.css';
import { PickerValue } from '@/lib/react-mobile-picker/components/Picker.tsx';

interface ICommonBookingHeaderProps {
    handleGoBack: () => void;
    selectRestaurant: (value: PickerValue) => void;
    selectDate: (value: PickerValue) => void;
    selectedDate?: PickerValue | null;
    setGuestCount: Dispatch<SetStateAction<number>>;
    setChildrenCount: Dispatch<SetStateAction<number>>;
    serviceFeeMessage: string;
    guestCount: number;
    childrenCount: number;
    availableDates: PickerValue[];
}

/**
 * Компонент общего заголовка бронирования
 * @param {ICommonBookingHeaderProps} props
 * @returns {JSX.Element}
 */
export const CommonBookingHeader: React.FC<ICommonBookingHeaderProps> = ({
    handleGoBack,
    selectRestaurant,
    selectDate,
    selectedDate,
    setGuestCount,
    setChildrenCount,
    serviceFeeMessage,
    guestCount,
    childrenCount,
    availableDates,
}: ICommonBookingHeaderProps): JSX.Element => {
    return (
        <ContentContainer className={css.header}>
            <ContentBlock className={css.nav}>
                <div className={css.separator} />
                <HeaderContent className={css.headerTitle} title="Бронирование" />
                <RoundedButton icon={<CrossIcon size={44} />} action={handleGoBack} />
            </ContentBlock>

            {/* Ресторан, дата и количество гостей */}
            <ContentBlock className={css.selectors}>
                <RestaurantsListSelector onSelect={selectRestaurant} />
                <ContentBlock className={css.selectorsRow}>
                    <DateListSelector 
                        datesList={availableDates} 
                        onSelect={selectDate}
                        value={selectedDate}
                    />
                    <GuestCountSelector
                        guestCount={guestCount}
                        childrenCount={childrenCount}
                        setGuestCount={setGuestCount}
                        setChildrenCount={setChildrenCount}
                        serviceFeeMessage={serviceFeeMessage}
                    />
                </ContentBlock>
            </ContentBlock>
        </ContentContainer>
    );
};
