import React, { useState, useCallback, useMemo } from 'react';
import { TextInput } from '@/components/TextInput/TextInput.tsx';
import { UniversalButton } from '@/components/Buttons/UniversalButton/UniversalButton.tsx';
import { Certificate } from '@/components/Certificate/Certificate.tsx';
import classnames from 'classnames';
import css from '@/pages/CertificatesCreatePage/CertificatesCreatePage.module.css';

const ratings = ['3 000', '5 000', '10 000'];
const MAX_NAME_LENGTH = 15;
const MAX_COMPLIMENT_LENGTH = 30;

export const CertificatesCreateOnlinePage: React.FC = () => {
    const [name, setName] = useState<string>('');
    const [compliment, setCompliment] = useState<string>('');
    const [rating, setRating] = useState<string>('****');
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
            <Certificate
                placeholder={compliment || 'Добавьте приятных слов к подарку'}
                date={'20.11.2025'}
                rating={rating}
                cardholder={name || 'Имя'}
            />
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
