import Popup from 'reactjs-popup';
import styled from 'styled-components';
import { FC, useEffect, useState } from 'react';
import css from './FeedbackPopup.module.css';
import { StarIcon } from '@/components/Icons/Star.tsx';
import classNames from 'classnames';
import './FeedbackPopup.css';
import { APIIsReviewAvailable, APISendReview } from '@/api/restaurants.ts';
import { useAtom } from 'jotai';
import { authAtom, reviewAtom } from '@/atoms/userAtom.ts';

const StyledPopup = styled(Popup)`
    &-overlay {
    }

    &-content {
        position: absolute !important;
        bottom: 0;
        width: 100vw;
        padding: 0;
        animation: slideUp 0.2s ease-out forwards;
        border-top-left-radius: 10px;
        border-top-right-radius: 10px;
    }
`;

interface Props {
    isOpen: boolean;
    setOpen: (x: boolean) => void;
    booking_id: number;
}

export const FeedbackPopup: FC<Props> = (props) => {
    const close = () => props.setOpen(false);
    const [rating, setRating] = useState(0);
    const [ratingString, setRatingString] = useState('Выберите оценку');
    const [currentTags, setCurrentTags] = useState<string[]>([]);
    const [tagsList] = useState<string[]>([
        'Размер порции и подача',
        'Атмосфера',
        'Чистота и комфорт',
        'Гостеприимство',
        'Музыка',
        'Скорость обслуживания',
        'Дополнительные удобства',
        'Вкус блюд и напитков',
    ]);
    const [formValidated, setFormValidated] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const [commentary, setCommentary] = useState('');
    const [auth] = useAtom(authAtom);
    const [, setReview] = useAtom(reviewAtom);

    useEffect(() => {
        if (isClosing) {
            setTimeout(() => close(), 200);
        }
    }, [isClosing]);

    // hack to prevent from scrolling on page
    useEffect(() => {
        if (props.isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'scroll';
        }
        return () => {
            document.body.style.overflow = 'scroll';
        };
    }, [props]);

    useEffect(() => {
        if (rating !== 0) {
            setFormValidated(true);
        }
    }, [rating]);

    useEffect(() => {
        if (props.isOpen) {
            console.log('isOpen');
            setIsClosing(false);
            setRating(0);
            setCurrentTags([]);
            setFormValidated(false);
            setRatingString('Выберите оценку');
        }
    }, [props.isOpen]);

    const removeFromCurrentTags = (tag: string) => {
        setCurrentTags((prevState) => prevState.filter((val) => val !== tag));
    };

    const addToCurrentTags = (tag: string) => {
        setCurrentTags((prevState) => [...prevState, tag]);
    };

    const updateTag = (tag: string) => {
        if (currentTags.includes(tag)) {
            removeFromCurrentTags(tag);
        } else {
            addToCurrentTags(tag);
        }
    };

    const handleSendForm = () => {
        if (!auth?.access_token) {
            return;
        }
        APISendReview(auth.access_token, rating, tagsList, commentary)
            .then(() => setIsClosing(true))
            .finally(() =>
                APIIsReviewAvailable(auth.access_token).then((res) => {
                    setReview({
                        loading: false,
                        available: res.data.available,
                    });
                    !res.data.available ? setIsClosing(true) : null;
                })
            );
    };

    useEffect(() => {
        switch (rating) {
            case 1:
                setRatingString('Очень плохо');
                break;
            case 2:
                setRatingString('Плохо');
                break;
            case 3:
                setRatingString('Удовлетворительно');
                break;
            case 4:
                setRatingString('Хорошо');
                break;
            case 5:
                setRatingString('Отлично');
                break;
        }
    }, [rating]);

    return (
        <StyledPopup
            open={props.isOpen}
            onClose={close}
            closeOnDocumentClick={true}
            className={isClosing ? 'popupClose' : 'popup'}
        >
            <div
                className={classNames(
                    css.popup,
                    isClosing ? css.popup__closing : null
                )}
            >
                <span className={css.title}>Как прошел ваш визит?</span>
                <div className={css.rating}>
                    <span className={css.ratingStatus}>{ratingString}</span>
                    <div className={css.stars}>
                        {[1, 2, 3, 4, 5].map((v) => (
                            <span key={v} onClick={() => setRating(v)}>
                                <StarIcon
                                    size={25}
                                    is_filled={true}
                                    color={rating >= v ? '#CA0E11' : '#D0D0D0'}
                                />
                            </span>
                        ))}
                    </div>
                </div>
                <div className={css.tags}>
                    <span className={css.tags_title}>Что вам понравилось?</span>
                    <div className={css.tags_list}>
                        {tagsList.map((tag) => (
                            <span
                                key={tag}
                                onClick={() => updateTag(tag)}
                                className={classNames(
                                    css.tag,
                                    currentTags.includes(tag)
                                        ? css.tag__selected
                                        : null
                                )}
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
                <input
                    className={css.feedback_text}
                    type="text"
                    placeholder={'Расскажите об опыте — для нас это важно!'}
                    value={commentary}
                    onChange={(e) => setCommentary(e.target.value)}
                />
                <button
                    className={classNames(
                        css.button,
                        !formValidated ? css.button__disabled : null
                    )}
                    onClick={
                        formValidated ? () => handleSendForm() : () => null
                    }
                >
                    Отправить
                </button>
            </div>
        </StyledPopup>
    );
};
