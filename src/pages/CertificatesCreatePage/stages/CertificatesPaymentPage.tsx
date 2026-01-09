import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAtom, useSetAtom, WritableAtom } from 'jotai/index';
import moment from 'moment/moment';
import classnames from 'classnames';
// APIs
import { APIGetCertificateById, APIGetCertificates, APIPostCertificateCheckPayment } from '@/api/certificates.api.ts';
// Types
import { ICertificate } from '@/types/certificates.types.ts';
// Atoms
import { certificatesListAtom } from '@/atoms/certificatesListAtom.ts';
import { authAtom, userAtom } from '@/atoms/userAtom.ts';
// Components
import { Certificate } from '@/components/Certificate/Certificate.tsx';
import { UniversalButton } from '@/components/Buttons/UniversalButton/UniversalButton.tsx';
import { Loader } from '@/components/AppLoadingScreen/AppLoadingScreen.tsx';
// Styles
import css from '@/pages/CertificatesCreatePage/CertificatesCreatePage.module.css';
// Utils
import { shareCertificate } from '@/pages/CertificatesCreatePage/stages/CertificatesListPage.tsx';

export const CertificatesPaymentPage: React.FC = () => {
    const navigate = useNavigate();
    const [params] = useSearchParams();
    const [auth] = useAtom(authAtom);
    const [user] = useAtom(userAtom);
    const setCertificates = useSetAtom(certificatesListAtom as WritableAtom<ICertificate[], [ICertificate[]], void>);
    const paramsObject = Object.fromEntries(params.entries());
    // State
    const [certificate, setCertificate] = useState<ICertificate | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [isPaid, setIsPaid] = useState<boolean>(false);
    // Refs
    const certificateRef = useRef(null);

    const backToHome = () => {
        navigate('/');
    };

    // Получение данных сертификата при монтировании компонента
    useEffect(() => {
        if (auth?.access_token) {
            if (paramsObject.certificate_id) {
                // Получение данных сертификата
                APIGetCertificateById(auth.access_token, paramsObject.certificate_id)
                    .then((response) => setCertificate(response.data))
                    .catch((error) => {
                        console.error('Error getting certificate:', error);
                        setLoading(false);
                    });
            }
        }
    }, [auth, user, paramsObject.certificate_id]);

    /**
     * Проверяет статус оплаты сертификата.
     *
     * Если в параметрах URL передан `order_number`, отправляет запрос на проверку статуса оплаты.
     * При успешной оплате (`is_paid: true`) обновляет состояние `isPaid` и перезагружает список сертификатов.
     */
    const checkPayment = useCallback(() => {
        if (auth?.access_token && certificate && user?.id) {
            if (paramsObject.order_number) {
                // Проверка статуса оплаты сертификата
                APIPostCertificateCheckPayment(auth?.access_token, user?.id, paramsObject.order_number, certificate.id)
                    .then((response) => {
                        setIsPaid(response.data.is_paid);
                        // Обновление списка сертификатов в приложении
                        APIGetCertificates(auth?.access_token, Number(user?.id))
                            .then((response) => setCertificates(response.data))
                            .catch((error) => {
                                console.error('Error getting certificates list:', error);
                                setLoading(false);
                            });
                    })
                    .catch((error) => {
                        // Обработка ошибки, например, логирование или отображение уведомления
                        console.error('Error checking payment status:', error);
                    })
                    .finally(() => {
                        setLoading(false);
                    });
            }
        }
    }, [auth, certificate, user, paramsObject.order_number]);

    // Проверяем статус оплаты сертификата при монтировании компонента
    useEffect(() => {
        checkPayment();
    }, [certificate, checkPayment]);

    if (loading) {
        return (
            <div className={css.loader}>
                <Loader />
            </div>
        );
    }

    return (
        <div className={css.paymentContent}>
            {certificate ? (
                <>
                    <h3 className={css.page_title}>
                        {isPaid ? 'Ваш сертификат оплачен!' : 'Ваш платёж обрабатывается'}
                    </h3>
                    <Certificate
                        placeholder={certificate.message}
                        date={moment(certificate.created_at).add(1, 'year').format('DD.MM.YYYY')}
                        rating={Number(certificate.value).toFixed().toString()}
                        cardholder={certificate.recipient_name}
                        dreamteam_id={certificate.dreamteam_id}
                        forwardRef={certificateRef}
                    />
                    {!isPaid && (
                        <h3 className={css.success_payment}>
                            Сертификат появится в личном кабинете после подтверждения оплаты
                        </h3>
                    )}
                    <div data-testid="button-container" className={classnames(css.absoluteBottom)}>
                        {isPaid && (
                            <div className={css.bottomWrapper}>
                                <UniversalButton
                                    width={'full'}
                                    title={'Поделиться'}
                                    theme={'red'}
                                    action={() => shareCertificate(certificate, certificateRef.current)}
                                />
                                <UniversalButton width={'full'} title={'Позже'} action={backToHome} />
                            </div>
                        )}
                    </div>
                </>
            ) : (
                <>
                    <h3 className={css.page_title}>
                        Сертификат не найден
                    </h3>
                    <UniversalButton width={'full'} title={'Назад'} action={backToHome} />
                    <UniversalButton width={'full'} title={'Попробовать ещё раз'} theme={'red'} action={checkPayment} />
                </>
            )}
        </div>
    );
};
