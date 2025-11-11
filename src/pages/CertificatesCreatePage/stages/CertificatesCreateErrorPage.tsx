import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAtom } from 'jotai/index';
import { authAtom, userAtom } from '@/atoms/userAtom.ts';
import { CERTIFICATION_TYPES, ICertificate } from '@/types/certificates.types.ts';
import { APIGetCertificateById, APIPostCreateWithPayment } from '@/api/certificates.api.ts';
import css from '@/pages/CertificatesCreatePage/CertificatesCreatePage.module.css';
import { Certificate } from '@/components/Certificate/Certificate.tsx';
import moment from 'moment';
import classnames from 'classnames';
import { UniversalButton } from '@/components/Buttons/UniversalButton/UniversalButton.tsx';
import { Loader } from '@/components/AppLoadingScreen/AppLoadingScreen.tsx';

export const CertificatesCreateErrorPage: React.FC = () => {
    const navigate = useNavigate();
    const [params] = useSearchParams();
    const [auth] = useAtom(authAtom);
    const [user] = useAtom(userAtom);
    const paramsObject = Object.fromEntries(params.entries());
    const [certificate, setCertificate] = useState<ICertificate | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (auth?.access_token && user?.id) {
            if (paramsObject.certificate_id) {
                console.log(paramsObject)
                APIGetCertificateById(auth.access_token, user?.id, paramsObject.certificate_id)
                    .then(response => setCertificate(response.data));
            }
        }
    }, []);

    const repeatPayment = () => {
        if (certificate) {
            setLoading(true);
            APIPostCreateWithPayment(
                String(auth?.access_token),
                Number(user?.id),
                CERTIFICATION_TYPES.ONLINE,
                Number(certificate?.value.replace(/\s/g, '')),
                certificate.recipient_name,
                certificate.message,
            )
                .then(response => {
                    window.location.href = response.data.form_url;
                })
                .catch(error => {
                    console.log(error);
                    setLoading(false);
                });
        }
    }

    if (loading) {
        return <div className={css.loader}><Loader /></div>;
    }

    return (
        <div className={css.paymentContent}>
            {certificate && (
                <>
                    <h3 className={css.page_title}>Оплата не прошла.</h3>
                    <Certificate
                        placeholder={certificate.message}
                        date={moment(certificate.created_at).add(1, 'year').format('DD.MM.YYYY')}
                        rating={Number(certificate.value).toFixed().toString()}
                        cardholder={certificate.recipient_name}
                    />
                    <h3 className={css.page_title}>Попробуйте ещё раз или выберите другой способ оплаты.</h3>
                    <div
                        data-testid="button-container"
                        className={classnames(
                            css.absoluteBottom,
                        )}
                    >
                        <div className={css.bottomWrapper}>
                            <UniversalButton width={'full'} title={'Оплатить'} theme={'red'} action={repeatPayment}/>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
