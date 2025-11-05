import React, { useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
import { useAtom } from 'jotai/index';
import { authAtom } from '@/atoms/userAtom.ts';
import { APIGetCertificates } from '@/api/certificates.api.ts';
import { Certificate } from '@/components/Certificate/Certificate.tsx';
import { UniversalButton } from '@/components/Buttons/UniversalButton/UniversalButton.tsx';
import css from '@/pages/CertificatesCreatePage/CertificatesCreatePage.module.css';


export const CertificatesListPage: React.FC = () => {
    const [auth] = useAtom(authAtom);

    // const navigate = useNavigate();
    const selectOption = () => {
        // navigate('/certificates/online', { state: { title: 'Онлайн сертификат' }});
    }

    useEffect(() => {
        if (auth?.access_token) {
            APIGetCertificates(auth?.access_token).then();
        }
    }, []);
    return (
        <div className={css.content}>
            <div className={css.certificateOption}>
                <Certificate placeholder={''} date={''} rating={''} cardholder={''} />
                <UniversalButton width={'full'} title={'Поделиться'} action={selectOption}/>
            </div>
        </div>
    )
}
