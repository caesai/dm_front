/**
 * @fileoverview Страница заполнения анкеты для программы Hospitality Heroes.
 *
 * Данная страница позволяет пользователям подать заявку на участие в программе
 * лояльности Hospitality Heroes для работников сферы гостеприимства.
 *
 * ## Основной функционал:
 * - Форма с обязательными полями: имя, фамилия, телефон, место работы, должность, опыт работы
 * - Автоматическое предзаполнение данных пользователя (имя, фамилия, телефон)
 * - Клиентская валидация всех обязательных полей (trim !== '')
 * - HTML5 валидация с атрибутом required
 * - Отправка заявки через API и обновление данных пользователя
 *
 * ## Навигация:
 * - Переход с {@link HospitalityHeroesPage} через кнопку "Заполнить анкету"
 * - После успешной отправки редирект на {@link PrivilegePage} с флагом application_success
 *
 * @module pages/HospitalityHeroesPage/HospitalityHeroesApplicationFormPage
 * @see {@link PrivilegePage} - страница привилегий (редирект после успешной отправки)
 * @see {@link HospitalityHeroesPage} - главная страница программы Hospitality Heroes
 * @see {@link APIPostSuperEventCreateApplication} - API для создания заявки
 */
import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import classnames from 'classnames';
import { useAtom, useAtomValue } from 'jotai';
// APIs
import { APIPostSuperEventCreateApplication } from '@/api/events.api.ts';
import { APIUserInfo } from '@/api/auth.api.ts';
// Atoms
import { authAtom, userAtom } from '@/atoms/userAtom.ts';
// Components
import { Page } from '@/components/Page.tsx';
import { RoundedButton } from '@/components/RoundedButton/RoundedButton.tsx';
import { BackIcon } from '@/components/Icons/BackIcon.tsx';
import { BottomButtonWrapper } from '@/components/BottomButtonWrapper/BottomButtonWrapper.tsx';
import { TextInput } from '@/components/TextInput/TextInput.tsx';
// Hooks
import { useNavigationHistory } from '@/hooks/useNavigationHistory.ts';
import useToastState from '@/hooks/useToastState.ts';
// Styles
import css from '@/pages/HospitalityHeroesPage/HospitalityHeroesPage.module.css';
import { HeaderContainer } from '@/components/ContentBlock/HeaderContainer/HeaderContainer';
import { HeaderContent } from '@/components/ContentBlock/HeaderContainer/HeaderContent/HeaderContainer';

/**
 * Страница заполнения анкеты для участия в программе Hospitality Heroes.
 *
 * Компонент предоставляет форму для сбора данных о пользователе:
 * - Персональные данные (имя, фамилия, телефон) - предзаполняются из профиля
 * - Профессиональные данные (место работы, должность, опыт) - заполняются пользователем
 *
 * @component
 * @example
 * // Использование в роутере
 * <Route path="/hospitality-heroes/application" element={<HospitalityHeroesApplicationFormPage />} />
 *
 * @returns {JSX.Element} Страница с формой заявки Hospitality Heroes
 */
