import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UniversalButton } from '@/components/Buttons/UniversalButton/UniversalButton.tsx';
import css from '@/pages/CertificatesCreatePage/CertificatesCreatePage.module.css';
import logo from '/img/DT_hospitality_logo_eng_black 1.png';
import classnames from 'classnames';

export const CertificatesCreateTwoPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className={css.content}>
            <div className={css.certificateOption}>
                <span>Получить онлайн</span>
                <div className={css.certificateExample}>
                    <div className={css.certificateLogo}>
                        <img src={logo} alt={'DreamTeam'} />
                    </div>
                    <div>
                    <span className={css.compliment}>
                        {'Добавьте приятных слов к подарку'}
                    </span>
                    </div>
                    <div className={css.certificateBottom}>
                        <div>
                            <span>{'Имя'}</span>
                            <span>*********</span>
                        </div>
                        <div>
                            <span>Действителен:</span>
                            <span>до 20.11.2025</span>
                        </div>
                        <div>
                            <span>Номинал</span>
                            <span>*****</span>
                        </div>
                    </div>
                </div>
                <UniversalButton
                    width={'full'}
                    title={'Выбрать'}
                    theme={'red'}
                    action={() => navigate('/certificates/online', { state: { title: 'Онлайн сертификат' }})}
                />
            </div>
            <div className={css.certificateOption}>
                <span>Забрать в ресторане</span>
                <div className={css.certificateExample}>
                    <div className={css.certificateLogo}>
                        <img src={logo} alt={'DreamTeam'} />
                    </div>
                    <div>
                    <span className={classnames(css.compliment, css.complimentOffline)}>
                        {'10 000 ₽'}
                    </span>
                    </div>
                    <div className={css.certificateBottom}>
                        <div>
                            <span></span>
                            <span>*********</span>
                        </div>
                        <div>
                            <span>Действителен:</span>
                            <span>до 20.11.2025</span>
                        </div>
                        <div>
                            <span>Номинал</span>
                            <span>*****</span>
                        </div>
                    </div>
                </div>
                <UniversalButton
                    width={'full'}
                    title={'Выбрать'}
                    theme={'red'}
                    action={() => navigate('/certificates/offline', { state: { title: 'Офлайн сертификат' }})}
                />
            </div>
        </div>
    )
}
