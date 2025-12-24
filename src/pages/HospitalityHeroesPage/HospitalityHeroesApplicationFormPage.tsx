import React, { useEffect, useMemo, useState } from 'react';
import classnames from 'classnames';
// Components
import { Page } from '@/components/Page.tsx';
import { RoundedButton } from '@/components/RoundedButton/RoundedButton.tsx';
import { BackIcon } from '@/components/Icons/BackIcon.tsx';
import { BottomButtonWrapper } from '@/components/BottomButtonWrapper/BottomButtonWrapper.tsx';
import { TextInput } from '@/components/TextInput/TextInput.tsx';
// Hooks
import { useNavigationHistory } from '@/hooks/useNavigationHistory.ts';
// Styles
import css from '@/pages/HospitalityHeroesPage/HospitalityHeroesPage.module.css';

export const HospitalityHeroesApplicationFormPage: React.FC = () => {
    const { goBack } = useNavigationHistory();
    const [name, setName] = useState<string>('');
    const [surname, setSurname] = useState<string>('');
    const [phone, setPhone] = useState<string>('');
    const [workPlace, setWorkPlace] = useState<string>('');
    const [jobTitle, setJobTitle] = useState<string>('');
    const [experience, setExperience] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [isDisabled, setIsDisabled] = useState<boolean>(true);

    const validate = useMemo(() => {
        return (
            name.trim() !== '' &&
            surname.trim() !== '' &&
            phone.trim() !== '' &&
            workPlace.trim() !== '' &&
            jobTitle.trim() !== '' &&
            experience.trim() !== ''
        );
    }, [name, surname, phone, workPlace, jobTitle, experience]);
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (validate) {
            setLoading(true);
            console.log(name, surname, phone, workPlace, jobTitle, experience);
            setLoading(false);
        } else {
            setIsDisabled(true);
        }
    };
    useEffect(() => {
        setIsDisabled(!validate);
    }, [validate]);
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
                    <TextInput placeholder={'Ваш опыт работы'} value={experience} onChange={setExperience} />
                    <BottomButtonWrapper content={'Присоединиться'} type={'submit'} isDisabled={isDisabled} isLoading={loading} />
                </form>
            </div>
        </Page>
    );
};
