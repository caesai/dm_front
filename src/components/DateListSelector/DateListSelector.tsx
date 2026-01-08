import React, { useCallback, useState } from 'react';
// Components
import { ContentBlock } from '@/components/ContentBlock/ContentBlock.tsx';
import { DropDownSelect } from '@/components/DropDownSelect/DropDownSelect.tsx';
import { CalendarIcon } from '@/components/Icons/CalendarIcon.tsx';
import { WheelPicker } from '@/components/WheelPicker/WheelPicker.tsx';
import { PickerValue } from '@/lib/react-mobile-picker/components/Picker.tsx';
// Utils
import { formatDate, formatDateShort } from '@/utils.ts';

interface IDateListSelectorProps {
    datesList: PickerValue[];
    onSelect: (value: PickerValue) => void;
}
/**
 * Компонент выбора даты из списка
 * @param {PickerValue[]} datesList - Список дат
 * @param {function} onSelect - Функция выбора даты
 * @returns {JSX.Element} - Компонент выбора даты из списка
 */
export const DateListSelector: React.FC<IDateListSelectorProps> = ({
    datesList,
    onSelect,
}: IDateListSelectorProps): JSX.Element => {
    const [selectedDate, setSelectedDate] = useState<PickerValue | null>(null);
    const [isPickerOpen, setIsPickerOpen] = useState(false);
    // Открытие/закрытие пикера
    const togglePicker = useCallback(() => {
        setIsPickerOpen(!isPickerOpen);
    }, [setIsPickerOpen]);

    // Выбор даты из списка
    const handleDateChange = useCallback(
        (value: PickerValue) => {
            setSelectedDate({
                title: formatDate(value.value.toString()),
                value: value.value,
            });
            onSelect(value);
        },
        [setSelectedDate, onSelect]
    );

    return (
        <ContentBlock>
            <WheelPicker
                value={selectedDate}
                onChange={handleDateChange}
                items={datesList}
                isOpen={isPickerOpen}
                setOpen={setIsPickerOpen}
                title={'Выберите дату'}
            />
            <DropDownSelect
                title={selectedDate ? formatDateShort(selectedDate.value.toString()) : 'Дата'}
                // isValid={true} // TODO: Добавить валидацию
                icon={<CalendarIcon size={24} />}
                onClick={togglePicker}
            />
        </ContentBlock>
    );
};
