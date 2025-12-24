import React from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useAtom } from 'jotai';
// APIs
import { DEV_MODE } from '@/api/base.ts';
// Atoms
import { userAtom } from '@/atoms/userAtom.ts';
// Components
import { Page } from '@/components/Page.tsx';
import { RoundedButton } from '@/components/RoundedButton/RoundedButton.tsx';
import { BackIcon } from '@/components/Icons/BackIcon.tsx';
import { BottomButtonWrapper } from '@/components/BottomButtonWrapper/BottomButtonWrapper.tsx';
// Hooks
import { useNavigationHistory } from '@/hooks/useNavigationHistory.ts';
// Styles
import css from '@/pages/HospitalityHeroesPage/HospitalityHeroesPage.module.css';
// Images
import hospitalityHeroesLogo from '/img/hospitality_heroes.png';

export const HospitalityHeroesPage: React.FC = () => {
    const navigate = useNavigate();
    const { goBack } = useNavigationHistory();
    const [params] = useSearchParams();
    const [user] = useAtom(userAtom);
    const goToApplicationForm = () => {
        if (user?.complete_onboarding) {
            navigate('/hospitality-heroes/application');
        } else {
            navigate('/onboarding/3', { state: { hospitalityHeroes: true } });
        }
    };
    const handleGoBack = () => {
        if (params.get('shared')) {
            navigate('/', { replace: true });
        } else {
            goBack();
        }
    };
    // TODO: Убрать этот блок когда будет готов к релизу
    if (!DEV_MODE) {
        return <Navigate to="/" replace />;
    }
    return (
        <Page>
            <div className={css.page}>
                <div className={css.header}>
                    <RoundedButton
                        bgColor={'var(--primary-background)'}
                        icon={<BackIcon color={'var(--dark-grey)'} />}
                        action={handleGoBack}
                    />
                    <span className={css.header_title}>{'Hospitality Heroes'}</span>
                    <div className={css.header_spacer} />
                </div>
                <div className={css.content}>
                    <h2 className={css.content_title}>
                        {'Только для участников'} <br /> {'Hospitality Heroes'}
                    </h2>
                    <img src={hospitalityHeroesLogo} alt="Hospitality Heroes" className={css.content_img} />
                    <p className={css.content_description}>
                        Мы создаём закрытое сообщество людей, которые делают индустрию гостеприимства сильнее каждый
                        день — шефов, официантов, барменов, сомелье, менеджеров и всех, кто работает с гостями.
                    </p>
                    <p className={css.content_description}>
                        Чтобы участники сообщества могли чаще встречаться, обмениваться опытом и поддерживать друг друга
                        — для каждого участника комьюнити действует привилегия в ресторанах: Smoke BBQ, Self Edge, Poly,
                        Pame, Blackchops, Trappist.
                    </p>
                    <p className={css.content_description}>
                        Скидка 40%* каждый понедельник с 15:00 до 19:00 — при бронировании через приложение Dreamteam
                        Concierge.
                    </p>
                    <p className={css.content_description}>
                        Чтобы стать частью комьюнити и получить привилегию, расскажите немного о себе: где вы работаете
                        и какой у вас опыт. Это помогает создавать сообщество профессионалов — тех, кто действительно
                        живёт индустрией.
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
                    <p>
                        * скидка действительна в течении 3 месяцев с момента регистрации и не распространяется на
                        покупку сертификатов, специальные предложения и некоторые позиции меню (уточняйте у официанта).
                    </p>
                    <BottomButtonWrapper content={'Присоединиться'} onClick={goToApplicationForm} />
                </div>
            </div>
        </Page>
    );
};
