import { ContentContainer } from '@/components/ContentContainer/ContentContainer.tsx';
import css from './TimeSelectorPopup.module.css';
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
    time: PickerValue;
    setTimeOption: Dispatch<SetStateAction<PickerValueObj>>;
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

export const TimeSelectorPopup: FC<Props> = ({
                                                   isOpen,
                                                   closePopup,
                                                 time,
                                                   setTimeOption,
                                               }) => {
    const timeOptions: PickerValueObj[] = [
        '9:00', '10:00',  '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
        '18:00', '19:00', '20:00', '21:00', '22:00', '23:00', '00:00'
    ].map((val) => (
        {
            title: val,
            value: val
        }
    ));


    useEffect(() => {
        if (isOpen && time.value === 'unset') {
            setTimeOption(timeOptions[0]);
        }
    }, [isOpen]);

    const onChange = (val: PickerValueObj) => {
        setTimeOption({
            title: `${val.value}`,
            value: val.value
        });
    };

    const picker = (
        <>
            <Picker
                // @ts-expect-error broken-lib
                value={time}
                onChange={onChange}
                wheelMode="natural"
                height={120}
            >
                <Picker.Column name={'value'}>
                    {timeOptions.map((option) => (
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
                    <h3>Выберите время</h3>
                    {picker}
                </div>
            </ContentContainer>
        </StyledPopup>
    );
};
