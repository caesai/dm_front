import React from 'react';
import { useNavigate } from 'react-router-dom';
// Components
import { BackIcon } from '@/components/Icons/BackIcon.tsx';
import { Page } from '@/components/Page.tsx';
import { RoundedButton } from '@/components/RoundedButton/RoundedButton.tsx';
import { BottomButtonWrapper } from '@/components/BottomButtonWrapper/BottomButtonWrapper.tsx';
// Hooks
import { useNavigationHistory } from '@/hooks/useNavigationHistory.ts';
// Styles
import css from '@/pages/PrivelegiesPage/PrivelegiesPage.module.css';
// Images
import hospitalityHeroesLogo from '/img/hospitality_heroes.png';


export const PrivelegiesPage: React.FC = () => {
    const navigate = useNavigate();
    const { goBack } = useNavigationHistory();
    const goToBookingPage = () => {
        navigate('/booking');
    };
    return (
        <Page back={true}>
            <div className={css.page}>
                <div className={css.header}>
                    <RoundedButton
                        icon={<BackIcon size={24} color={'var(--dark-grey)'} />}
                        action={goBack}
                    />
                    <span className={css.header_title}>Привилегии</span>
                    <div className={css.header_spacer}></div>
                </div>
                <div className={css.content}>
                    <img src={hospitalityHeroesLogo} alt="Hospitality Heroes" className={css.content_img} />
                    <ul className={css.content_description_list}>
                        <li>Скидка 40% в ресторанах Smoke BBQ, Self Edge, Poly, Pame, Blackchops, Trappist.</li>
                        <li>Применяется по понедельникам с 15:00 до 19:00, кроме праздничных и выходных дней.</li>
                        <li>Скидка предоставляется только при бронировании стола через приложение.</li>
                        <li>Скидка не действует на покупку сертификатов, специальные предложения и некоторые позиции меню (уточняйте у официанта)</li>
                    </ul>
                    <BottomButtonWrapper content={'Забронировать'} type={'button'} onClick={goToBookingPage} />
                </div>
            </div>
        </Page>
    );
};
