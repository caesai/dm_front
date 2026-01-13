import React, { Dispatch, SetStateAction } from 'react';
import { ContentBlock } from '@/components/ContentBlock/ContentBlock';
import { HeaderContent } from '@/components/ContentBlock/HeaderContainer/HeaderContent/HeaderContainer';
import { ContentContainer } from '@/components/ContentContainer/ContentContainer';
import { DateListSelector } from '@/components/DateListSelector/DateListSelector';
import { GuestCountSelector } from '@/components/GuestCountSelector/GuestCountSelector';
import { CrossIcon } from '@/components/Icons/CrossIcon';
import { RoundedButton } from '@/components/RoundedButton/RoundedButton';
import { formatDateShort } from '@/utils';
import css from '@/pages/BookingPage/BookingPage.module.css';
/**
 * Пропсы компонента заголовка страницы бронирования мероприятия
 * @interface IEventBookingHeaderProps
 */
interface IEventBookingHeaderProps {
    /** Название мероприятия */
    eventName: string;
    /** Количество гостей */
    guestCount: number;
    childrenCount: number;
    /** Функция установки количества гостей */
    setGuestCount: Dispatch<SetStateAction<number>>;
    /** Функция установки количества детей */
    setChildrenCount: Dispatch<SetStateAction<number>>;
    /** Сообщение о стоимости услуги */
    serviceFeeMessage: string;
    /** Функция возврата на предыдущую страницу */
    handleGoBack: () => void;
    /** Дата начала мероприятия */
    dateStart: string;
}
/**
 * Компонент заголовка страницы бронирования бесплатного мероприятия
 * @param {IEventBookingHeaderProps} props - Пропсы компонента
 * @returns {JSX.Element} Компонент заголовка страницы бронирования мероприятия
 */
export const EventBookingHeader: React.FC<IEventBookingHeaderProps> = ({
    eventName,
    guestCount,
    childrenCount,
    setGuestCount,
    setChildrenCount,
    serviceFeeMessage,
    handleGoBack,
    dateStart,
}: IEventBookingHeaderProps): JSX.Element => {
    return (
        <ContentContainer className={css.header}>
            <ContentBlock className={css.nav}>
                <div className={css.separator} />
                <HeaderContent className={css.headerTitle} title={eventName} />
                <RoundedButton icon={<CrossIcon size={44} />} action={handleGoBack} />
            </ContentBlock>
            <ContentBlock className={css.selectors}>
                <ContentBlock className={css.selectorsRow}>
                    <DateListSelector disabled defaultTitle={formatDateShort(dateStart)} />
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
