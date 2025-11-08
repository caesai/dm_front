import React from 'react';
import { useNavigate } from 'react-router-dom';
import css from '@/pages/CertificatesCreatePage/CertificatesCreatePage.module.css';
import CertificateImage from '../../../../public/img/certificate_1.png';
import { BottomButtonWrapper } from '@/components/BottomButtonWrapper/BottomButtonWrapper.tsx';

export const CertificatesCreateOnePage: React.FC = () => {
    const navigate = useNavigate();
    const next = () => {
        navigate('/certificates/2', { state: { title: 'Выберите способ получения'}});
    }
    return (
        <div className={css.content}>
            <div className={css.certificateOption}>
                <span className={css.page_title}>Подарите приятный вечер <br /> в ресторанах Dreamteam</span>
                <div className={css.certificateImage}>
                    <img src={CertificateImage} alt={''} />
                </div>
                <ul className={css.certificateList}>
                    <li>Сертификат действует во всех ресторанах Dreamteam.</li>
                    <li>Срок действия — один год с момента покупки.</li>
                    <li>Сертификатом можно оплатить любые блюда и напитки из меню.</li>
                    <li>Сумму сертификата можно потратить за один визит в ресторан, оставшиеся средства сгорают.</li>
                    <li>Если чек в ресторане больше, чем номинал сертификата, то необходимую сумму можно доплатить любым
                        удобным способом.
                    </li>
                    <li>В рамках одного визита в ресторан можно использовать не более одного подарочного сертификата.
                    </li>
                </ul>
            </div>
            <BottomButtonWrapper
                content={'Оформить'}
                onClick={next}
            />
        </div>
    );
}
