import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UniversalButton } from '@/components/Buttons/UniversalButton/UniversalButton.tsx';
import certificate from '/img/certificate.png';
import certificate1 from '/img/certificate_1.png';
import css from '@/pages/CertificatesCreatePage/CertificatesCreatePage.module.css';

export const CertificatesCreateOnePage: React.FC = () => {
    const navigate = useNavigate();
    const next = () => {
        navigate('/certificates/2', { state: { title: 'Выберите способ получения'}});
    }
    return (
        <div className={css.content}>
            <div>
                <span className={css.page_title}>Подарите сертификат <br />на приятный вечер в одном <br />из ресторнов DreamTeam</span>
            </div>
            <div className={css.animationContainer}>
                <img src={certificate} alt={'certificate'} className={css.animatedImageOne} />
                <img src={certificate1} alt={'certificate'} className={css.animatedImageTwo} />
            </div>
            <div className={css.absoluteBottom}>
                <div className={css.bottomWrapper}>
                    <UniversalButton
                        width={'full'}
                        title={'Оформить'}
                        theme={'red'}
                        action={next}
                    />
                </div>
            </div>
        </div>
    );
}
