import React, { useState, useCallback, useMemo } from 'react';
import { useAtom } from 'jotai/index';
import classnames from 'classnames';
import moment from 'moment';
// Types
import { CERTIFICATION_TYPES } from '@/types/certificates.types.ts';
// API
import { APIPostCreateWithPayment } from '@/api/certificates.api.ts';
// Atoms
import { authAtom, userAtom } from '@/atoms/userAtom.ts';
// Components
import { TextInput } from '@/components/TextInput/TextInput.tsx';
import { UniversalButton } from '@/components/Buttons/UniversalButton/UniversalButton.tsx';
import { Certificate } from '@/components/Certificate/Certificate.tsx';
import { Loader } from '@/components/AppLoadingScreen/AppLoadingScreen.tsx';
// Styles
import css from '@/pages/CertificatesCreatePage/CertificatesCreatePage.module.css';

const ratings = ['3 000', '5 000', '10 000'];
const MAX_NAME_LENGTH = 15;
const MAX_COMPLIMENT_LENGTH = 30;

export const CertificatesCreateOnlinePage: React.FC = () => {
    const [auth] = useAtom(authAtom);
    const [user] = useAtom(userAtom);
    const [name, setName] = useState<string>('');
    const [compliment, setCompliment] = useState<string>('');
    const [rating, setRating] = useState<string>('****');
    const [isInputFocused, setIsInputFocused] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleNameChange = useCallback((value: string) => {
        if (value.length < MAX_NAME_LENGTH) {
            setName(value);
        }
    }, []);

    const handleCompliment = useCallback((value: string) => {
        if (value.length < MAX_COMPLIMENT_LENGTH) {
            setCompliment(value);
        }
    }, []);

    const handleRating = useCallback((selectedRatingValue: string) => {
        setRating(selectedRatingValue);
    }, []);

    const handleFocus = useCallback(() => {
        setIsInputFocused(true);
    }, []);

    const handleBlur = useCallback(() => {
        setIsInputFocused(false);
    }, []);

    const isValid = useMemo(() => {
        return name.trim() !== '' && compliment.trim() !== '' && rating !== '';
    }, [name, compliment, rating]);

    const handleNextClick = () => {
        if (isValid) {
            setLoading(true);
            APIPostCreateWithPayment(
                String(auth?.access_token),
                Number(user?.id),
                CERTIFICATION_TYPES.ONLINE,
                Number(rating.replace(/\s/g, '')),
                name,
                compliment
            )
                .then((response) => {
                    window.location.href = response.data.form_url;
                })
                .catch((error) => {
                    console.log(error);
                    setLoading(false);
                });
        }
    };

    if (loading) {
        return (
            <div className={css.loader}>
                <Loader />
            </div>
        );
    }

    return (
        <div className={css.content}>
            <Certificate
                placeholder={compliment || 'Добавьте приятных слов к подарку'}
                date={moment().add(1, 'year').format('DD.MM.YYYY')}
                rating={rating}
                cardholder={name || 'Имя'}
            />
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

            <div className={css.fields}>
                <TextInput
                    value={name}
                    onChange={handleNameChange}
                    placeholder={'Имя получателя'}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    // disabled={isReady}
                    // maxLength={MAX_NAME_LENGTH}
                />
                <TextInput
                    value={compliment}
                    onChange={handleCompliment}
                    placeholder={'Ваше поздравление'}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    // disabled={isReady}
                    // maxLength={MAX_COMPLIMENT_LENGTH}
                />
            </div>

            <div
                data-testid="button-container"
                className={classnames(css.absoluteBottom, { [css.relativeBottom]: isInputFocused })}
            >
                <div className={css.bottomWrapper}>
                    <UniversalButton
                        width={'full'}
                        title={'Оплатить'}
                        theme={isValid ? 'red' : undefined}
                        action={handleNextClick}
                    />
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
            className={classnames(css.rating, { [css.ratingActive]: selectedRating === rating })}
            onClick={() => onClick(rating)}
        >
            <span>{rating} ₽</span>
        </div>
    );
};
