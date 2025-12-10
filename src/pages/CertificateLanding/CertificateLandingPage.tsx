import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAtom, useSetAtom } from 'jotai/index';
import moment from 'moment';
// API
import { APIGetCertificateById, APIGetCertificates, APIPostCertificateClaim } from '@/api/certificates.api.ts';
// Types
import { ICertificate } from '@/types/certificates.types.ts';
// Atoms
import { authAtom, userAtom } from '@/atoms/userAtom.ts';
import { certificatesListAtom } from '@/atoms/certificatesListAtom.ts';
import { showToastAtom } from '@/atoms/toastAtom.ts';
// Components
import { Page } from '@/components/Page.tsx';
import { DTHospitalityIcon } from '@/components/Icons/DTHospitalityIcon.tsx';
import AccordionComponent from '@/components/Accordion/AccordionComponent.tsx';
import { RoundedButton } from '@/components/RoundedButton/RoundedButton.tsx';
import { CrossIcon } from '@/components/Icons/CrossIcon.tsx';
import { ModalPopup } from '@/components/ModalPopup/ModalPopup.tsx';
import { Loader } from '@/components/AppLoadingScreen/AppLoadingScreen.tsx';
import { BottomButtonWrapper } from '@/components/BottomButtonWrapper/BottomButtonWrapper.tsx';
import { RestaurantsList } from '@/components/RestaurantsList/RestaurantsList.tsx';
// Hooks
import { useModal } from '@/components/ModalPopup/useModal.ts';
// Styles
import css from '@/pages/CertificateLanding/CertificateLandingPage.module.css';

/**
 * Компонент страницы отображения детальной информации о подарочном сертификате.
 *
 * Отображает информацию о сертификате, позволяет активировать его, перейти к бронированию стола
 * или пройти онбординг для неавторизованных пользователей.
 *
 * Автоматически обрабатывает различные сценарии:
 * - Загрузка данных сертификата по ID из URL
 * - Автоматическая активация сертификата для авторизованных пользователей
 * - Перенаправление неавторизованных пользователей на онбординг
 * - Проверка статуса и срока действия сертификата
 *
 * @component
 * @returns {JSX.Element} Компонент страницы сертификата
 */
