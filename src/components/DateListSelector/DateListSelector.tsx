import React, { useCallback, useState, useEffect } from 'react';
// Components
import { ContentBlock } from '@/components/ContentBlock/ContentBlock.tsx';
import { DropDownSelect } from '@/components/DropDownSelect/DropDownSelect.tsx';
import { CalendarIcon } from '@/components/Icons/CalendarIcon.tsx';
import { WheelPicker } from '@/components/WheelPicker/WheelPicker.tsx';
import { PickerValue } from '@/lib/react-mobile-picker/components/Picker.tsx';
import { DepositInfoModal } from '@/components/DepositInfoModal/DepositInfoModal.tsx';
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
    const [pendingDate, setPendingDate] = useState<PickerValue | null>(null);
    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);

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

    // Обработка скролла в пикере (сохраняем как pending)
    const handleDateScroll = useCallback(
        (date: PickerValue) => {
            if (isDisabled) return;
            setPendingDate(date);
        },
        [isDisabled]
    );

    // Подтверждение выбора даты
    const confirmDateSelection = useCallback(
        (date: PickerValue) => {
            const formattedDate = {
                ...date,
                title: formatDate(date.value.toString()),
            };
            setSelectedDate(formattedDate);
            onSelect?.(date);
            setPendingDate(null);
        },
        [onSelect]
    );

    // Обработка нажатия "Сохранить" в пикере
    const handleDateSave = useCallback(
        (date: PickerValue) => {
            if (isDisabled) return;

            // Находим полный объект из списка дат, чтобы получить все атрибуты
            // (WheelPicker может передать объект без attributes)
            const fullDate = datesList?.find((d) => d.value === date.value) ?? date;

            // Проверяем, требуется ли депозит для этой даты
            if (fullDate.attributes?.includes('requires_deposit')) {
                setPendingDate(fullDate);
                setIsDepositModalOpen(true);
            } else {
                confirmDateSelection(fullDate);
            }
        },
        [isDisabled, confirmDateSelection, datesList]
    );

    // Подтверждение депозита в модальном окне
    const handleDepositConfirm = useCallback(() => {
        if (pendingDate) {
            confirmDateSelection(pendingDate);
        }
        setIsDepositModalOpen(false);
    }, [pendingDate, confirmDateSelection]);

    // Закрытие модального окна без подтверждения
    const handleDepositCancel = useCallback(() => {
        setPendingDate(null);
        setIsDepositModalOpen(false);
    }, []);

    /**
     * Определяет заголовок для отображения:
     * - Если есть выбранная дата → отформатированная дата
     * - Если список пуст и не disabled → сообщение о пустом списке
     * - Иначе → заголовок по умолчанию
     */
    const getDisplayTitle = (): string => {
        if (selectedDate && selectedDate.value && selectedDate.value !== 'unset') {
            return formatDateShort(String(selectedDate.value));
        }
        if (!disabled && isListEmpty) {
            return emptyMessage;
        }
        return defaultTitle;
    };

    return (
        <ContentBlock>
            <DepositInfoModal
                isOpen={isDepositModalOpen}
                depositPerPerson={pendingDate?.deposit_per_person ?? 0}
                onConfirm={handleDepositConfirm}
                onCancel={handleDepositCancel}
            />
            <WheelPicker
                value={pendingDate ?? selectedDate}
                onChange={handleDateScroll}
                onSave={handleDateSave}
                items={datesList ?? []}
                isOpen={isPickerOpen}
                setOpen={setIsPickerOpen}
                title={defaultTitle}
                textAlign="center"
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
