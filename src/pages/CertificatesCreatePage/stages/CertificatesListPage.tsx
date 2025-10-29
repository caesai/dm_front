import React from 'react';
// import { useNavigate } from 'react-router-dom';
import { UniversalButton } from '@/components/Buttons/UniversalButton/UniversalButton.tsx';
import css from '@/pages/CertificatesCreatePage/CertificatesCreatePage.module.css';
import certificate_example from '/img/certificate_example.png';

export const CertificatesListPage: React.FC = () => {
    // const navigate = useNavigate();
    const selectOption = () => {
        // navigate('/certificates/online', { state: { title: 'Онлайн сертификат' }});
    }
    return (
        <div className={css.content}>
            <div className={css.certificateOption}>
                {/*<span>Получить онлайн</span>*/}
                <img src={certificate_example} alt={''} />
                <UniversalButton width={'full'} title={'Поделиться'} action={selectOption}/>
            </div>
        </div>
    )
}
