import React, { useState, useCallback, useMemo } from 'react';
import css from '@/pages/CertificatesCreatePage/CertificatesCreatePage.module.css';
import { TextInput } from '@/components/TextInput/TextInput.tsx';
import { UniversalButton } from '@/components/Buttons/UniversalButton/UniversalButton.tsx';
import classnames from 'classnames';
import logo from '/img/DT_hospitality_logo_eng_black 1.png';

const ratings = ['3 000', '5 000', '10 000'];
const MAX_NAME_LENGTH = 15;
const MAX_COMPLIMENT_LENGTH = 30;

export const CertificatesCreateOnlinePage: React.FC = () => {
    const [name, setName] = useState<string>('');
    const [compliment, setCompliment] = useState<string>('');
    const [rating, setRating] = useState<string>('');
    const [isInputFocused, setIsInputFocused] = useState(false);
    const [isReady, setIsReady] = useState(false);

    const handleNameChange = useCallback((value: string) => {
        if (!isReady && value.length < MAX_NAME_LENGTH) {
            setName(value);
        }
    }, [isReady]);

    const handleCompliment = useCallback((value: string) => {
        if (!isReady && value.length < MAX_COMPLIMENT_LENGTH) {
            setCompliment(value);
        }
    }, [isReady]);

    const handleRating = useCallback((selectedRatingValue: string) => {
        setRating(selectedRatingValue);
    }, []);

    const handleFocus = useCallback(() => {
        if (!isReady) {
            setIsInputFocused(true);
        }
    }, [isReady]);

    const handleBlur = useCallback(() => {
        if (!isReady) {
            setIsInputFocused(false);
        }
    }, [isReady]);

    const isValid = useMemo(() => {
        return name.trim() !== '' && compliment.trim() !== '' && rating !== '';
    }, [name, compliment, rating]);

    const handleNextClick = () => {
        if (isValid) {
            setIsReady(true);
            // In a real scenario, you'd handle navigation or API calls here
            // navigate('/profile');
        }
    };

    const setToEditCertificate = () => {
        setIsReady(false);
    };

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
                        <span>*********</span> {/* This is likely a placeholder for some ID */}
                    </div>
                    <div>
                        <span>Действителен:</span>
                        {/* The date should ideally be dynamic */}
                        <span>до 20.11.2025</span>
                    </div>
                    <div>
                        <span>Номинал</span>
                        <span>{rating }</span>
                    </div>
                </div>
            </div>

            {!isReady && (
                <div className={css.ratings}>
                    {ratings.map((ratingString) => (
                        <RatingComponent
                            rating={ratingString}
                            key={ratingString}
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
                    disabled={isReady}
                    // maxLength={MAX_NAME_LENGTH}
                />
                <TextInput
                    value={compliment}
                    onChange={handleCompliment}
                    placeholder={'Ваше поздравление'}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    disabled={isReady}
                    // maxLength={MAX_COMPLIMENT_LENGTH}
                />
            </div>

            <div
                data-testid="button-container"
                className={classnames(
                    css.absoluteBottom,
                    { [css.relativeBottom]: isInputFocused }
                )}
            >
                <div className={css.bottomWrapper}>
                    {isReady ? (
                        <>
                            <UniversalButton
                                width={'full'}
                                title={'Редактировать'}
                                action={setToEditCertificate}
                            />
                            <UniversalButton
                                width={'full'}
                                title={'Оплатить'}
                                theme={isValid ? 'red' : undefined}
                                action={handleNextClick}
                            />
                        </>
                    ) : (
                        <UniversalButton
                            width={'full'}
                            title={'Далее'}
                            theme={isValid ? 'red' : undefined}
                            action={handleNextClick}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

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
                { [css.ratingActive]: selectedRating === rating }
            )}
            onClick={() => onClick(rating)}
        >
            <span>{rating} ₽</span>
        </div>
    );
};
