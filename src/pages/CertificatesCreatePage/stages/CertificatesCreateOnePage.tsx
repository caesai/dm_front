import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAtom } from 'jotai';
// Atoms
import { userAtom } from '@/atoms/userAtom';
// Components
import { BottomButtonWrapper } from '@/components/BottomButtonWrapper/BottomButtonWrapper.tsx';
import { RestaurantsList } from '@/components/RestaurantsList/RestaurantsList.tsx';
// Styles
import css from '@/pages/CertificatesCreatePage/CertificatesCreatePage.module.css';
// Mocks
import CertificateImage from '/img/certificate_new.png';

export const CertificatesCreateOnePage: React.FC = () => {
    const navigate = useNavigate();
    const [user] = useAtom(userAtom);

    const next = () => {
        if (!user?.complete_onboarding) {
            navigate('/onboarding/3', {
                state: { sharedCertificateCreate: true },
            });
            return;
        }
        navigate('/certificates/online', { state: { title: 'Электронный подарочный сертификат' } });
    }

    return (
        <div className={css.content} style={{ paddingBottom: '90px' }}>
            <div className={css.certificateOption}>
                <span className={css.page_title}>Подарите приятный вечер <br /> в ресторанах Dreamteam</span>
                <div className={css.certificateImage}>
                    <img src={CertificateImage} alt="Dreamteam gift certificate" />
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
            <div className={css.restaurantList}>
                <RestaurantsList titleStyle={{ fontSize: '1rem', fontWeight: '600' }} />
            </div>
            <BottomButtonWrapper
                isFixed={true}
                content={'Оформить'}
                onClick={next}
            />
        </div>
    );
}
