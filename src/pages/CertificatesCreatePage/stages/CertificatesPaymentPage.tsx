import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAtom } from 'jotai/index';
import { authAtom, userAtom } from '@/atoms/userAtom.ts';
import { APIGetCertificateById } from '@/api/certificates.api.ts';
import { ICertificate } from '@/types/certificates.types.ts';
import { Certificate } from '@/components/Certificate/Certificate.tsx';
import moment from 'moment/moment';
import css from '@/pages/CertificatesCreatePage/CertificatesCreatePage.module.css';
import { UniversalButton } from '@/components/Buttons/UniversalButton/UniversalButton.tsx';
import classnames from 'classnames';

export const CertificatesPaymentPage: React.FC = () => {
    const [params] = useSearchParams();
    const navigate = useNavigate();
    const [auth] = useAtom(authAtom);
    const [user] = useAtom(userAtom);
    const paramsObject = Object.fromEntries(params.entries());
    const [certificate, setCertificate] = useState<ICertificate | null>(null);
    const share = () => {
        //
    }
    const backToHome = () => {
        navigate('/');
    }
    useEffect(() => {
        if (auth?.access_token && user?.id) {
            if (paramsObject.certificate_id) {
                APIGetCertificateById(auth.access_token, user?.id, paramsObject.certificate_id)
                    .then(response => setCertificate(response.data));
            }
        }
    }, [auth, params]);
    return (
        <div className={css.content}>
            {certificate && (
                <>
                    <Certificate
                        placeholder={certificate.message}
                        date={moment(certificate.created_at).add(1, 'year').format('DD.MM.YYYY')}
                        rating={Number(certificate.value).toFixed().toString()}
                        cardholder={certificate.recipient_name}
                    />
                    <div
                        data-testid="button-container"
                        className={classnames(
                            css.absoluteBottom,
                        )}
                    >
                        <div className={css.bottomWrapper}>
                            <UniversalButton width={'full'} title={'Поделиться'} theme={'red'} action={share}/>
                            <UniversalButton width={'full'} title={'Позже'} action={backToHome}/>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
