import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAtom } from 'jotai/index';
import { authAtom, userAtom } from '@/atoms/userAtom.ts';
import { ICertificate } from '@/types/certificates.types.ts';
import { APIGetCertificateById, APIPostCertificateShare } from '@/api/certificates.api.ts';
import css from '@/pages/CertificatesCreatePage/CertificatesCreatePage.module.css';
import { Certificate } from '@/components/Certificate/Certificate.tsx';
import moment from 'moment';
import classnames from 'classnames';
import { UniversalButton } from '@/components/Buttons/UniversalButton/UniversalButton.tsx';
import { Loader } from '@/components/AppLoadingScreen/AppLoadingScreen.tsx';

export const CertificatesSharedPage: React.FC = () => {
    const navigate = useNavigate();
    // const [params] = useSearchParams();
    const { id } = useParams();

    const [auth] = useAtom(authAtom);
    const [user] = useAtom(userAtom);
    // const paramsObject = Object.fromEntries(params.entries());
    const [certificate, setCertificate] = useState<ICertificate | null>(null);
    const [loading, setLoading] = useState(false);
    console.log(id);

    useEffect(() => {
        if (auth?.access_token && user?.id) {
            if (id) {
                APIGetCertificateById(auth.access_token, user?.id, id)
                    .then(response => setCertificate(response.data));
            }
        }
    }, []);

    const acceptCertificate = () => {
        if (certificate) {
            setLoading(true);
            APIPostCertificateShare(
                String(auth?.access_token),
                String(id),
                Number(user?.id),
                certificate.message,
            )
                .then(response => {
                    // window.location.href = response.data.form_url;
                    console.log(response);
                })
                .catch(error => {
                    console.log(error);
                    setLoading(false);
                })
                .finally(() => setLoading(false));
        }
    }

    const backToHome = () => navigate('/');

    if (loading) {
        return <div className={css.loader}><Loader /></div>;
    }

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
                            {!certificate.shared_at && <UniversalButton width={'full'} title={'Принять'} theme={'red'} action={acceptCertificate}/>}
                            <UniversalButton width={'full'} title={!certificate.shared_at ? 'Позже' : 'Закрыть'} action={backToHome}/>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
