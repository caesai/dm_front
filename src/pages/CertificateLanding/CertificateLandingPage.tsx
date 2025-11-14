import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAtom } from 'jotai/index';
import moment from 'moment';
import { useModal } from '@/components/ModalPopup/useModal.ts';
import { authAtom, userAtom } from '@/atoms/userAtom.ts';
import { ICertificate } from '@/types/certificates.types.ts';
import { APIGetCertificateById, APIGetCertificates, APIPostCertificateClaim } from '@/api/certificates.api.ts';
import { Page } from '@/components/Page.tsx';
import { DTHospitalityIcon } from '@/components/Icons/DTHospitalityIcon.tsx';
import AccordionComponent from '@/components/Accordion/AccordionComponent.tsx';
import { UniversalButton } from '@/components/Buttons/UniversalButton/UniversalButton.tsx';
import { RoundedButton } from '@/components/RoundedButton/RoundedButton.tsx';
import { CrossIcon } from '@/components/Icons/CrossIcon.tsx';
import { Toast } from '@/components/Toast/Toast.tsx';
import { ModalPopup } from '@/components/ModalPopup/ModalPopup.tsx';
import { Loader } from '@/components/AppLoadingScreen/AppLoadingScreen.tsx';
import { certificatesListAtom } from '@/atoms/certificatesListAtom.ts';
import css from '@/pages/CertificateLanding/CertificateLandingPage.module.css';

const CertificateLandingPage: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [auth] = useAtom(authAtom);
    const [user] = useAtom(userAtom);
    const [, setCertificates] = useAtom(certificatesListAtom);
    const [certificate, setCertificate] = useState<ICertificate | null>(null);
    const [toastShow, setToastShow] = useState<boolean>(false);
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const { isShowing, toggle } = useModal();

    useEffect(() => {
        if (auth?.access_token) {
            if (id) {
                APIGetCertificateById(auth.access_token,  id)
                    .then(response => setCertificate(response.data));
            }
        }
    }, []);

    useEffect(() => {
        if (!user || !certificate) return;
        if (user?.complete_onboarding) {
            if (!certificate?.shared_at) {
                if (certificate?.customer_id === user.id) {
                    // Nothing to do
                    setLoading(false);
                    return;
                } else {
                    acceptCertificate();
                    setLoading(false);
                    return;
                }
            } else {
                if (certificate.recipient_id === user.id) {
                    setLoading(false);
                    return;
                } else {
                    navigate('/certificates/1');
                }
            }
        } else {
            if (!certificate?.shared_at) {
                // Toggle Modal Popup With Need to Register Info
                setLoading(false);
                toggle();
                return;
            } else {
                navigate('/onboarding/1');
            }
        }
    }, [certificate, user, navigate, toggle]);

    const acceptCertificate = () => {
        if (auth?.access_token && certificate && id) {
            APIPostCertificateClaim(
                String(auth?.access_token),
                Number(user?.id),
                id,
                certificate.recipient_name,
            )
                .then(() => {
                    // Updating Certificates List After Accepting New Certificate
                    APIGetCertificates(auth?.access_token, Number(user?.id))
                        .then(response => setCertificates(response.data));
                })
                .catch(err => {
                    console.log(err);
                    setToastShow(true);
                    setToastMessage('Произошла ошибка. Попробуйте перезагрузить страницу');
                })
                .finally(() => {
                    setTimeout(() => {
                        setToastShow(false);
                        setToastMessage(null);
                    }, 3000);
                });
        }
    };

    const goHome = () => {
        navigate('/');
    };

    const goToOnboarding = () => {
        navigate('/onboarding/3', { state: { id } });
    };

    const goToBooking = () => {
        navigate('/booking', { state: { certificate: true, certificateId: certificate?.id } });
    };

    if (loading) {
        return (
                <div className={css.loader}><Loader /></div>
        );
    }

    return (
        <Page back={true}>
            <ModalPopup
                isOpen={isShowing}
                setOpen={toggle}
                button
                title={'Вы не зарегистрированы'}
                text={'Необходимо зарегистрироваться для того, чтобы воспользоваться сертификатом'}
                btnText={'Зарегистрироваться'}
                btnAction={goToOnboarding}
            />
            <section className={css.container}>
                <div className={css.content}>
                    <div className={css.header}>
                        <DTHospitalityIcon />
                        <h1>
                            Подарочный сертификат <br /> в любой ресторан Dreamteam
                        </h1>
                        <div onClick={goHome} className={css.close}>
                            <RoundedButton
                                icon={<CrossIcon size={44} />}
                                action={() => navigate(-1)}
                            />
                        </div>
                    </div>
                    <div className={css.certificateFields}>
                        <div className={css.row}>
                            <span>Номинал:</span>
                            <span>
                                <b>{certificate?.value}</b>
                            </span>
                        </div>
                        <div className={css.row}>
                            <span>Для кого:</span>
                            <span>
                                <b>{certificate?.recipient_name}</b>
                            </span>
                        </div>
                        <div className={css.row}>
                            <span>Поздравление:</span>
                            <span>
                                <b>{certificate?.message}</b>
                            </span>
                        </div>
                        <div className={css.row}>
                            {certificate?.status === 'used' ? (
                                <span>
                                    Сертификат использован
                                </span>
                            ) : (
                                <>
                                    <span>Действителен до:</span>
                                    <span>
                                        <b>{moment(certificate?.created_at).add(1, 'year').format('DD.MM.YYYY')}</b>
                                    </span>
                                </>
                            )}

                        </div>
                    </div>
                    <div>
                        <AccordionComponent title={'Условия'} style={{ marginTop: '24px' }}>
                            <div className={css.conditions}>
                                <p>Подарочный сертификат действует во всех ...</p>
                                <b>Подробнее об условиях</b>
                                <div className={css.conditionsList}>
                                    <span>Как воспользоваться сертификатом</span>
                                    <ul>
                                        <li>
                                            Забронируйте стол через приложение и укажите сертификат на экране
                                            бронирования — мы всё учтём заранее.
                                        </li>
                                        <li>
                                            Если бронировали по телефону или пришли без брони — просто покажите
                                            сертификат официанту.
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </AccordionComponent>
                    </div>
                    {certificate?.status !== 'used' && user?.complete_onboarding && (
                        <div className={css.button}>
                            <UniversalButton width={'full'} title={'Выбрать ресторан'} action={goToBooking} />
                        </div>
                    )}
                </div>
            </section>
            <Toast message={toastMessage} showClose={toastShow} />
        </Page>
    );
};

export default CertificateLandingPage;
