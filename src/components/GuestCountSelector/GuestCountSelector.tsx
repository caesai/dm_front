import Popup from 'reactjs-popup';
import { Dispatch, FC, SetStateAction, useEffect } from 'react';
import styled from 'styled-components';
import { ContentContainer } from '@/components/ContentContainer/ContentContainer.tsx';
import css from './GuestCountSelector.module.css';

/**
 * Свойства компонента выбора количества гостей.
 */
interface GuestCountSelectorProps {
    /** Флаг, указывающий, открыто ли модальное окно */
    isOpen: boolean;
    /** Функция для управления видимостью модального окна */
    setOpen: (x: boolean) => void;
    /** Текущее количество взрослых гостей */
    guestCount: number;
    /** Текущее количество детей */
    childrenCount: number;
    /** Функция изменения количества взрослых гостей */
    setGuestCount: Dispatch<SetStateAction<number>>;
    /** Функция изменения количества детей */
    setChildrenCount: Dispatch<SetStateAction<number>>;
    /** Максимально допустимое общее количество гостей */
    maxGuestsNumber: number;
    /** Сообщение о сервисном сборе */
    serviceFeeMessage: string;
}

const StyledPopup = styled(Popup)`
    &-overlay {
        background: #58585869;
        display: flex;
        flex-direction: column-reverse;
        overscroll-behavior: contain;
    }

    // use your custom style for ".popup-content"

    &-content {
        width: 100vw;
        margin: 0 !important;
        padding: 0;
    }
`;

/**
 * Компонент модального окна для выбора количества гостей (взрослых и детей).
 * Позволяет увеличивать и уменьшать количество гостей с учетом ограничений.
 *
 * @param p - Свойства компонента
 */
export const GuestCountSelector: FC<GuestCountSelectorProps> = (p) => {
    useEffect(() => {
        if (typeof p.guestCount === 'object') {
            if (p.isOpen && !p.guestCount) {
                p.setGuestCount(1);
            }
        }
    }, [p.isOpen]);

    const onClose = () => p.setOpen(false);


    const incGuests = () => {
        p.setGuestCount((prev: number) => (prev + p.childrenCount < 9 ? prev + 1 : prev));
    };
    const decGuests = () => {
        p.setGuestCount((prev: number) => {
            return prev - 1 >= 0 ? prev - 1 : prev;
        });
    };
    const incChildren = () => {
        p.setChildrenCount((prev: number) => (prev + p.guestCount < 9 && p.guestCount >= 0 ? prev + 1 : prev));
    };
    const decChildren = () => {
        p.setChildrenCount((prev: number) => (prev - 1 >= 0 ? prev - 1 : prev));
    };
    return (
        <StyledPopup open={p.isOpen} onClose={onClose} modal>
            <ContentContainer>
                <div className={css.content}>
                    <h3>Количество гостей</h3>
                    <h5>{p.serviceFeeMessage ?? ''}</h5>

                    <div className={css.personsContainer}>
                        <span className={css.personsContainer__title}>Взрослые:</span>
                        <div className={css.personCounter}>
                            <span className={css.clickableSpan} onClick={decGuests}>
                                -
                            </span>
                            <span>{p.guestCount}</span>
                            <span className={css.clickableSpan} onClick={incGuests}>
                                +
                            </span>
                        </div>
                    </div>

                    <div className={css.personsContainer}>
                        <span className={css.personsContainer__title}>Дети:</span>
                        <div className={css.personCounter}>
                            <span className={css.clickableSpan} onClick={decChildren}>
                                -
                            </span>
                            <span>{p.childrenCount}</span>
                            <span className={css.clickableSpan} onClick={incChildren}>
                                +
                            </span>
                        </div>
                    </div>
                    <div>
                        <div className={css.redButton} onClick={onClose}>
                            <span className={css.text}>Сохранить</span>
                        </div>
                    </div>
                </div>
            </ContentContainer>
        </StyledPopup>
    );
};
