import React from 'react';
import { Page } from '@/components/Page.tsx';
import css from './CertificateLandingPage.module.css';
import { DTHospitalityIcon } from '@/components/Icons/DTHospitalityIcon.tsx';
import AccordionComponent from '@/components/Accordion/AccordionComponent.tsx';
import { UniversalButton } from '@/components/Buttons/UniversalButton/UniversalButton.tsx';

const CertificateLandingPage: React.FC = () => {
    return (
        <Page back={true}>
            <section className={css.container}>
                <div className={css.content}>
                    <div className={css.header}>
                        <DTHospitalityIcon />
                        <h1>
                            Подарочный сертификат <br /> в любой ресторан Dreamteam
                        </h1>
                    </div>
                    <div className={css.certificateFields}>
                        <div className={css.row}>
                            <span>Номинал:</span>
                            <span>
                                <b>10 000₽</b>
                            </span>
                        </div>
                        <div className={css.row}>
                            <span>Для кого:</span>
                            <span>
                                <b>Михаил</b>
                            </span>
                        </div>
                        <div className={css.row}>
                            <span>Поздравление:</span>
                            <span>
                                <b>
                                    Михаил, с днём рождения! <br /> Устрой себе праздник.
                                </b>
                            </span>
                        </div>
                        <div className={css.row}>
                            <span>Действителен до::</span>
                            <span>
                                <b>10.11.2025</b>
                            </span>
                        </div>
                    </div>
                    <div>
                        <AccordionComponent title={'Условия'} style={{ marginTop: '24px' }}>
                            <div className={css.conditions}>
                                <p>Подарочный сертификат действует во всех ...</p>
                                <b>Подробнее об условиях</b>
                                <div className={css.conditionsList}>
                                    <span>Как воспользоваться сертификатом</span>
                                    <ul>
                                        <li>
                                            Забронируйте стол через приложение и укажите сертификат на экране
                                            бронирования — мы всё учтём заранее.
                                        </li>
                                        <li>
                                            Если бронировали по телефону или пришли без брони — просто покажите
                                            сертификат официанту.
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </AccordionComponent>
                    </div>
                    <div className={css.button}>
                        <UniversalButton width={'full'} title={'Выбрать ресторан'} />
                    </div>
                </div>
            </section>
        </Page>
    );
};

export default CertificateLandingPage;
