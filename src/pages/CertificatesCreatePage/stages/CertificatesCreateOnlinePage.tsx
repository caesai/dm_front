import React, { useState, useCallback } from 'react';
import css from '@/pages/CertificatesCreatePage/CertificatesCreatePage.module.css';
import { TextInput } from '@/components/TextInput/TextInput.tsx';
import { UniversalButton } from '@/components/Buttons/UniversalButton/UniversalButton.tsx';
// import { useNavigate } from 'react-router-dom';
import classnames from 'classnames';
import logo from '/img/DT_hospitality_logo_eng_black 1.png';

const ratings = [
    '3 000',
    '5 000',
    '10 000',
];

export const CertificatesCreateOnlinePage: React.FC = () => {
    // const navigate = useNavigate();
    const [name, setName] = useState<string>('');
    const [compliment, setCompliment] = useState<string>('');
    const [rating, setRating] = useState<string>('');
    const [isReady, setIsReady] = useState(false);
    // Use state to manage the button's position style declaratively
    const [isInputFocused, setIsInputFocused] = useState(false);

    const handleNameChange = useCallback((value: string) => {
        if (isReady) return;
        if (value.length <= 15) { // Add back manual length check
            setName(value);
        }
    }, []);

    const handleCompliment = useCallback((value: string) => {
        if (isReady) return;
        if (value.length <= 30) { // Add back manual length check
            setCompliment(value);
        }
    }, []);

    const handleRating = useCallback((selectedRating: string) => {
        setRating(selectedRating);
    }, []);

    const handleFocus = useCallback(() => {
        if (isReady) return;
        setIsInputFocused(true);
    }, []);

    const handleBlur = useCallback(() => {
        if (isReady) return;
        setIsInputFocused(false);
    }, []);

    const validateCertificate = () => {
        return name !== '' && compliment !=='' && rating !== '';
    };

    const handleNextClick = () => {
        if (!validateCertificate()) return;
        // navigate('/profile');
        setIsReady(true);
    };

    const setToEditCertificate = () => {
        setIsReady(false);
    }
    //
    // useEffect(() => {
    //     if (validateCertificate()) {
    //         setIsReady(true);
    //     } else {
    //         setIsReady(false);
    //     }
    // }, [name, compliment, rating]);

    return (
        <div className={css.content}>
            <div className={css.certificateExample}>
                <div className={css.certificateLogo}>
                    <img src={String(logo)} alt={'DreamTeam'} />
                </div>
                <div>
                    <span className={css.compliment}>
                        {compliment || 'Добавьте приятных слов к подарку'}
                    </span>
                </div>
                <div className={css.certificateBottom}>
                    <div>
                        <span>{name || 'Имя'}</span>
                        <span>*********</span>
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
            {!isReady && (
                <div className={css.ratings}>
                    {ratings.map((ratingString) => (
                        <RatingComponent
                            rating={ratingString}
                            key={ratingString} // Use the string value as key
                            onClick={handleRating}
                            selectedRating={rating}
                        />
                    ))}
                </div>
            )}
            <div className={css.fields}>
                <TextInput
                    value={name}
                    onChange={handleNameChange}
                    placeholder={'Имя получателя'}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    // maxLength={15} // Enforce length constraint
                />
                <TextInput
                    value={compliment}
                    onChange={handleCompliment}
                    placeholder={'Ваше поздравление'}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    // maxLength={30} // Enforce length constraint
                />
            </div>
            {/* Conditionally apply a CSS class for positioning */}
            <div
                data-testid="button-container"
                className={classnames(
                    css.absoluteBottom,
                    { [css.relativeBottom]: isInputFocused }
                )}
            >
                <div className={css.bottomWrapper}>
                    {!isReady ?
                        <UniversalButton
                            width={'full'}
                            title={'Далее'}
                            theme={!validateCertificate() ? undefined : 'red'}
                            action={handleNextClick}
                        /> : (
                            <>
                                <UniversalButton
                                    width={'full'}
                                    title={'Редактировать'}
                                    action={setToEditCertificate}
                                />
                                <UniversalButton
                                    width={'full'}
                                    title={'Оплатить'}
                                    theme={!validateCertificate() ? undefined : 'red'}
                                    action={handleNextClick}
                                />
                            </>
                        )}
                </div>
            </div>
        </div>
    );
}

interface RatingComponentProps {
    rating: string;
    selectedRating: string;
    onClick: (rating: string) => void;
}

const RatingComponent: React.FC<RatingComponentProps> = ({ rating, selectedRating, onClick }) => {
    return (
        <div
            className={classnames(
                css.rating,
                {
                    [css.ratingActive]: selectedRating === rating,
                }
            )}
            onClick={() => onClick(rating)}
        >
            <span>{rating} ₽</span>
        </div>
    );
};
