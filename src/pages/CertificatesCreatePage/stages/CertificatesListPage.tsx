import React, { useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
import { useAtom } from 'jotai/index';
import { Certificate } from '@/components/Certificate/Certificate.tsx';
import { UniversalButton } from '@/components/Buttons/UniversalButton/UniversalButton.tsx';
import css from '@/pages/CertificatesCreatePage/CertificatesCreatePage.module.css';
import { certificatesListAtom } from '@/atoms/certificatesListAtom.ts';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';

export const CertificatesListPage: React.FC = () => {
    const [certificates] = useAtom(certificatesListAtom);

    const navigate = useNavigate();
    const selectOption = () => {
        // navigate('/certificates/online', { state: { title: 'Онлайн сертификат' }});
    };

    const openCertificate = () => {
        navigate('/certificates/landing');
    };

    useEffect(() => {}, []);
    return (
        <div className={css.content}>
            {certificates.map((certificate) => (
                <div key={certificate.id} className={css.certificateOption}>
                    <Certificate
                        placeholder={certificate.message}
                        date={moment(certificate.created_at).add(1, 'year').format('DD.MM.YYYY')}
                        rating={Number(certificate.value).toFixed().toString()}
                        cardholder={certificate.recipient_name}
                    />
                    <UniversalButton width={'full'} title={'Поделиться'} action={selectOption} />
                    <UniversalButton width={'full'} title={'Открыть'} theme={'red'} action={openCertificate} />
                </div>
            ))}
        </div>
    );
};
