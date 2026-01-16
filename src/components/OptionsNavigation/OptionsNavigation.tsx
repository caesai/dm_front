import React, { useState } from 'react';
// Components
import { OptionsNavigationElement } from '@/components/OptionsNavigation/OptionsNavigationElement/OptionsNavigationElement.tsx';
import { PrivelegiesPopup } from '@/components/PrivelegiesPopup/PrivelegiesPopup.tsx';
// Styles
import css from '@/components/OptionsNavigation/OptionsNavigation.module.css';
// Mocks
import BookingsIcon from "/img/nav-btn1.png"
import EventsIcon from "/img/nav-btn2.png"
import CertificatesIcon from "/img/nav-btn3.png"
import BanquetsIcon from "/img/nav-btn4.png"
import { ContentBlock } from '@/components/ContentBlock/ContentBlock.tsx';

interface IOptionsNavigationProps {}

export const OptionsNavigation: React.FC<IOptionsNavigationProps> = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <ContentBlock className={css.optionsNavigation}>
            <PrivelegiesPopup isOpen={isOpen} setOpen={setIsOpen} />
            <OptionsNavigationElement title={'Бронирования'} link={'/myBookings'} img={BookingsIcon} />
            <OptionsNavigationElement title={'Мероприятия'} link={'/events'} img={EventsIcon} />
            <OptionsNavigationElement title={'Сертификаты'} link={'/certificates/1'} img={CertificatesIcon} />
            <OptionsNavigationElement title={'Банкеты'} link={'/banquets/:restaurantId/address'} img={BanquetsIcon} />
        </ContentBlock>
    );
};
