import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
// Components
import { BackIcon } from '@/components/Icons/BackIcon.tsx';
import { Page } from '@/components/Page.tsx';
import { RoundedButton } from '@/components/RoundedButton/RoundedButton.tsx';
import { BottomButtonWrapper } from '@/components/BottomButtonWrapper/BottomButtonWrapper.tsx';
// Hooks
import { useNavigationHistory } from '@/hooks/useNavigationHistory.ts';
// Styles
import css from '@/pages/PrivilegePage/PrivilegePage.module.css';
// Images
import hospitalityHeroesLogo from '/img/hospitality_heroes.png';
import { ModalPopup } from '@/components/ModalPopup/ModalPopup';
import { HeaderContainer } from '@/components/ContentBlock/HeaderContainer/HeaderContainer';
import { HeaderContent } from '@/components/ContentBlock/HeaderContainer/HeaderContent/HeaderContainer';
import { ContentContainer } from '@/components/ContentContainer/ContentContainer';

/**
 * Страница привилегий
 * @returns {JSX.Element} страница привилегий
 */
export const PrivilegePage: React.FC = (): JSX.Element => {
    const navigate = useNavigate();
    const { goBack } = useNavigationHistory();
    const location = useLocation();
    const state = location.state;
    const applicationSuccess = state?.application_success;
    const [isApplicationSuccessOpen, setIsApplicationSuccessOpen] = useState(applicationSuccess);
    /**
     * Обработка кнопки "Забронировать"
     */
    const goToBookingPage = () => {
        navigate('/booking');
    };
    /**
     * Обработка закрытия модального окна
     */
    const setOpen = () => {
        setIsApplicationSuccessOpen(false);
    };
    return (
        <Page back={true} className={css.page}>
            <ModalPopup
                isOpen={isApplicationSuccessOpen}
                setOpen={setOpen}
                text={'Добро пожаловать в коммьюнити Hospitality Heroes! Ваша привилегия активирована.'}
            />
            <HeaderContainer className={css.header}>
                <RoundedButton icon={<BackIcon size={24} color={'var(--dark-grey)'} />} action={goBack} />
                <HeaderContent title={'Привилегии'} className={css.header_title} />
                <div className={css.header_spacer}></div>
            </HeaderContainer>
            <ContentContainer className={css.content}>
                <img src={hospitalityHeroesLogo} alt="Hospitality Heroes" className={css.content_img} />
                <ul className={css.content_description_list}>
                    <li>Скидка 40% в ресторанах Smoke BBQ, Self Edge, Poly, Pame, Blackchops, Trappist.</li>
                    <li>Применяется по понедельникам с 15:00 до 19:00, кроме праздничных и выходных дней.</li>
                    <li>Скидка предоставляется только при бронировании стола через приложение.</li>
                    <li>
                        Скидка не действует на покупку сертификатов, специальные предложения и некоторые позиции меню
                        (уточняйте у официанта).
                    </li>
                </ul>
            </ContentContainer>
            <BottomButtonWrapper content={'Забронировать'} type={'button'} onClick={goToBookingPage} />
        </Page>
    );
};
