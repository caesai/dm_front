/**
 * @fileoverview страница акции Hospitality Heroes
 * пользователям необходимо заполнить анкету на странице HospitalityHeroesApplicationForm
 * затем им будет доступна ссылка в 40% в определенные дни недели в определенные временные слоты
 * на карточке бронирования у таких пользователей будет отображаться иконка со скидкой
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAtomValue } from 'jotai';
// Atoms
import { userAtom } from '@/atoms/userAtom.ts';
// Components
import { Page } from '@/components/Page.tsx';
import { RoundedButton } from '@/components/RoundedButton/RoundedButton.tsx';
import { BackIcon } from '@/components/Icons/BackIcon.tsx';
import { BottomButtonWrapper } from '@/components/BottomButtonWrapper/BottomButtonWrapper.tsx';
import { ContentContainer } from '@/components/ContentContainer/ContentContainer.tsx';
// Styles
import css from '@/pages/HospitalityHeroesPage/HospitalityHeroesPage.module.css';
// Images
import hospitalityHeroesLogo from '/img/hospitality_heroes.png';
import { HeaderContent } from '@/components/ContentBlock/HeaderContainer/HeaderContent/HeaderContainer';
import { HeaderContainer } from '@/components/ContentBlock/HeaderContainer/HeaderContainer';
import { ContentBlock } from '@/components/ContentBlock/ContentBlock';

/**
 * Страница Hospitality Heroes
 * @returns {JSX.Element} страница Hospitality Heroes
 */
export const HospitalityHeroesPage: React.FC = (): JSX.Element => {
    const navigate = useNavigate();
    const user = useAtomValue(userAtom);
    /**
     * Переход на страницу заполнения анкеты Hospitality Heroes
     */
    const goToApplicationForm = () => {
        if (user?.complete_onboarding) {
            navigate('/hospitality-heroes/application');
        } else {
            navigate('/onboarding/3', { state: { hospitalityHeroes: true } });
        }
    };
    /**
     * Переход на главную страницу
     */
    const handleGoBack = () => {
        navigate('/', { replace: true });
    };

    return (
        <Page className={css.page} back={false}>
            <HeaderContainer className={css.header}>
                <RoundedButton
                    bgColor={'var(--primary-background)'}
                    icon={<BackIcon color={'var(--dark-grey)'} />}
                    action={handleGoBack}
                />
                <HeaderContent title={'Hospitality Heroes'} className={css.header_title} />
                <div className={css.header_spacer} />
            </HeaderContainer>
            <ContentContainer className={css.content}>
                <ContentBlock className={css.content_block}>
                    <HeaderContent title={'Только для участников'} className={css.content_title} />
                    <HeaderContent title={'Hospitality Heroes'} className={css.content_title} />
                </ContentBlock>
                <img src={hospitalityHeroesLogo} alt="Hospitality Heroes" className={css.content_img} />
                <p className={css.content_description}>
                    Мы создаём закрытое сообщество людей, которые делают индустрию гостеприимства сильнее каждый день —
                    шефов, официантов, барменов, сомелье, менеджеров и всех, кто работает с гостями.
                </p>
                <p className={css.content_description}>
                    Чтобы участники сообщества могли чаще встречаться, обмениваться опытом и поддерживать друг друга —
                    для каждого участника комьюнити действует привилегия в ресторанах: Smoke BBQ, Self Edge, Poly, Pame,
                    Blackchops, Trappist.
                </p>
                <p className={css.content_description}>
                    Скидка 40%* каждый понедельник с 15:00 до 19:00 — при бронировании через приложение Dreamteam
                    Concierge.
                </p>
                <p className={css.content_description}>
                    Чтобы стать частью комьюнити и получить привилегию, расскажите немного о себе: где вы работаете и
                    какой у вас опыт. Это помогает создавать сообщество профессионалов — тех, кто действительно живёт
                    индустрией.
                </p>
                <p className={css.content_description}>
                    <b>Как это работает</b>
                </p>
                <ul className={css.content_description_list}>
                    <li className={css.content_description_list_item}>1. Заполните анкету.</li>
                    <li className={css.content_description_list_item}>
                        2. Скидка появится у вас в приложении мгновенно.
                    </li>
                    <li className={css.content_description_list_item}>
                        3. Забронируйте стол — и скидка применится автоматически.
                    </li>
                </ul>
                <p className={css.content_description}>
                    * скидка действительна в течение 3 месяцев с момента регистрации и не распространяется на покупку
                    сертификатов, специальные предложения и некоторые позиции меню (уточняйте у официанта).
                </p>
            </ContentContainer>
            <BottomButtonWrapper content={'Присоединиться'} onClick={goToApplicationForm} />
        </Page>
    );
};
