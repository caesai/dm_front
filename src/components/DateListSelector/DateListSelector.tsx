import React, { useCallback, useState, useEffect } from 'react';
// Components
import { ContentBlock } from '@/components/ContentBlock/ContentBlock.tsx';
import { DropDownSelect } from '@/components/DropDownSelect/DropDownSelect.tsx';
import { CalendarIcon } from '@/components/Icons/CalendarIcon.tsx';
import { WheelPicker } from '@/components/WheelPicker/WheelPicker.tsx';
import { PickerValue } from '@/lib/react-mobile-picker/components/Picker.tsx';
// Utils
import { formatDate, formatDateShort } from '@/utils.ts';

interface IDateListSelectorProps {
    datesList?: PickerValue[];
    /** Функция выбора даты */
    onSelect?: (value: PickerValue) => void;
    /** Начальное/текущее выбранное значение даты */
    value?: PickerValue | null;
    /** Флаг disabled */
    disabled?: boolean;
    /** Заголовок по умолчанию */
    defaultTitle?: string;
}
/**
 * Компонент выбора даты из списка
 * @param {PickerValue[]} datesList - Список дат
 * @param {function} onSelect - Функция выбора даты
 * @param {PickerValue | null} value - Текущее выбранное значение
 * @returns {JSX.Element} - Компонент выбора даты из списка
 */
export const DateListSelector: React.FC<IDateListSelectorProps> = ({
    datesList,
    onSelect,
    value,
    disabled = false,
    defaultTitle = 'Выберите дату',
}: IDateListSelectorProps): JSX.Element => {
    const [selectedDate, setSelectedDate] = useState<PickerValue | null>(value ?? null);
    const [isPickerOpen, setIsPickerOpen] = useState(false);
    
    // Синхронизация с внешним value
    useEffect(() => {
        if (value && value.value !== 'unset') {
            setSelectedDate(value);
        }
    }, [value?.value]);

    // Открытие/закрытие пикера
    const togglePicker = useCallback(() => {
        setIsPickerOpen(!isPickerOpen);
    }, [setIsPickerOpen]);

    // Выбор даты из списка
    const handleDateChange = useCallback(
        (value: PickerValue) => {
            if (disabled) return;
            setSelectedDate({
                title: formatDate(value.value.toString()),
                value: value.value,
            });
            onSelect?.(value);
        },
        [setSelectedDate, onSelect, disabled]
    );

    return (
        <ContentBlock>
            <WheelPicker
                value={selectedDate}
                onChange={handleDateChange}
                items={datesList ?? []}
                isOpen={isPickerOpen}
                setOpen={setIsPickerOpen}
                title={defaultTitle}
            />
            <DropDownSelect
                title={selectedDate && selectedDate.value !== 'unset' 
                    ? formatDateShort(selectedDate.value.toString()) 
                    : defaultTitle
                }
                // isValid={true} // TODO: Добавить валидацию
                icon={<CalendarIcon size={24} />}
                onClick={togglePicker}
                disabled={disabled}
            />
        </ContentBlock>
    );
};
