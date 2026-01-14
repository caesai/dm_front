import React, { SetStateAction, Dispatch } from 'react';
// Types
import { PickerValue } from '@/lib/react-mobile-picker';
// Components
import { ContentBlock } from '@/components/ContentBlock/ContentBlock.tsx';
import { ContentContainer } from '@/components/ContentContainer/ContentContainer.tsx';
import { DateListSelector } from '@/components/DateListSelector/DateListSelector.tsx';
import { GuestCountSelector } from '@/components/GuestCountSelector/GuestCountSelector.tsx';
import { CrossIcon } from '@/components/Icons/CrossIcon.tsx';
import { RoundedButton } from '@/components/RoundedButton/RoundedButton.tsx';
import { HeaderContainer } from '@/components/ContentBlock/HeaderContainer/HeaderContainer.tsx';
import { HeaderContent } from '@/components/ContentBlock/HeaderContainer/HeaderContent/HeaderContainer.tsx';
import { HeaderSubText } from '@/components/ContentBlock/HeaderContainer/HeaderSubText/HeaderContainer.tsx';
// Utils
import { getServiceFeeData } from '@/mockData.ts';
// Styles
import css from '@/pages/BookingPage/BookingPage.module.css';

/**
 * Свойства (Props) компонента RestaurantBookingHeader.
 * @interface
 */
interface IRestaurantBookingHeaderProps {
    restaurantTitle: string;
    restaurantAddress: string;
    handleGoBack: () => void;
    availableDates: PickerValue[];
    selectedDate?: PickerValue | null;
    selectDate: (value: PickerValue) => void;
    guestCount: number;
    childrenCount: number;
    setGuestCount: Dispatch<SetStateAction<number>>;
    setChildrenCount: Dispatch<SetStateAction<number>>;
    restaurantId: number;
}

/**
 * Компонент заголовка бронирования для конкретного ресторана
 * @param {IRestaurantBookingHeaderProps} props
 * @returns {JSX.Element}
 */
export const RestaurantBookingHeader: React.FC<IRestaurantBookingHeaderProps> = ({
    restaurantTitle,
    restaurantAddress,
    handleGoBack,
    availableDates,
    selectedDate,
    selectDate,
    guestCount,
    childrenCount,
    setGuestCount,
    setChildrenCount,
    restaurantId,
}: IRestaurantBookingHeaderProps): JSX.Element => {
    return (
        <ContentContainer className={css.header}>
            <ContentBlock className={css.nav}>
                <div className={css.separator} />
                <HeaderContainer className={css.headerInfo}>
                    <HeaderContent className={css.headerTitle} title="Бронирование" />
                    <HeaderContent className={css.headerTitle} title={<b>{restaurantTitle}</b>} />
                    <HeaderSubText className={css.headerAddress} text={restaurantAddress} />
                </HeaderContainer>
                <RoundedButton icon={<CrossIcon size={44} />} action={handleGoBack} />
            </ContentBlock>
            {/* Дата и количество гостей */}
            <ContentBlock className={css.selectorsRow}>
                {/* Селекторы даты и гостей (скрытые popup) */}
                <DateListSelector 
                    datesList={availableDates} 
                    onSelect={selectDate}
                    value={selectedDate}
                    defaultTitle={'Дата'}
                />
                <GuestCountSelector
                    guestCount={guestCount}
                    childrenCount={childrenCount}
                    setGuestCount={setGuestCount}
                    setChildrenCount={setChildrenCount}
                    serviceFeeMessage={getServiceFeeData(String(restaurantId))}
                />
            </ContentBlock>
        </ContentContainer>
    );
};
