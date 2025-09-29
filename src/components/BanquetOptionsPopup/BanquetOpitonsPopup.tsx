import { ContentContainer } from '@/components/ContentContainer/ContentContainer.tsx';
import css from './BanquetOptionsPopup.module.css';
import styled from 'styled-components';
import Popup from 'reactjs-popup';
import { Dispatch, FC, SetStateAction, useEffect } from 'react';
import Picker, { PickerValue } from '@/lib/react-mobile-picker';
import { PickerValueObj } from '@/lib/react-mobile-picker/components/Picker.tsx';
import classNames from 'classnames';
import { UniversalButton } from '@/components/Buttons/UniversalButton/UniversalButton.tsx';

interface Props {
    isOpen: boolean;
    closePopup: () => void;
    guestCount: PickerValue;
    setGuestCount: Dispatch<SetStateAction<PickerValueObj>>;
    minGuests: number;
    maxGuests: number;
}

const StyledPopup = styled(Popup)`
    &-overlay {
        background: #58585869;
        display: flex;
        flex-direction: column-reverse;
        overscroll-behavior: contain;
    }

    &-content {
        width: 100vw;
        margin: 0 !important;
        padding: 0;
    }
`;

export const BanquetOptionsPopup: FC<Props> = ({
                                                   isOpen,
                                                   closePopup,
                                                   guestCount,
                                                   setGuestCount,
                                                   minGuests,
                                                   maxGuests
                                               }) => {
    const guestOptions: PickerValueObj[] = Array.from(
        { length: maxGuests - minGuests + 1 },
        (_, i) => {
            const count = i + minGuests;
            return {
                title: `${count} гостей`,
                value: count.toString()
            };
        }
    );

    useEffect(() => {
        if (isOpen && guestCount.value === 'unset') {
            setGuestCount(guestOptions[0]);
        }
    }, [isOpen]);

    const onChange = (val: PickerValueObj) => {
        setGuestCount({
            title: `${val.value} гостей`,
            value: val.value
        });
    };

    const picker = (
        <>
            <Picker
                // @ts-expect-error broken-lib
                value={guestCount}
                onChange={onChange}
                wheelMode="natural"
                height={120}
            >
                <Picker.Column name={'value'}>
                    {guestOptions.map((option) => (
                        <Picker.Item key={option.value} value={option}>
                            {({ selected }) => (
                                <div className={css.selectorItem}>
                                    <span
                                        className={classNames(
                                            css.item,
                                            selected ? css.item__selected : null
                                        )}
                                    >
                                        {option.title}
                                    </span>
                                </div>
                            )}
                        </Picker.Item>
                    ))}
                </Picker.Column>
            </Picker>
            <UniversalButton width={'full'} title={'Сохранить'} theme={'red'} action={closePopup} />
        </>
    );

    return (
        <StyledPopup open={isOpen} onClose={closePopup} modal>
            <ContentContainer>
                <div className={css.content}>
                    <h3>Укажите количество гостей</h3>
                    {picker}
                </div>
            </ContentContainer>
        </StyledPopup>
    );
};