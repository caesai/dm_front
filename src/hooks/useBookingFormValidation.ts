import { useMemo, useCallback, useState } from 'react';
import { useAtomValue } from 'jotai';
import { bookingFormAtom } from '@/atoms/bookingFormAtom.ts';
import { ITimeSlot } from '@/pages/BookingPage/BookingPage.types.ts';
import { PickerValueData } from '@/lib/react-mobile-picker/components/Picker.tsx';

/**
 * Регулярное выражение для валидации телефона
 * Форматы: +7(XXX)XXX-XX-XX, 8XXX-XXX-XX-XX, +7 9XX XXX XX XX, 88005553535 и т.д.
 */
const PHONE_REGEX = /^\+?([87])[- ]?(\d{3})[- ]?(\d{3})[- ]?(\d{2})[- ]?(\d{2})$/;

/**
 * Интерфейс результатов валидации полей
 */
export interface IValidationState {
    name: boolean;
    phone: boolean;
    date: boolean;
    timeSlot: boolean;
    guests: boolean;
}

/**
 * Интерфейс для отображения ошибок валидации в UI
 */
export interface IValidationDisplay {
    nameValid: boolean;
    phoneValid: boolean;
    dateValid: boolean;
    timeSlotValid: boolean;
    guestsValid: boolean;
}

/**
 * Функции валидации отдельных полей
 */
const validators = {
    name: (value: string): boolean => !!value?.trim().length,
    phone: (value: string): boolean => PHONE_REGEX.test(value.trim()),
    date: (value: unknown): boolean => {
        if (typeof value === 'string' || typeof value === 'number') {
            return value !== 'unset';
        }
        if (typeof value === 'object' && value !== null && 'value' in value) {
            return (value as { value: string }).value !== 'unset';
        }
        return false;
    },
    timeSlot: (value: unknown): boolean => !!value,
    guests: (value: number): boolean => value > 0,
};

/**
 * Валидация состояния формы
 */
const validateFormData = (
    userName: string,
    userPhone: string,
    date: PickerValueData,
    selectedTimeSlot: ITimeSlot | null,
    guestCount: number
): IValidationState => ({
    name: validators.name(userName),
    phone: validators.phone(userPhone),
    date: validators.date(date),
    timeSlot: validators.timeSlot(selectedTimeSlot),
    guests: validators.guests(guestCount),
});

/**
 * Проверка, что все обязательные поля формы валидны
 */
const isAllValid = (validation: IValidationState): boolean =>
    validation.name && validation.phone && validation.timeSlot && validation.guests;

/**
 * Длительность отображения ошибки валидации (мс)
 */
const VALIDATION_ERROR_DURATION = 5000;

// ============================================
// Новый хук (работает с атомом)
// ============================================

/**
 * Хук для валидации формы бронирования (работает с bookingFormAtom)
 * 
 * @returns Объект с состоянием валидации и функцией триггера проверки
 * 
 * @example
 * ```tsx
 * const { isFormValid, validationDisplay, triggerValidation } = useBookingFormValidation();
 * 
 * const handleSubmit = () => {
 *     if (triggerValidation()) {
 *         // Форма валидна, отправляем
 *     }
 * };
 * ```
 */
export const useBookingFormValidation = () => {
    const form = useAtomValue(bookingFormAtom);
    
    // Состояние для отображения ошибок в UI (по умолчанию все валидны)
    const [validationDisplay, setValidationDisplay] = useState<IValidationDisplay>({
        nameValid: true,
        phoneValid: true,
        dateValid: true,
        timeSlotValid: true,
        guestsValid: true,
    });

    // Мемоизированная валидация текущего состояния формы
    const validation = useMemo(
        () => validateFormData(
            form.userName,
            form.userPhone,
            form.date.value,
            form.selectedTimeSlot,
            form.guestCount
        ),
        [form.userName, form.userPhone, form.date.value, form.selectedTimeSlot, form.guestCount]
    );

    // Проверка общей валидности формы
    const isFormValid = useMemo(() => isAllValid(validation), [validation]);

    /**
     * Триггер отображения ошибок валидации
     */
    const triggerValidation = useCallback((): boolean => {
        const newDisplay: IValidationDisplay = {
            nameValid: validation.name,
            phoneValid: validation.phone,
            dateValid: validation.date,
            timeSlotValid: validation.timeSlot,
            guestsValid: validation.guests,
        };

        setValidationDisplay(newDisplay);

        if (!isFormValid) {
            setTimeout(() => {
                setValidationDisplay({
                    nameValid: true,
                    phoneValid: true,
                    dateValid: true,
                    timeSlotValid: true,
                    guestsValid: true,
                });
            }, VALIDATION_ERROR_DURATION);
        }

        return isFormValid;
    }, [validation, isFormValid]);

    return {
        validation,
        validationDisplay,
        isFormValid,
        triggerValidation,
    };
};

// ============================================
// Legacy хук (обратная совместимость)
// ============================================

interface LegacyFormValues {
    userName: string;
    userPhone: string;
    currentSelectedTime: ITimeSlot | null;
    guestCount: number;
    date: PickerValueData;
}

interface LegacyFormSetters {
    setNameValidated: (val: boolean) => void;
    setPhoneValidated: (val: boolean) => void;
    setDateValidated: (val: boolean) => void;
    setGuestsValidated: (val: boolean) => void;
    setSelectedTimeValidated: (val: boolean) => void;
}

/**
 * Legacy хук для обратной совместимости со старыми страницами бронирования
 * 
 * @deprecated Используйте useBookingFormValidation() без параметров для новых страниц
 */
export const useLegacyBookingFormValidation = (
    values: LegacyFormValues,
    setters: LegacyFormSetters
) => {
    const { userName, userPhone, currentSelectedTime, guestCount, date } = values;
    const {
        setNameValidated,
        setPhoneValidated,
        setDateValidated,
        setSelectedTimeValidated,
        setGuestsValidated
    } = setters;

    // Мемоизированная валидация
    const nameValidate = useMemo(() => validators.name(userName), [userName]);
    const phoneValidate = useMemo(() => PHONE_REGEX.test(userPhone.trim()), [userPhone]);
    const timeslotValidate = useMemo(() => !!currentSelectedTime, [currentSelectedTime]);
    const dateValidate = useMemo(() => validators.date(date), [date]);
    const guestsValidate = useMemo(() => guestCount > 0, [guestCount]);

    const isFormValid = useMemo(
        () => nameValidate && phoneValidate && timeslotValidate && guestsValidate,
        [nameValidate, phoneValidate, timeslotValidate, guestsValidate]
    );

    const triggerValidationDisplay = useCallback(() => {
        const fields = [
            { isValid: nameValidate, setValidated: setNameValidated },
            { isValid: phoneValidate, setValidated: setPhoneValidated },
            { isValid: timeslotValidate, setValidated: setSelectedTimeValidated },
            { isValid: dateValidate, setValidated: setDateValidated },
            { isValid: guestsValidate, setValidated: setGuestsValidated },
        ];

        fields.forEach(({ isValid, setValidated }) => {
            if (!isValid) {
                setValidated(false);
                setTimeout(() => setValidated(true), VALIDATION_ERROR_DURATION);
            }
        });

        return isFormValid;
    }, [
        isFormValid, nameValidate, phoneValidate, timeslotValidate, guestsValidate, dateValidate,
        setNameValidated, setPhoneValidated, setDateValidated, setGuestsValidated, setSelectedTimeValidated
    ]);

    return {
        nameValidate,
        phoneValidate,
        timeslotValidate,
        guestsValidate,
        isFormValid,
        validateForm: triggerValidationDisplay,
    };
};
