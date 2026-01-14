import React from 'react';
// Types
import { IBookingFormState } from '@/atoms/bookingFormAtom.ts';
// Components
import { ContentBlock } from '@/components/ContentBlock/ContentBlock';
import { HeaderContainer } from '@/components/ContentBlock/HeaderContainer/HeaderContainer.tsx';
import { HeaderContent } from '@/components/ContentBlock/HeaderContainer/HeaderContent/HeaderContainer.tsx';
import { ContentContainer } from '@/components/ContentContainer/ContentContainer.tsx';
import { TextInput } from '@/components/TextInput/TextInput.tsx';
// Styles
import css from '@/pages/BookingPage/BookingPage.module.css';

interface IBookingContactsBlockProps {
    userName: string;
    userPhone: string;
    updateFieldName: (update: Partial<IBookingFormState>) => void;
    updateFieldPhone: (update: Partial<IBookingFormState>) => void;
    validationNameValid: boolean;
    validationPhoneValid: boolean;
}

/**
 * Компонент блока контактов
 * @param {IBookingContactsBlockProps} props
 * @returns {JSX.Element}
 */
export const BookingContactsBlock: React.FC<IBookingContactsBlockProps> = ({
    userName,
    userPhone,
    updateFieldName,
    updateFieldPhone,
    validationNameValid,
    validationPhoneValid,
}: IBookingContactsBlockProps): JSX.Element => {
    return (
        <ContentContainer>
            <HeaderContainer>
                <HeaderContent title="Контакты" />
            </HeaderContainer>
            <ContentBlock className={css.form}>
                <TextInput
                    value={userName}
                    onChange={(value) => updateFieldName({ userName: value })}
                    placeholder="Имя"
                    validation_failed={!validationNameValid}
                />
                <TextInput
                    value={userPhone}
                    onChange={(value) => updateFieldPhone({ userPhone: value })}
                    placeholder="Телефон"
                    validation_failed={!validationPhoneValid}
                    type="tel"
                />
            </ContentBlock>
        </ContentContainer>
    );
};
