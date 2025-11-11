import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAtom } from 'jotai/index';
import { authAtom, userAtom } from '@/atoms/userAtom.ts';
import { APIGetCertificateById, APIPostCheckAlfaPayment } from '@/api/certificates.api.ts';
import { ICertificate } from '@/types/certificates.types.ts';
import { Certificate } from '@/components/Certificate/Certificate.tsx';
import moment from 'moment/moment';
import css from '@/pages/CertificatesCreatePage/CertificatesCreatePage.module.css';
import { UniversalButton } from '@/components/Buttons/UniversalButton/UniversalButton.tsx';
import classnames from 'classnames';
import { shareCertificate } from '@/pages/CertificatesCreatePage/stages/CertificatesListPage.tsx';

export const CertificatesPaymentPage: React.FC = () => {
    const navigate = useNavigate();
    const [params] = useSearchParams();
    const [auth] = useAtom(authAtom);
    const [user] = useAtom(userAtom);
    const paramsObject = Object.fromEntries(params.entries());
    const [certificate, setCertificate] = useState<ICertificate | null>(null);

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
    }, [auth, user, paramsObject.certificate_id]);

    useEffect(() => {
        if (auth?.access_token && certificate && user?.id) {
            if (paramsObject.order_number) {
                APIPostCheckAlfaPayment(auth?.access_token, user?.id, paramsObject.order_number, certificate.id)
                    .then();
            }
        }
    }, [certificate]);

    useEffect(() => {
        if (certificate) {
            navigate('.', {
                state: { title: 'Электронный сертификат' },
                replace: true
            });
        }
    }, [certificate, navigate]);

    return (
        <div className={css.paymentContent}>
            {certificate && (
                <>
                    <h3 className={css.page_title}>Ваш сертификат оплачен!</h3>
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
                            <UniversalButton width={'full'} title={'Поделиться'} theme={'red'} action={() => shareCertificate(certificate)}/>
                            <UniversalButton width={'full'} title={'Позже'} action={backToHome}/>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