export const HospitalityHeroesApplicationFormPage: React.FC = (): JSX.Element => {
    const navigate = useNavigate();
    const { goBack } = useNavigationHistory();
    const { showToast } = useToastState();
    const auth = useAtomValue(authAtom);
    const [user, setUser] = useAtom(userAtom);

    // ============================================
    // Состояние формы
    // ============================================

    /** Имя пользователя (предзаполняется из профиля) */
    const [name, setName] = useState<string>(user?.first_name || '');
    /** Фамилия пользователя (предзаполняется из профиля) */
    const [surname, setSurname] = useState<string>(user?.last_name || '');
    /** Контактный телефон (предзаполняется из профиля) */
    const [phone, setPhone] = useState<string>(user?.phone_number || '');
    /** Место работы пользователя */
    const [workPlace, setWorkPlace] = useState<string>('');
    /** Должность пользователя */
    const [jobTitle, setJobTitle] = useState<string>('');
    /** Опыт работы в сфере гостеприимства */
    const [experience, setExperience] = useState<string>('');
    /** Флаг загрузки (отправка формы) */
    const [loading, setLoading] = useState<boolean>(false);

    // ============================================
    // Валидация
    // ============================================

    /**
     * Проверяет валидность формы.
     * Все поля обязательны и не должны состоять только из пробелов.
     *
     * @returns {boolean} true, если все поля заполнены корректно
     */
    const isValid = useMemo(() => {
        return (
            name.trim() !== '' &&
            surname.trim() !== '' &&
            phone.trim() !== '' &&
            workPlace.trim() !== '' &&
            jobTitle.trim() !== '' &&
            experience.trim() !== ''
        );
    }, [name, surname, phone, workPlace, jobTitle, experience]);

    // ============================================
    // Обработчики событий
    // ============================================

    /**
     * Обрабатывает отправку формы заявки.
     *
     * Выполняет следующие действия:
     * 1. Предотвращает стандартное поведение формы
     * 2. Проверяет валидность формы и наличие токена авторизации
     * 3. Отправляет данные на сервер через {@link APIPostSuperEventCreateApplication}
     * 4. При успехе обновляет данные пользователя и выполняет редирект
     * 5. При ошибке показывает уведомление через toast
     *
     * @param {React.FormEvent<HTMLFormElement>} e - Событие отправки формы
     * @returns {Promise<void>}
     */
    const handleSubmit = useCallback(
        async (e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            if (!isValid || !auth?.access_token) return;

            setLoading(true);
            try {
                const response = await APIPostSuperEventCreateApplication(auth.access_token, {
                    name,
                    surname,
                    phone,
                    work_place: workPlace,
                    job_title: jobTitle,
                    experience,
                });

                if (response.data.success) {
                    // Обновляем данные пользователя после успешной подачи заявки
                    const userResponse = await APIUserInfo(auth.access_token);
                    setUser(userResponse.data);

                    /**
                     * Переход на страницу Привилегии с флагом успешной заявки.
                     * Флаг application_success используется для показа модального окна.
                     * @see {@link PrivilegePage}
                     */
                    navigate('/privilege', { state: { application_success: true } });
                }
            } catch (error) {
                console.error(error);
                showToast('Произошла ошибка при присоединении к программе. Попробуйте позже');
            } finally {
                setLoading(false);
            }
        },
        [
            auth?.access_token,
            name,
            surname,
            phone,
            workPlace,
            jobTitle,
            experience,
            isValid,
            showToast,
            navigate,
            setUser,
        ]
    );

    return (
        <Page className={classnames(css.page, css.bg_white)}>
            <HeaderContainer className={css.header}>
                <RoundedButton
                    bgColor={'var(--primary-background)'}
                    icon={<BackIcon color={'var(--dark-grey)'} />}
                    action={goBack}
                />
                <HeaderContent title={'Анкета'} className={css.header_title} />
                <div className={css.header_spacer} />
            </HeaderContainer>
            <form className={css.form} onSubmit={handleSubmit}>
                <TextInput placeholder={'Ваше имя'} value={name} onChange={setName} required />
                <TextInput placeholder={'Ваша фамилия'} value={surname} onChange={setSurname} required />
                <TextInput placeholder={'Ваш контактный номер'} value={phone} onChange={setPhone} type={'tel'} required />
                <TextInput placeholder={'Ваше место работы'} value={workPlace} onChange={setWorkPlace} required />
                <TextInput placeholder={'Ваша должность'} value={jobTitle} onChange={setJobTitle} required />
                <TextInput
                    placeholder={'Ваш опыт работы'}
                    value={experience}
                    onChange={setExperience}
                    textarea={true}
                    rows={4}
                    required
                />
                <BottomButtonWrapper
                    content={'Присоединиться'}
                    type={'submit'}
                    isDisabled={!isValid}
                    isLoading={loading}
                />
            </form>
        </Page>
    );
};
