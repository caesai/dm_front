import { useMemo, useCallback } from 'react';
import { ITimeSlot } from '@/pages/BookingPage/BookingPage.types.ts';
import { PickerValueObj } from '@/lib/react-mobile-picker/components/Picker.tsx';

// Define the phone regex once outside the hook
// Matches formats like: +7(XXX)XXX-XX-XX, 8XXX-XXX-XX-XX, +7 9XX XXX XX XX, 88005553535 etc.
const PHONE_REGEX = /^([87])[- ]?(\d{3})[- ]?(\d{3})[- ]?(\d{2})[- ]?(\d{2})$/;


interface FormValues {
    userName: string;
    userPhone: string;
    currentSelectedTime: ITimeSlot | null;
    guestCount: number;
    date: PickerValueObj;
}

interface FormSetters {
    setNameValidated: (val: boolean) => void;
    setPhoneValidated: (val: boolean) => void;
    setDateValidated: (val: boolean) => void;
    setGuestsValidated: (val: boolean) => void;
    setSelectedTimeValidated: (val: boolean) => void;
}

/**
 * A custom hook to handle form validation logic and temporary error displays.
 * @param {object} values - An object containing all the raw form field values.
 * @param {object} setters - An object containing all the state setters for displaying errors temporarily.
 * @returns {object} Contains individual validation booleans, isFormValid, and the validateForm function.
 */
export const useBookingFormValidation = (values: FormValues, setters: FormSetters) => {
    const { userName, userPhone, currentSelectedTime, guestCount, date } = values;
    const {
        setNameValidated,
        setPhoneValidated,
        setDateValidated,
        setSelectedTimeValidated,
        setGuestsValidated
    } = setters;
    // --- 1. Memoized Individual Validations ---
    const nameValidate = useMemo(() => !!userName?.trim().length, [userName]);
    const phoneValidate = useMemo(() => PHONE_REGEX.test(userPhone.trim()), [userPhone]);
    const timeslotValidate = useMemo(() => !!currentSelectedTime, [currentSelectedTime]);
    const dateValidate = useMemo(() => date.value !== 'unset', [date]);
    const guestsValidate = useMemo(() => !!guestCount, [guestCount]);

    // --- 2. Overall Form Validity ---
    const isFormValid = useMemo(() => {
        // We use the derived boolean validators here
        return nameValidate && phoneValidate && timeslotValidate && guestsValidate;
    }, [nameValidate, phoneValidate, timeslotValidate, guestsValidate]);

    // --- 3. The Validation/Error-Triggering Function ---
    const triggerValidationDisplay = useCallback(() => {
        // Define fields to iterate over
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
                setTimeout(() => setValidated(true), 5000);
            }
        });

        return isFormValid;
    }, [isFormValid, nameValidate, phoneValidate, timeslotValidate, guestsValidate,
        setNameValidated, setPhoneValidated, setDateValidated, setGuestsValidated, setSelectedTimeValidated]);

    return {
        nameValidate,
        phoneValidate,
        timeslotValidate,
        guestsValidate,
        isFormValid,
        validateForm: triggerValidationDisplay, // Renaming it back to validateForm for familiarity
    };
};