export const CertificateLandingPage: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [auth] = useAtom(authAtom);
    const [user] = useAtom(userAtom);
    const [, setCertificates] = useAtom(certificatesListAtom);
    const [certificate, setCertificate] = useState<ICertificate | null>(null);
    const setShowToast = useSetAtom(showToastAtom);
    const [loading, setLoading] = useState<boolean>(true);
    const { isShowing, toggle, setIsShowing } = useModal();

    /**
     * Мемоизированная функция для отображения toast-уведомлений.
     * Используется для стабильности зависимостей в других хуках.
     *
     * @param {string} message - Текст сообщения для отображения
     * @returns {void}
     */
    const showToast = useCallback(
        (message: string) => {
            setShowToast({ message, type: 'info' });
        },
        [setShowToast]
    );

    /**
     * Эффект для загрузки данных сертификата при монтировании компонента или изменении зависимостей.
     *
     * Отправляет запрос на получение данных сертификата по его ID из параметров URL.
     * В случае успеха обновляет локальное состояние сертификата.
     * В случае ошибки показывает toast-уведомление и через 7 секунд перенаправляет
     * пользователя на страницу списка сертификатов.
     *
     * @effect
     * @dependencies auth?.access_token, id, showToast, navigate
     *
     * @fires APIGetCertificateById - Выполняет асинхронный запрос к API для получения данных сертификата
     * @modifies certificate - Обновляет локальное состояние сертификата через setCertificate
     * @fires showToast - Показывает уведомление об ошибке загрузки
     * @fires navigate - Перенаправляет пользователя на страницу списка сертификатов при ошибке
     */
    useEffect(() => {
        if (auth?.access_token) {
            if (id) {
                APIGetCertificateById(auth.access_token, id)
                    .then((response) => setCertificate(response.data))
                    .catch(() => {
                        showToast('Не удалось загрузить сертификат. Попробуйте еще раз.');
                        setTimeout(() => {
                            navigate('/certificates/1');
                        }, 7000);
                    });
            }
        }
    }, [auth?.access_token, id, showToast, navigate]);
    /**
     * Мемоизированная функция для активации (клейма) сертификата текущим пользователем.
     *
     * Выполняет последовательность действий:
     * 1. Отправляет запрос на активацию сертификата через API
     * 2. Параллельно получает обновленный список сертификатов и данные текущего сертификата
     * 3. Обновляет локальное состояние сертификата и глобальный список сертификатов
     * 4. Показывает уведомление об успехе или ошибке
     *
     * @callback
     * @async
     * @returns {Promise<void>}
     *
     * @throws {Error} При отсутствии необходимых данных (токен, ID пользователя, ID сертификата)
     * @fires APIPostCertificateClaim - Активирует сертификат для текущего пользователя
     * @fires APIGetCertificates - Получает обновленный список сертификатов
     * @fires APIGetCertificateById - Получает обновленные данные текущего сертификата
     * @modifies certificatesListAtom - Обновляет глобальный список сертификатов
     * @modifies certificate - Обновляет локальное состояние сертификата
     * @fires showToast - Показывает уведомление об успехе или ошибке
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
            await APIPostCertificateClaim(String(accessToken), userId, certId, certificate?.recipient_name);
            const results = await Promise.all([
                APIGetCertificates(accessToken, userId),
                APIGetCertificateById(auth.access_token, id),
            ]);
            // 2. Если клейм успешен, получаем обновленный список сертификатов
            setCertificates(results[0].data);
            // // 3. Обновляем сертификат на странице
            setCertificate(results[1].data);
            showToast('Сертификат успешно активирован!'); // Можно добавить тост успеха
        } catch (err) {
            // Обработка ошибок как первого, так и второго запроса
            console.error('Ошибка при работе с сертификатом:', err);
            showToast('Произошла ошибка. Попробуйте перезагрузить страницу');
        }
    }, [auth?.access_token, certificate, id, user?.id, setCertificates, showToast]);

    /**
     * Проверяет, использован ли сертификат.
     *
     * @callback
     * @returns {boolean} `true` если сертификат отсутствует или имеет статус 'used', иначе `false`
     */
    const isCertificateUsed = useCallback(() => {
        if (!certificate) return true;
        return certificate.status === 'used';
    }, [certificate]);

    /**
     * Проверяет, истек ли срок действия сертификата.
     *
     * @callback
     * @returns {boolean} `true` если сертификат отсутствует или срок его действия истек, иначе `false`
     */
    const isCertificateExpired = useCallback(() => {
        if (!certificate) return true;
        return moment().isAfter(moment(certificate.expired_at));
    }, [certificate]);

    /**
     * Мемоизированное значение, указывающее истек ли срок действия сертификата.
     * Используется для оптимизации производительности и избежания лишних вычислений.
     *
     * @memo
     * @returns {boolean} Результат проверки истечения срока действия сертификата
     */
    const certificateExpired = useMemo(() => isCertificateExpired(), [isCertificateExpired]);
    /**
     * Проверяет, активен ли сертификат для использования.
     *
     * Сертификат считается активным, если:
     * - Его статус равен 'paid' (оплачен) или 'shared' (подарен)
     * - И срок его действия не истек
     *
     * @callback
     * @returns {boolean} `true` если сертификат неактивен (отсутствует, использован, истек или имеет неактивный статус),
     *                    `false` если сертификат активен и может быть использован
     */
    const isCertificateDisabled = useCallback(() => {
        if (!certificate) return true;
        return !((certificate.status === 'paid' || certificate.status === 'shared') && !certificateExpired);
    }, [certificate, certificateExpired]);
    /**
     * Эффект для управления логикой работы с сертификатом в зависимости от статуса пользователя и сертификата.
     *
     * Выполняет следующие проверки и действия:
     * 1. Если сертификат неактивен - завершает загрузку
     * 2. Для авторизованных пользователей с завершенным онбордингом:
     *    - Если сертификат не был подарен и пользователь - владелец - завершает загрузку
     *    - Если сертификат не был подарен и пользователь - не владелец - автоматически активирует сертификат
     *    - Если сертификат был подарен и пользователь - получатель - завершает загрузку
     *    - Если сертификат был подарен и пользователь - не получатель - перенаправляет на список сертификатов
     * 3. Для неавторизованных пользователей или без завершенного онбординга:
     *    - Если сертификат не был подарен - завершает загрузку (показывает страницу)
     *    - Если сертификат был подарен - перенаправляет на онбординг
     *
     * @effect
     * @dependencies certificate, user, isCertificateDisabled, acceptCertificate, navigate
     *
     * @modifies loading - Устанавливает состояние загрузки в `false` при завершении проверок
     * @fires acceptCertificate - Автоматически активирует сертификат при соответствующих условиях
     * @fires navigate - Перенаправляет пользователя на другие страницы при необходимости
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
                    (async () => {
                        await acceptCertificate();
                        setLoading(false);
                    })();
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
    }, [certificate, user, isCertificateDisabled, acceptCertificate, navigate]);

    /**
     * Перенаправляет пользователя на главную страницу.
     *
     * @returns {void}
     */
    const goHome = () => {
        navigate('/');
    };

    /**
     * Перенаправляет пользователя на страницу онбординга с параметрами для работы с сертификатом.
     *
     * @returns {void}
     */
    const goToOnboarding = () => {
        navigate('/onboarding/3', { state: { certificateId: id, sharedCertificate: true, certificate: true } });
    };

    /**
     * Обрабатывает переход к странице бронирования стола.
     *
     * Если пользователь не прошел онбординг, показывает модальное окно с предложением зарегистрироваться.
     * Иначе перенаправляет на страницу бронирования с параметрами сертификата.
     *
     * @modifies isShowing - Показывает модальное окно для неавторизованных пользователей
     * @fires navigate - Перенаправляет на страницу бронирования для авторизованных пользователей
     * @returns {void}
     */
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
                text={
                    'Чтобы воспользоваться сертификатом и забронировать стол онлайн, необходимо зарегистрироваться в приложении Dreamteam Concierge. Или просто покажите код сертификата официанту'
                }
                btnText={'Зарегистрироваться'}
                btnAction={goToOnboarding}
                btnScndrText={'Покажу официанту'}
                btnsColumn={true}
            />
            <section className={css.container}>
                <div className={css.content}>
                    <div className={css.header}>
                        <DTHospitalityIcon />
                        {isCertificateDisabled() ? (
                            certificateExpired ? (
                                <h1>У данного сертификата истек срок действия</h1>
                            ) : (
                                <h1>
                                    Данный подарочный сертификат {isCertificateUsed() ? 'использован' : 'используется'}
                                </h1>
                            )
                        ) : (
                            <h1>
                                Подарочный сертификат <br /> в любой ресторан Dreamteam
                            </h1>
                        )}
                        <div onClick={goHome} className={css.close}>
                            <RoundedButton icon={<CrossIcon size={44} />} />
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
                                <span>Сертификат использован</span>
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
                                <li>Сертификат действует во всех ресторанах Dreamteam.</li>
                                <li>Срок действия - один год с момента покупки.</li>
                                <li>Сертификатом можно оплатить любые блюда и напитки из меню.</li>
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
                                    Забронируйте стол через приложение и укажите сертификат на экране бронирования — мы
                                    всё учтём заранее.
                                </li>
                                <li>
                                    Если бронировали по телефону или пришли без брони — просто покажите сертификат
                                    официанту.
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
