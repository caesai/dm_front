import React, { useState } from 'react';
import css from '@/pages/CertificatesCreatePage/CertificatesCreatePage.module.css';
import { TextInput } from '@/components/TextInput/TextInput.tsx';
import { UniversalButton } from '@/components/Buttons/UniversalButton/UniversalButton.tsx';
import { useNavigate } from 'react-router-dom';

export const CertificatesCreateOnlinePage: React.FC = () => {
    const navigate = useNavigate();
    const [name, setName] = useState<string>('');
    const [compliment, setCompliment] = useState<string>('');
    const [rating, setRating] = useState<string>('');
    const handleNameChange = (value: string) => {
        setName(value);
    }
    const handleCompliment = (value: string)=> {
        setCompliment(value);
    }
    const handleRating = (event: React.SyntheticEvent) => {
        const selectedRating = event.currentTarget.innerHTML;
        setRating(selectedRating);
    }
    const next = () => {
        navigate('/profile');
    }
    return (
        <div className={css.content}>
            <div className={css.certificateExample}>
                <span className={css.compliment}>{compliment === '' ? 'Ваше поздравление' : compliment}</span>
                <div className={css.certificateBottom}>
                    <div>
                        <span>{name === '' ? 'Имя' : name}</span>
                        <span>ISSDSM322</span>
                    </div>
                    <div>
                        <span>Действителен:</span>
                        <span>до 20.11.2025</span>
                    </div>
                    <div>
                        <span>Номинал</span>
                        <span>{rating}</span>
                    </div>
                </div>
            </div>
            <div className={css.ratings}>
                <div className={css.rating} onClick={handleRating}>3 000 ₽</div>
                <div className={css.rating} onClick={handleRating}>5 000 ₽</div>
                <div className={css.rating} onClick={handleRating}>10 000 ₽</div>
            </div>
            <div className={css.fields}>
                <TextInput value={name} onChange={handleNameChange} placeholder={'Имя получателя'}/>
                <TextInput value={compliment} onChange={handleCompliment} placeholder={'Ваше поздравление'}/>
            </div>
            <div className={css.absoluteBottom}>
                <div className={css.bottomWrapper}>
                    <UniversalButton
                        width={'full'}
                        title={'Далее'}
                        theme={'red'}
                        action={next}
                    />
                </div>
            </div>
        </div>
    );
}
