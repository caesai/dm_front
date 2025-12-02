import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAtom } from 'jotai/index';
import moment from 'moment/moment';
import classnames from 'classnames';
import { ICertificate } from '@/types/certificates.types.ts';
import { certificatesListAtom } from '@/atoms/certificatesListAtom.ts';
import { authAtom, userAtom } from '@/atoms/userAtom.ts';
import {
    APIGetCertificateById,
    APIGetCertificates,
    APIPostCertificateCheckPayment,
} from '@/api/certificates.api.ts';
import { Certificate } from '@/components/Certificate/Certificate.tsx';
import { UniversalButton } from '@/components/Buttons/UniversalButton/UniversalButton.tsx';
import { shareCertificate } from '@/pages/CertificatesCreatePage/stages/CertificatesListPage.tsx';
import { Loader } from '@/components/AppLoadingScreen/AppLoadingScreen.tsx';
import css from '@/pages/CertificatesCreatePage/CertificatesCreatePage.module.css';

export const CertificatesPaymentPage: React.FC = () => {
    const navigate = useNavigate();
    const [params] = useSearchParams();
    const [auth] = useAtom(authAtom);
    const [user] = useAtom(userAtom);
    const [, setCertificates] = useAtom(certificatesListAtom);
    const paramsObject = Object.fromEntries(params.entries());
    const [certificate, setCertificate] = useState<ICertificate | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [isPaid, setIsPaid] = useState<boolean>(false);
    const certificateRef = useRef(null);

    const backToHome = () => {
        navigate('/');
    };

    useEffect(() => {
        if (auth?.access_token) {
            if (paramsObject.certificate_id) {
                APIGetCertificateById(auth.access_token, paramsObject.certificate_id)
                    .then(response => setCertificate(response.data));
            }
        }
    }, [auth, user, paramsObject.certificate_id]);

    useEffect(() => {
        if (auth?.access_token && certificate && user?.id) {
            if (paramsObject.order_number) {
                APIPostCertificateCheckPayment(auth?.access_token, user?.id, paramsObject.order_number, certificate.id)
                    .then((response) => {
                        setIsPaid(response.data.is_paid);
                        // Updating Certificates List In App
                        APIGetCertificates(auth?.access_token, Number(user?.id))
                            .then(response => setCertificates(response.data));
                    })
                    .catch(error => {
                        // Handle error, e.g., log or show notification
                        console.error('Error checking payment status:', error);
                    })
                    .finally(() => {
                        setLoading(false);
                    });
            }
        }
    }, [certificate]);

    if (loading) {
        return <div className={css.loader}><Loader /></div>;
    }

    return (
        <div className={css.paymentContent}>
            {certificate && (
                <>
                    <h3 className={css.page_title}>{isPaid ? 'Ваш сертификат оплачен!' : 'Ваш платёж обрабатывается'}</h3>
                    <Certificate
                        placeholder={certificate.message}
                        date={moment(certificate.created_at).add(1, 'year').format('DD.MM.YYYY')}
                        rating={Number(certificate.value).toFixed().toString()}
                        cardholder={certificate.recipient_name}
                        dreamteam_id={certificate.dreamteam_id}
                        forwardRef={certificateRef}
                    />
                    {!isPaid && (
                        <h3 className={css.success_payment}>Сертификат появится в личном кабинете после подтверждения
                            оплаты</h3>
                    )}
                    <div
                        data-testid="button-container"
                        className={classnames(
                            css.absoluteBottom,
                        )}
                    >
                        {isPaid && (
                            <div className={css.bottomWrapper}>
                                <UniversalButton width={'full'} title={'Поделиться'} theme={'red'}
                                                 action={() => shareCertificate(certificate, certificateRef.current)} />
                                <UniversalButton width={'full'} title={'Позже'} action={backToHome} />
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};
