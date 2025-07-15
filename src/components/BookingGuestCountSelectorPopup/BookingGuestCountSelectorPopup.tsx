import Popup from 'reactjs-popup';
import {Dispatch, FC, SetStateAction, useEffect} from 'react';
import styled from 'styled-components';
import {ContentContainer} from '@/components/ContentContainer/ContentContainer.tsx';
import css from './BookingGuestCountSelector.module.css';
import Picker from '@/lib/react-mobile-picker';
import {
    PickerValueData,
    PickerValueObj,
} from '@/lib/react-mobile-picker/components/Picker.tsx';

import classNames from 'classnames';

interface Props {
    isOpen: boolean;
    setOpen: (x: boolean) => void;
    // guestCount: number;
    // childrenCount: number;
    // setGuestCount: Dispatch<SetStateAction<number>>;
    // setChildrenCount: Dispatch<SetStateAction<number>>;
    guestCount: PickerValueData;
    setGuestCount: Dispatch<SetStateAction<PickerValueObj>>;
    maxGuestsNumber: number;
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

export const BookingGuestCountSelectorPopup: FC<Props> = (p) => {
    if (typeof p.guestCount !== 'object') {
        return;
    }
    //
    // if (typeof p.childrenCount !== 'object') {
    //     return;
    // }
    // const [guestCount, setGuestCount] = useAtom(guestCountAtom);


    // Create selector values as objects with 'title' and 'value' properties
    // const selectorOptions = Array.from({ length: p.maxGuestsNumber }, (_, i) => {
    //   const value = (i + 1).toString();
    //   return { title: value, value };
    // });

    useEffect(() => {
        if (typeof p.guestCount === 'object') {
            if (p.isOpen && p.guestCount.value == 'unset') {
                p.setGuestCount({ title: '1', value: '1' });
            }
        }
    }, [p.isOpen]);

    const selectorOptions = Array.from({ length: p.maxGuestsNumber }, (_, i) => {
        const value = (i + 1).toString();
        return { title: value, value };
    });

    const onClose = () => p.setOpen(false);

    useEffect(() => {
        if (typeof p.guestCount === 'object') {
            if (p.isOpen && p.guestCount.value == 'unset') {
                p.setGuestCount({ title: '1', value: '1' });
            }
        }
    }, [p.isOpen]);

    // const incGuests = () => {
    //     p.setGuestCount((prev: number) => prev < 9 ? prev + 1 : prev);
    // };
    // const decGuests = () => {
    //     p.setGuestCount((prev: number) => (prev - 1 >= 1 ? prev - 1 : prev));
    // };
    // const incChildren = () => {
    //     p.setChildrenCount((prev: number) => prev < 9 ? prev + 1 : prev);
    // };
    // const decChildren = () => {
    //     p.setChildrenCount((prev: number) => (prev - 1 >= 1 ? prev - 1 : prev));
    // };
    return (
        <StyledPopup open={p.isOpen} onClose={onClose} modal>
            <ContentContainer>
                {/*<div className={css.content}>*/}
                {/*    <h3>Количество гостей</h3>*/}
                {/*    <h5>*/}
                {/*        {p.serviceFeeMessage ?? p.serviceFeeMessage}*/}
                {/*    </h5>*/}

                {/*    <div className={css.personsContainer}>*/}
                {/*        <span className={css.personsContainer__title}>*/}
                {/*            Количество гостей:*/}
                {/*        </span>*/}
                {/*        <div className={css.personCounter}>*/}
                {/*        <span className={css.clickableSpan} onClick={decGuests}>*/}
                {/*            -*/}
                {/*        </span>*/}
                {/*            <span>{p.guestCount}</span>*/}
                {/*            <span className={css.clickableSpan} onClick={incGuests}>*/}
                {/*        +*/}
                {/*        </span>*/}
                {/*        </div>*/}
                {/*    </div>*/}

                {/*    <div className={css.personsContainer}>*/}
                {/*        <span className={css.personsContainer__title}>*/}
                {/*            Включая количество детей:*/}
                {/*        </span>*/}
                {/*        <div className={css.personCounter}>*/}
                {/*        <span className={css.clickableSpan} onClick={decChildren}>*/}
                {/*            -*/}
                {/*        </span>*/}
                {/*            <span>{p.childrenCount}</span>*/}
                {/*            <span className={css.clickableSpan} onClick={incChildren}>*/}
                {/*        +*/}
                {/*        </span>*/}
                {/*        </div>*/}
                {/*    </div>*/}

                    <Picker
                        value={p.guestCount}
                        onChange={p.setGuestCount}
                        wheelMode="natural"
                        height={120}
                    >
                        <Picker.Column name={'value'}>
                            {selectorOptions.map((option) => (
                                <Picker.Item key={option.value} value={option}>
                                    {({ selected }) => (
                                        <div className={css.selectorItem}>
                                            <span
                                                className={classNames(
                                                    css.item,
                                                    selected
                                                        ? css.item__selected
                                                        : null
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
                    <div>
                        <div className={css.redButton} onClick={onClose}>
                            <span className={css.text}>Сохранить</span>
                        </div>
                    </div>
                {/*</div>*/}
            </ContentContainer>
        </StyledPopup>
    );
};
