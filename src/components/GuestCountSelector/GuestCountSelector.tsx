import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import Popup from 'reactjs-popup';
import styled from 'styled-components';
// Components
import { ContentContainer } from '@/components/ContentContainer/ContentContainer.tsx';
import { ContentBlock } from '@/components/ContentBlock/ContentBlock.tsx';
import { UsersIcon } from '@/components/Icons/UsersIcon.tsx';
import { DropDownSelect } from '@/components/DropDownSelect/DropDownSelect.tsx';
import css from '@/components/GuestCountSelector/GuestCountSelector.module.css';
import { getGuestsString } from '@/utils';

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
 * Свойства компонента выбора количества гостей.
 */
interface IGuestCountPopupProps {
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
    // maxGuestsNumber: number;
    /** Сообщение о сервисном сборе */
    serviceFeeMessage: string;
}

/**
 * Компонент модального окна для выбора количества гостей (взрослых и детей).
 * Позволяет увеличивать и уменьшать количество гостей с учетом ограничений.
 *
 * @param p - Свойства компонента
 */
const GuestCountPopup: React.FC<IGuestCountPopupProps> = ({
    isOpen,
    setOpen,
    guestCount,
    childrenCount,
    setGuestCount,
    setChildrenCount,
    // maxGuestsNumber,
    serviceFeeMessage,
}: IGuestCountPopupProps) => {
    useEffect(() => {
        if (typeof guestCount === 'object') {
            if (isOpen && !guestCount) {
                setGuestCount(1);
            }
        }
    }, [isOpen]);

    const onClose = () => setOpen(false);

    const incGuests = () => {
        setGuestCount((prev: number) => (prev + childrenCount < 9 ? prev + 1 : prev));
    };
    const decGuests = () => {
        setGuestCount((prev: number) => {
            return prev - 1 >= 0 ? prev - 1 : prev;
        });
    };
    const incChildren = () => {
        setChildrenCount((prev: number) => (prev + guestCount < 9 && guestCount >= 0 ? prev + 1 : prev));
    };
    const decChildren = () => {
        setChildrenCount((prev: number) => (prev - 1 >= 0 ? prev - 1 : prev));
    };
    return (
        <StyledPopup open={isOpen} onClose={onClose} modal>
            <ContentContainer className={css.content}>
                <h3>Количество гостей</h3>
                <h5>{serviceFeeMessage ?? ''}</h5>

                <div className={css.personsContainer}>
                    <span className={css.personsContainer__title}>Взрослые:</span>
                    <div className={css.personCounter}>
                        <span className={css.clickableSpan} onClick={decGuests}>
                            -
                        </span>
                        <span>{guestCount}</span>
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
                        <span>{childrenCount}</span>
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
            </ContentContainer>
        </StyledPopup>
    );
};

interface IGuestCountSelectorProps {
    guestCount: number;
    childrenCount: number;
    // maxGuestsNumber: number;
    setGuestCount: Dispatch<SetStateAction<number>>;
    setChildrenCount: Dispatch<SetStateAction<number>>;
    serviceFeeMessage: string;
}

/**
 * Компонент выбора количества гостей.
 * @param {IGuestCountPopupProps} p - Свойства компонента
 * @returns {JSX.Element} - Компонент выбора количества гостей
 */
export const GuestCountSelector: React.FC<IGuestCountSelectorProps> = ({
    guestCount,
    childrenCount,
    setGuestCount,
    setChildrenCount,
    // maxGuestsNumber,
    serviceFeeMessage,
}: IGuestCountSelectorProps): JSX.Element => {
    const [guestCountPopup, setGuestCountPopup] = useState(false);
    const toggleGuestCountPopup = () => setGuestCountPopup(!guestCountPopup);
    return (
        <ContentBlock>
            <GuestCountPopup
                isOpen={guestCountPopup}
                setOpen={setGuestCountPopup}
                guestCount={guestCount}
                childrenCount={childrenCount}
                setGuestCount={setGuestCount}
                setChildrenCount={setChildrenCount}
                // maxGuestsNumber={maxGuestsNumber}
                serviceFeeMessage={serviceFeeMessage}
            />
            <DropDownSelect
                title={guestCount ? getGuestsString(guestCount + childrenCount) : 'Гости'}
                // isValid={guestsValidatedDisplay} // TODO: Добавить валидацию
                icon={<UsersIcon size={24} />}
                onClick={toggleGuestCountPopup}
            />
        </ContentBlock>
    );
};
