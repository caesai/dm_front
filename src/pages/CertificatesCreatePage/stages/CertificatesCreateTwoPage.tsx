import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UniversalButton } from '@/components/Buttons/UniversalButton/UniversalButton.tsx';
import { Certificate } from '@/components/Certificate/Certificate.tsx';
import css from '@/pages/CertificatesCreatePage/CertificatesCreatePage.module.css';

export const CertificatesCreateTwoPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className={css.content}>
            <div className={css.certificateOption}>
                <span>Получить онлайн</span>

                <Certificate placeholder={'Добавьте приятных слов к подарку'} date={'****'} rating={'****'} cardholder={'Имя'} />
                <UniversalButton
                    width={'full'}
                    title={'Выбрать'}
                    theme={'red'}
                    action={() => navigate('/certificates/online', { state: { title: 'Онлайн сертификат' }})}
                />
            </div>
            <div className={css.certificateOption}>
                <span>Забрать в ресторане</span>
                <Certificate placeholder={'10 000'} date={'****'} rating={'10000'} cardholder={''} big={true} />
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
