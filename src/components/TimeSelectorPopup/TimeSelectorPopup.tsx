import { ContentContainer } from '@/components/ContentContainer/ContentContainer.tsx';
import css from './TimeSelectorPopup.module.css';
import styled from 'styled-components';
import Popup from 'reactjs-popup';
import { Dispatch, FC, SetStateAction, useEffect } from 'react';
import Picker, { PickerValue } from '@/lib/react-mobile-picker';
import { PickerValueObj } from '@/lib/react-mobile-picker/components/Picker.tsx';
import classNames from 'classnames';
import { UniversalButton } from '@/components/Buttons/UniversalButton/UniversalButton.tsx';
import moment from 'moment';

const generateTimeOptions = (start: string, end: string): PickerValueObj[] => {
    if (!start || !end) return [];
    const options: PickerValueObj[] = [];
    let current = moment(start, 'HH:mm');
    const endMoment = moment(end, 'HH:mm');
    // если end <= start, значит диапазон через полночь
    while (
        current.isBefore(endMoment) ||
        (endMoment.isBefore(moment(start, 'HH:mm')) && current.format('HH:mm') !== endMoment.format('HH:mm'))
    ) {
        options.push({
            title: current.format('H:mm'),
            value: current.format('HH:mm')
        });
        current.add(1, 'hour');
        if (options.length > 48) break;
    }
    if (current.format('HH:mm') === endMoment.format('HH:mm')) {
        options.push({
            title: endMoment.format('H:mm'),
            value: endMoment.format('HH:mm')
        });
    }
    return options;
};

const getFullDayOptions = (): PickerValueObj[] => {
    const options: PickerValueObj[] = [];
    let current = moment('08:00', 'HH:mm');
    for (let i = 0; i < 24; i++) {
        options.push({
            title: current.format('H:mm'),
            value: current.format('HH:mm')
        });
        current.add(1, 'hour');
    }
    return options;
};

interface Props {
    isOpen: boolean;
    closePopup: () => void;
    time: PickerValue;
    setTimeOption: Dispatch<SetStateAction<PickerValueObj>>;
    minTime?: string;
    maxTime?: string;
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

export const TimeSelectorPopup: FC<Props> = (
    {
        isOpen,
        closePopup,
        time,
        setTimeOption,
        minTime,
        maxTime,
    },
) => {
    const timeOptions = (minTime && maxTime)
        ? generateTimeOptions(minTime, maxTime)
        : getFullDayOptions();

    useEffect(() => {
        if (isOpen && timeOptions.length && time.value === 'unset') {
            setTimeOption(timeOptions[0]);
        }
    }, [isOpen, timeOptions]);

    const onChange = (val: PickerValueObj) => {
        setTimeOption({
            title: `${val.value}`,
            value: val.value,
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
                                            selected ? css.item__selected : null,
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
            <UniversalButton
                width={'full'}
                title={'Сохранить'}
                theme={'red'}
                action={closePopup}
            />
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
