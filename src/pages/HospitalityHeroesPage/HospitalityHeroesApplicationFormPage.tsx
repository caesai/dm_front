import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import classnames from 'classnames';
import { useAtom } from 'jotai';
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

export const HospitalityHeroesApplicationFormPage: React.FC = () => {
    const navigate = useNavigate();
    const { goBack } = useNavigationHistory();
    const { showToast } = useToastState();
    const [auth] = useAtom(authAtom);
    const [, setUser] = useAtom(userAtom);
    const [name, setName] = useState<string>('');
    const [surname, setSurname] = useState<string>('');
    const [phone, setPhone] = useState<string>('');
    const [workPlace, setWorkPlace] = useState<string>('');
    const [jobTitle, setJobTitle] = useState<string>('');
    const [experience, setExperience] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);

    // Валидация формы
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

    // Отправка формы
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
                    const userResponse = await APIUserInfo(auth.access_token);
                    setUser(userResponse.data);
                    navigate('/privilege', { state: { application_success: true } });
                }
            } catch (error) {
                console.error(error);
                showToast('Произошла ошибка при присоединении к программе. Попробуйте позже');
            } finally {
                setLoading(false);
            }
        },
        [auth?.access_token, name, surname, phone, workPlace, jobTitle, experience, isValid, showToast, navigate, setUser]
    );

    return (
        <Page>
            <div className={classnames(css.page, css.bg_white)}>
                <div className={css.header}>
                    <RoundedButton
                        bgColor={'var(--primary-background)'}
                        icon={<BackIcon color={'var(--dark-grey)'} />}
                        action={goBack}
                    />
                    <span className={css.header_title}>{'Анкета'}</span>
                    <div className={css.header_spacer} />
                </div>
                <form className={css.form} onSubmit={handleSubmit}>
                    <TextInput placeholder={'Ваше имя'} value={name} onChange={setName} />
                    <TextInput placeholder={'Ваша фамилия'} value={surname} onChange={setSurname} />
                    <TextInput placeholder={'Ваш контактный номер'} value={phone} onChange={setPhone} type={'tel'} />
                    <TextInput placeholder={'Ваше место работы'} value={workPlace} onChange={setWorkPlace} />
                    <TextInput placeholder={'Ваша должность'} value={jobTitle} onChange={setJobTitle} />
                    <TextInput placeholder={'Ваш опыт работы'} value={experience} onChange={setExperience} textarea={true} rows={4} />
                    <BottomButtonWrapper
                        content={'Присоединиться'}
                        type={'submit'}
                        isDisabled={!isValid}
                        isLoading={loading}
                    />
                </form>
            </div>
        </Page>
    );
};
