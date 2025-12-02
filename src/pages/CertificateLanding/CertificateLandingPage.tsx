import React, { useCallback, useEffect, useState } from 'react';
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
import { RoundedButton } from '@/components/RoundedButton/RoundedButton.tsx';
import { CrossIcon } from '@/components/Icons/CrossIcon.tsx';
import { ModalPopup } from '@/components/ModalPopup/ModalPopup.tsx';
import { Loader } from '@/components/AppLoadingScreen/AppLoadingScreen.tsx';
import { certificatesListAtom } from '@/atoms/certificatesListAtom.ts';
import css from '@/pages/CertificateLanding/CertificateLandingPage.module.css';
import { BottomButtonWrapper } from '@/components/BottomButtonWrapper/BottomButtonWrapper.tsx';
import { RestaurantsList } from '@/components/RestaurantsList/RestaurantsList.tsx';
import useToastState from '@/hooks/useToastState.ts';

const CertificateLandingPage: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [auth] = useAtom(authAtom);
    const [user] = useAtom(userAtom);
    const [, setCertificates] = useAtom(certificatesListAtom);
    const [certificate, setCertificate] = useState<ICertificate | null>(null);
    const { showToast } = useToastState();
    const [loading, setLoading] = useState<boolean>(true);
    const { isShowing, toggle, setIsShowing } = useModal();

    /**
     * Хук эффекта React для загрузки данных сертификата при монтировании компонента.
     *
     * Отправляет запрос на получение данных сертификата по его ID при наличии токена доступа.
     * В случае успеха обновляет состояние `certificate`.
     * В случае ошибки показывает тост-уведомление и через 6 секунд перенаправляет пользователя на страницу списка сертификатов.
     *
     * @fires APIGetCertificateById - Выполняет асинхронный запрос к API.
     * @modifies setCertificate - Обновляет локальное состояние сертификата.
     * @modifies setToastShow - Управляет видимостью уведомления (тоста).
     * @modifies setToastMessage - Устанавливает текст уведомления.
     * @fires navigate - Перенаправляет пользователя при ошибке загрузки.
     *
     * @param {object} auth Объект аутентификации, содержащий access_token.
     * @param {string|number} id Идентификатор (ID) запрашиваемого сертификата.
     * @param {function} APIGetCertificateById Функция API для получения данных сертификата.
     * @param {function} setCertificate Функция обновления состояния React для данных сертификата.
     * @param {function} setToastShow Функция обновления состояния React для показа тоста.
     * @param {function} setToastMessage Функция обновления состояния React для сообщения тоста.
     * @param {function} navigate Функция перенаправления из роутера (например, react-router-dom).
     */
    useEffect(() => {
        if (auth?.access_token) {
            if (id) {
                APIGetCertificateById(auth.access_token, id)
                    .then(response => setCertificate(response.data))
                    .catch(() => {
                        showToast('Не удалось загрузить сертификат. Попробуйте еще раз.');
                        setTimeout(() => {
                            navigate('/certificates/1');
                        }, 7000);
                    });
            }
        }
    }, []);
    /**
     * Функция для подтверждения (клейма) владения сертификатом через API.
     * Отправляет запрос на сервер для регистрации текущего пользователя как получателя сертификата.
     * После успешного выполнения обновляет локальный список сертификатов и управляет уведомлениями об ошибках.
     *
     * @function
     * @param {object} auth - Объект аутентификации, содержащий access_token.
     * @param {object} certificate - Текущий объект сертификата, содержащий recipient_name.
     * @param {string|number} id - ID сертификата.
     * @param {object} user - Объект пользователя, содержащий user.id.
     * @param {function} APIPostCertificateClaim - Функция API для клейма сертификата.
     * @param {function} APIGetCertificates - Функция API для получения списка сертификатов.
     * @param {function} setCertificates - Функция React state для обновления списка сертификатов.
     * @param {function} showToast - Функция для отображения уведомлений (заменил оригинальные setToastShow/Message на единую showToast для чистоты примера).
     *
     * @returns {Promise<void>}
     */
    const acceptCertificate = useCallback(async () => {
        // Явное приведение типов в параметрах вызова API
        const accessToken = auth?.access_token;
        const userId = Number(user?.id);
        const certId = id;

        if (!accessToken || !certificate || !certId || !userId) {
            // Ранний выход, если данные неполны
            console.warn('Недостаточно данных для клейма сертификата.');
            return;
        }

        try {
            // 1. Клейм сертификата (основное действие)
            await APIPostCertificateClaim(
                String(accessToken),
                userId,
                certId,
                certificate?.recipient_name,
            );

            // 2. Если клейм успешен, получаем обновленный список сертификатов
            const response = await APIGetCertificates(accessToken, userId);
            setCertificates(response.data);
            showToast('Сертификат успешно активирован!'); // Можно добавить тост успеха

        } catch (err) {
            // Обработка ошибок как первого, так и второго запроса
            console.error('Ошибка при работе с сертификатом:', err);
            showToast('Произошла ошибка. Попробуйте перезагрузить страницу');
        }
    }, [
        auth,
        certificate,
        id,
        user,
        APIPostCertificateClaim,
        APIGetCertificates,
        setCertificates,
        showToast,
    ]);


    const isCertificateUsed = useCallback(() => {
        if (!certificate) return true;
        return certificate.status === 'used';
    }, [certificate]);

    const isCertificateExpired = useCallback(() => {
        if (!certificate) return true;
        return moment().isAfter(moment(certificate.expired_at));
    }, [certificate]);
    /**
     * Проверяет, отключен ли (неактивен) сертификат.
     * Сертификат считается активным, если его статус — 'paid' (оплачен) или 'shared' (подарен), И текущая дата раньше даты его истечения.
     *
     * @returns {boolean} True, если сертификат неактивен/отключен, false в противном случае (если активен).
     */
    const isCertificateDisabled = useCallback(() => {
        if (!certificate) return true;
        return !((certificate.status === 'paid' || certificate.status === 'shared') && !isCertificateExpired());
    }, [certificate, isCertificateExpired]);
    /**
     * Хук эффекта, который управляет различной логикой, связанной с сертификатом,
     * в зависимости от статуса пользователя и состояния сертификата.
     * Управляет состоянием загрузки, навигацией и автоматическим принятием сертификата.
     *
     * @fires acceptCertificate - Вызывается, если соблюдены условия для автоматического принятия сертификата.
     * @fires navigate - Используется для перенаправления пользователя на другие страницы.
     * @modifies setLoading - Устанавливает состояние загрузки в false при различных условиях.
     * @modifies setIsShowing - (Закомментировано) Предназначалось для отображения модального окна с информацией о необходимости регистрации.
     */
    useEffect(() => {
        // 1. Предварительные проверки и выход
        if (!user || !certificate) return;

        if (isCertificateDisabled()) {
            setLoading(false);
            return;
        }

        // 2. Логика для зарегистрированного и прошедшего онбординг пользователя (user.complete_onboarding === true)
        if (user?.complete_onboarding) {
            if (!certificate?.shared_at) {
                // Сертификат куплен пользователем (не подарен/не принят ранее)
                if (certificate?.customer_id === user.id) {
                    // Пользователь — владелец. Ничего не делаем.
                    setLoading(false);
                    return;
                } else {
                    // Сертификат куплен другим пользователем, но еще не принят этим
                    acceptCertificate();
                    setLoading(false);
                    return;
                }
            } else {
                // Сертификат уже был передан (shared_at существует)
                if (certificate.recipient_id === user.id) {
                    // Пользователь — получатель. Ничего не делаем.
                    setLoading(false);
                    return;
                } else {
                    // Пользователь не имеет отношения к этому сертификату после передачи. Перенаправляем.
                    navigate('/certificates/1');
                }
            }
        } else {
            // 3. Логика для пользователя, НЕ прошедшего онбординг (user.complete_onboarding === false)
            if (!certificate?.shared_at) {
                // Сертификат не подарен. Нужна регистрация (онбординг).
                setLoading(false);
                return;
            } else {
                // Сертификат подарен. Нужно пройти онбординг.
                navigate('/onboarding/1');
            }
        }
    }, [certificate, user, isCertificateDisabled, acceptCertificate, navigate, setLoading]);

    const goHome = () => {
        navigate('/');
    };

    const goToOnboarding = () => {
        navigate('/onboarding/3', { state: { certificateId: id, sharedCertificate: true, certificate: true } });
    };

    const goToBooking = () => {
        if (!user?.complete_onboarding) {
            setIsShowing(true);
            return;
        }
        navigate('/booking', { state: { certificate: true, certificateId: id } });
    };

    if (loading) {
        return (
            <div className={css.loader}>
                <Loader />
            </div>
        );
    }

    return (
        <Page back={true}>
            <ModalPopup
                isOpen={isShowing}
                setOpen={toggle}
                button
                title={''}
                text={'Чтобы воспользоваться сертификатом и забронировать стол онлайн, необходимо зарегистрироваться в приложении Dreamteam Concierge. Или просто покажите код сертификата официанту'}
                btnText={'Зарегистрироваться'}
                btnAction={goToOnboarding}
                btnScndrText={'Покажу официанту'}
                // btnScndrAction={toggle}
                btnsColumn={true}
            />
            <section className={css.container}>
                <div className={css.content}>
                    <div className={css.header}>
                        <DTHospitalityIcon />
                        {isCertificateDisabled() ? (
                            isCertificateExpired() ? (
                                <h1>У данного сертификата истек срок действия</h1>
                                ) : (
                                    <h1>Данный подарочный сертификат {isCertificateUsed() ? 'использован' : 'используется'}</h1>
                                )
                        ) : (
                            <h1>
                                Подарочный сертификат <br /> в любой ресторан Dreamteam
                            </h1>
                        )}
                        <div onClick={goHome} className={css.close}>
                            <RoundedButton
                                icon={<CrossIcon size={44} />}
                            />
                        </div>
                    </div>
                    <div className={css.certificateFields}>
                        <div className={css.row}>
                            <span>Номинал:</span>
                            <span>
                                <b>{Number(certificate?.value).toFixed()}</b>
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
                        <div className={css.row}>
                            <span>Код:</span>
                            <span>
                                <b>{certificate?.dreamteam_id}</b>
                            </span>
                        </div>
                    </div>
                    <AccordionComponent title={'Условия'} style={{ marginTop: '24px' }}>
                        <div className={css.conditions}>
                            <ul>
                                <li>
                                    Сертификат действует во всех ресторанах
                                    Dreamteam.
                                </li>
                                <li>
                                    Срок действия - один год с момента покупки.
                                </li>
                                <li>
                                    Сертификатом можно оплатить любые блюда
                                    и напитки из меню.
                                </li>
                                <li>
                                    Сумму сертификата можно потратить за один визит в ресторан, оставшиеся средства
                                    сгорают.
                                </li>
                                <li>
                                    Если чек в ресторане больше, чем номинал сертификата, то необходимую сумму можно
                                    доплатить любым удобным способом.
                                </li>
                                <li>
                                    В рамках одного визита в ресторан можно использовать не более одного подарочного
                                    сертификата.
                                </li>
                            </ul>
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
                    </AccordionComponent>
                    <div className={css.restaurantsList}>
                        <span className={css.pageTitle}>Доступно в ресторанах</span>
                        <RestaurantsList titleStyle={{ fontSize: '14px', fontWeight: '600' }} />
                    </div>
                    {!isCertificateDisabled() && (
                        <BottomButtonWrapper onClick={goToBooking} content={'Воспользоваться'} />
                    )}
                </div>
            </section>
        </Page>
    );
};

export default CertificateLandingPage;
