/**
 * @fileoverview Страница оплаты подарочного сертификата
 *
 * Компонент отвечает за обработку результата оплаты сертификата и интеграцию с eGift.
 *
 * ## Основные функции:
 * - Загрузка данных сертификата по ID из URL параметра `certificate_id`
 * - Проверка статуса оплаты через Альфа-Банк API (параметр `order_number`)
 * - Создание сертификата в eGift после успешной оплаты
 * - Функция "Поделиться" сертификатом
 *
 * ## URL параметры:
 * - `certificate_id` - ID сертификата для загрузки
 * - `order_number` - Номер заказа для проверки статуса оплаты
 *
 * ## Состояния страницы:
 * - Загрузка (Loader)
 * - Платёж обрабатывается (isPaid: false)
 * - Сертификат оплачен (isPaid: true) - показывает кнопки "Поделиться" и "Позже"
 * - Сертификат не найден - при ошибке загрузки
 *
 * ## API интеграции:
 * - `APIGetCertificateById` - Получение данных сертификата
 * - `APIPostCertificateCheckPayment` - Проверка статуса оплаты (Альфа-Банк)
 * - `APIGetCertificates` - Обновление списка сертификатов пользователя
 * - `APIPostEGiftCertificateOffline` - Создание сертификата в eGift
 *
 * @module pages/CertificatesCreatePage/stages/CertificatesPaymentPage
 * @see {@link ICertificate} - Тип данных сертификата
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAtom, useSetAtom, WritableAtom } from 'jotai/index';
import moment from 'moment/moment';
import classnames from 'classnames';
// APIs
import { APIGetCertificateById, APIGetCertificates, APIPostCertificateCheckPayment, APIPostEGiftCertificateOffline } from '@/api/certificates.api.ts';
import { EGIFT_API_TOKEN, EGIFT_CLIENT_ID } from '@/api/base';
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

/**
 * Компонент страницы оплаты подарочного сертификата.
 *
 * Обрабатывает результат оплаты сертификата, отображает его статус и позволяет
 * поделиться сертификатом после успешной оплаты.
 *
 * ## Жизненный цикл:
 * 1. Загрузка сертификата по `certificate_id` из URL
 * 2. Проверка статуса оплаты по `order_number` из URL
 * 3. При успешной оплате (`isPaid: true`):
 *    - Обновляет данные сертификата
 *    - Создаёт сертификат в eGift (если есть `dreamteam_id`)
 *    - Показывает кнопки "Поделиться" и "Позже"
 *
 * ## Локальное состояние:
 * - `certificate` - Данные сертификата
 * - `loading` - Флаг загрузки
 * - `isPaid` - Статус оплаты (true/false)
 *
 * @component
 * @returns {JSX.Element} Компонент страницы оплаты сертификата
 *
 * @example
 * // URL для страницы
 * /certificates/payment/?certificate_id=123&order_number=777
 */
export const CertificatesPaymentPage: React.FC = (): JSX.Element => {
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

    /**
     * Перенаправляет пользователя на главную страницу.
     *
     * @returns {void}
     */
    const backToHome = (): void => {
        navigate('/');
    };

    /**
     * Эффект для загрузки данных сертификата при монтировании компонента.
     *
     * Отправляет запрос на получение данных сертификата по ID из URL параметра `certificate_id`.
     * При ошибке загрузки логирует ошибку и снимает флаг загрузки.
     *
     * @effect
     * @dependencies auth?.access_token, paramsObject.certificate_id
     *
     * @fires APIGetCertificateById - Выполняет запрос к API для получения данных сертификата
     * @modifies certificate - Обновляет состояние сертификата
     * @modifies loading - Снимает флаг загрузки при ошибке
     */
    useEffect(() => {
        if (auth?.access_token && paramsObject.certificate_id) {
            // Получение данных сертификата
            APIGetCertificateById(auth.access_token, paramsObject.certificate_id)
                .then((response) => setCertificate(response.data))
                .catch((error) => {
                    console.error('Error getting certificate:', error);
                    setLoading(false);
                });
        }
    }, [auth?.access_token, paramsObject.certificate_id]);

    /**
     * Проверяет статус оплаты сертификата.
     *
     * Если в параметрах URL передан `order_number`, отправляет запрос на проверку статуса оплаты.
     * При успешной оплате (`is_paid: true`) обновляет состояние `isPaid` и перезагружает список сертификатов.
     */
    const checkPayment = useCallback(() => {
        if (auth?.access_token && certificate && user?.id && paramsObject.order_number) {
            // Проверка статуса оплаты сертификата
            APIPostCertificateCheckPayment(auth.access_token, user.id, paramsObject.order_number, certificate.id)
                .then((response) => {
                    // Возвращается объект с полем is_paid: true/false с Альфы
                    setIsPaid(response.data.is_paid);
                    // Обновление списка сертификатов в приложении
                    APIGetCertificates(auth.access_token, Number(user.id))
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
    }, [auth?.access_token, certificate, user?.id, paramsObject.order_number, setCertificates]);

    /**
     * Создает сертификат в eGift после успешной оплаты
     * Вызывается только если сертификат оплачен и у него есть dreamteam_id
     * 
     * @param cert - Объект сертификата с dreamteam_id и value
     */
    const createEGiftCertificate = useCallback(async (cert: ICertificate) => {
        if (!cert?.dreamteam_id || !cert?.value) {
            console.warn('Недостаточно данных для создания сертификата в eGift');
            return;
        }

        try {
            await APIPostEGiftCertificateOffline(
                EGIFT_API_TOKEN,
                EGIFT_CLIENT_ID,
                cert.dreamteam_id,
                Number(cert.value),
                'tma'
            );
            console.log('Сертификат успешно создан в eGift');
        } catch (error) {
            console.error('Ошибка при создании сертификата в eGift:', error);
        }
    }, []);

    // Проверяем статус оплаты сертификата при монтировании компонента
    useEffect(() => {
        checkPayment();
    }, [checkPayment]);

    /**
     * Эффект для создания сертификата в eGift после успешной оплаты
     * Логика:
     * 1. Проверяем статус оплаты сертификата isPaid
     * 2. Если isPaid = true, обновляем данные сертификата через APIGetCertificateById
     * 3. Проверяем наличие dreamteam_id в обновленных данных
     * 4. Если dreamteam_id не пустое, создаем сертификат в eGift
     */
    const hasCreatedEGiftRef = useRef<boolean>(false);
    useEffect(() => {
        if (!isPaid || !auth?.access_token || !certificate?.id || hasCreatedEGiftRef.current) {
            return;
        }

        // Обновляем данные сертификата для получения актуального dreamteam_id
        APIGetCertificateById(auth.access_token, certificate.id)
            .then((response) => {
                const updatedCertificate = response.data;
                setCertificate(updatedCertificate);

                // Если dreamteam_id присвоен, создаем сертификат в eGift
                if (updatedCertificate?.dreamteam_id && updatedCertificate.dreamteam_id.trim() !== '') {
                    hasCreatedEGiftRef.current = true;
                    // Используем функцию createEGiftCertificate для создания сертификата в eGift
                    createEGiftCertificate(updatedCertificate);
                }
            })
            .catch((error) => {
                console.error('Ошибка при обновлении данных сертификата:', error);
            });
    }, [isPaid, auth?.access_token, certificate?.id, createEGiftCertificate]);

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
