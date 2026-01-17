import React, { useCallback, useState, useEffect } from 'react';
// Components
import { ContentBlock } from '@/components/ContentBlock/ContentBlock.tsx';
import { DropDownSelect } from '@/components/DropDownSelect/DropDownSelect.tsx';
import { CalendarIcon } from '@/components/Icons/CalendarIcon.tsx';
import { WheelPicker } from '@/components/WheelPicker/WheelPicker.tsx';
import { PickerValue } from '@/lib/react-mobile-picker/components/Picker.tsx';
// Utils
import { formatDate, formatDateShort } from '@/utils.ts';

/**
 * Пропсы компонента DateListSelector
 * @interface IDateListSelectorProps
 */
interface IDateListSelectorProps {
    /** Список дат */
    datesList?: PickerValue[];
    /** Функция выбора даты */
    onSelect?: (value: PickerValue) => void;
    /** Начальное/текущее выбранное значение даты */
    value?: PickerValue | null;
    /** Флаг disabled */
    disabled?: boolean;
    /** Заголовок по умолчанию */
    defaultTitle?: string;
    /** Сообщение при пустом списке дат */
    emptyMessage?: string;
}
/**
 * Компонент выбора даты из списка
 * @param {IDateListSelectorProps} props - свойства компонента
 * @returns {JSX.Element} - Компонент выбора даты из списка
 */
export const DateListSelector: React.FC<IDateListSelectorProps> = ({
    datesList,
    onSelect,
    value,
    disabled = false,
    defaultTitle = 'Выберите дату',
    emptyMessage = 'Нет доступных дат',
}: IDateListSelectorProps): JSX.Element => {
    const [selectedDate, setSelectedDate] = useState<PickerValue | null>(value ?? null);
    const [isPickerOpen, setIsPickerOpen] = useState(false);
    
    /** Проверка, пустой ли список дат */
    const isListEmpty = !datesList || datesList.length === 0;
    
    /** Селектор заблокирован, если disabled или список пуст */
    const isDisabled = disabled || isListEmpty;
    
    // Синхронизация с внешним value
    useEffect(() => {
        if (value && value.value !== 'unset') {
            setSelectedDate(value);
        }
    }, [value?.value]);

    // Открытие/закрытие пикера
    const togglePicker = useCallback(() => {
        if (isDisabled) return;
        setIsPickerOpen(!isPickerOpen);
    }, [setIsPickerOpen, isDisabled, isPickerOpen]);

    // Выбор даты из списка
    const handleDateChange = useCallback(
        (value: PickerValue) => {
            if (isDisabled) return;
            setSelectedDate({
                title: formatDate(value.value.toString()),
                value: value.value,
            });
            onSelect?.(value);
        },
        [setSelectedDate, onSelect, isDisabled]
    );

    /**
     * Определяет заголовок для отображения:
     * - Если есть выбранная дата → отформатированная дата
     * - Если список пуст и не disabled → сообщение о пустом списке
     * - Иначе → заголовок по умолчанию
     */
    const getDisplayTitle = (): string => {
        if (selectedDate && selectedDate.value !== 'unset') {
            return formatDateShort(selectedDate.value.toString());
        }
        if (!disabled && isListEmpty) {
            return emptyMessage;
        }
        return defaultTitle;
    };

    return (
        <ContentBlock>
            <WheelPicker
                value={selectedDate}
                onChange={handleDateChange}
                items={datesList ?? []}
                isOpen={isPickerOpen}
                setOpen={setIsPickerOpen}
                title={defaultTitle}
                textAlign='center'
            />
            <DropDownSelect
                title={getDisplayTitle()}
                isValid={true}
                icon={<CalendarIcon size={24} />}
                onClick={togglePicker}
                disabled={isDisabled}
            />
        </ContentBlock>
    );
};
