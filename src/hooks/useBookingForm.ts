import { useEffect, useMemo, useCallback, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAtom, useAtomValue, useSetAtom, WritableAtom } from 'jotai';
// API
import { APICreateBooking, APIGetAvailableDays, APIGetAvailableTimeSlots } from '@/api/restaurants.api.ts';
import { APIGetCertificates, APIPostCertificateClaim } from '@/api/certificates.api.ts';
// Atoms
import { authAtom, userAtom } from '@/atoms/userAtom.ts';
import { commAtom } from '@/atoms/bookingCommAtom.ts';
import { certificatesListAtom } from '@/atoms/certificatesListAtom.ts';
import {
    bookingFormAtom,
    updateBookingFormAtom,
    getInitialBookingFormState,
    IBookingFormState,
} from '@/atoms/bookingFormAtom.ts';
// Types
import { ITimeSlot } from '@/pages/BookingPage/BookingPage.types.ts';
import { ICertificate } from '@/types/certificates.types';
import { PickerValue } from '@/lib/react-mobile-picker/components/Picker.tsx';
import { IConfirmationType } from '@/components/ConfirmationSelect/ConfirmationSelect.types.ts';
// Hooks
import useToastState from '@/hooks/useToastState.ts';
// Utils
import { formatDate, getTimeShort } from '@/utils.ts';

/**
 * Регулярное выражение для валидации телефона
 */
const PHONE_REGEX = /^\+?([87])[- ]?(\d{3})[- ]?(\d{3})[- ]?(\d{2})[- ]?(\d{2})$/;

/**
 * Длительность отображения ошибки валидации (мс)
 */
const VALIDATION_ERROR_DURATION = 5000;

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
 * Состояние загрузки данных
 */
export interface ILoadingState {
    timeslots: boolean;
    dates: boolean;
    submit: boolean;
}

/**
 * Состояние ошибок
 */
export interface IErrorState {
    timeslots: boolean;
    popup: boolean;
    botError: boolean;
    popupCount: number;
}

/**
 * Интерфейс параметров для certificate claim
 */
interface ICertificateClaimParams {
    certificate?: {
        recipient_name: string;
    };
    certificateId?: string;
}

/**
 * Интерфейс предвыбранного ресторана
 */
interface IPreSelectedRestaurant {
    id: string;
    title: string;
    address?: string;
}

/**
 * Интерфейс начальных данных бронирования (из state)
 */
interface IInitialBookingData {
    bookedDate?: PickerValue;
    bookedTime?: ITimeSlot;
    guestCount?: number;
    childrenCount?: number;
}

/**
 * Опции хука useBookingForm
 */
export interface IUseBookingFormOptions {
    /** Параметры для сертификата */
    certificateParams?: ICertificateClaimParams;
    /** Предвыбранный ресторан (когда переход со страницы ресторана) */
    preSelectedRestaurant?: IPreSelectedRestaurant;
    /** Начальные данные бронирования из location.state */
    initialBookingData?: IInitialBookingData;
    /** Флаг, что пользователь пришёл по shared ссылке */
    isSharedRestaurant?: boolean;
}

/**
 * Комплексный хук для управления формой бронирования
 * Включает: state management, validation, API calls
 * 
 * @param options - Опции хука
 */
export const useBookingForm = (options: IUseBookingFormOptions = {}) => {
    const {
        certificateParams,
        preSelectedRestaurant,
        initialBookingData,
        isSharedRestaurant = false,
    } = options;
    const navigate = useNavigate();
    const { showToast } = useToastState();

    // Global atoms
    const auth = useAtomValue(authAtom);
    const user = useAtomValue(userAtom);
    const comms = useAtomValue(commAtom);
    const [certificates, setCertificates] = useAtom(
        certificatesListAtom as WritableAtom<ICertificate[], [ICertificate[]], void>
    );

    // Form state
    const [formState, setForm] = useAtom(bookingFormAtom);
    const updateForm = useSetAtom(updateBookingFormAtom);
    
    // Ensure form is always a valid object (defensive coding)
    const defaultForm = useMemo(() => getInitialBookingFormState(), []);
    const form = useMemo(() => {
        if (!formState) return defaultForm;
        return {
            ...defaultForm,
            ...formState,
            // Ensure nested objects are properly merged
            date: formState.date ?? defaultForm.date,
            restaurant: formState.restaurant ?? defaultForm.restaurant,
            confirmation: formState.confirmation ?? defaultForm.confirmation,
        };
    }, [formState, defaultForm]);
    
    // Derived state
    const canShowTimeSlots = form.guestCount > 0 && form.date?.value !== 'unset';

    // Data from API
    const [availableTimeslots, setAvailableTimeslots] = useState<ITimeSlot[]>([]);
    const [availableDates, setAvailableDates] = useState<PickerValue[]>([]);

    // Loading states
    const [loading, setLoading] = useState<ILoadingState>({
        timeslots: true,
        dates: false,
        submit: false,
    });

    // Error states
    const [errors, setErrors] = useState<IErrorState>({
        timeslots: false,
        popup: false,
        botError: false,
        popupCount: 0,
    });

    // Validation display state
    const [validationDisplay, setValidationDisplay] = useState<IValidationDisplay>({
        nameValid: true,
        phoneValid: true,
        dateValid: true,
        timeSlotValid: true,
        guestsValid: true,
    });

    // ============================================
    // Validation Logic
    // ============================================

    const validation = useMemo(() => ({
        name: !!form.userName?.trim().length,
        phone: PHONE_REGEX.test(form.userPhone?.trim() ?? ''),
        date: form.date?.value !== 'unset',
        timeSlot: !!form.selectedTimeSlot,
        guests: form.guestCount > 0,
    }), [form.userName, form.userPhone, form.date?.value, form.selectedTimeSlot, form.guestCount]);

    const isFormValid = useMemo(
        () => validation.name && validation.phone && validation.timeSlot && validation.guests,
        [validation]
    );

    const triggerValidation = useCallback((): boolean => {
        setValidationDisplay({
            nameValid: validation.name,
            phoneValid: validation.phone,
            dateValid: validation.date,
            timeSlotValid: validation.timeSlot,
            guestsValid: validation.guests,
        });

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

    // ============================================
    // Initialize Form with User Data & Pre-selected Restaurant
    // ============================================
    
    const isInitialized = useRef(false);
    const initialBookingDataApplied = useRef(false);
    const preSelectedRestaurantApplied = useRef(false);

    // Мемоизируем начальные данные бронирования, чтобы избежать лишних ререндеров
    const initialDateValue = initialBookingData?.bookedDate?.value;
    const initialTimeSlotStart = initialBookingData?.bookedTime?.start_datetime;

    useEffect(() => {
        if (!user) return;
        
        const initialState = getInitialBookingFormState(user);
        let shouldUpdate = false;
        
        // Если есть предвыбранный ресторан (применяем только один раз)
        if (!preSelectedRestaurantApplied.current && preSelectedRestaurant) {
            initialState.restaurant = {
                title: preSelectedRestaurant.title,
                value: preSelectedRestaurant.id,
                ...(preSelectedRestaurant.address && { address: preSelectedRestaurant.address }),
            };
            preSelectedRestaurantApplied.current = true;
            shouldUpdate = true;
        }
        
        // Если есть начальные данные бронирования (применяем только один раз)
        if (!initialBookingDataApplied.current && initialBookingData) {
            if (initialBookingData.bookedDate) {
                initialState.date = initialBookingData.bookedDate;
            }
            if (initialBookingData.bookedTime) {
                initialState.selectedTimeSlot = initialBookingData.bookedTime;
            }
            if (initialBookingData.guestCount !== undefined) {
                initialState.guestCount = initialBookingData.guestCount;
            }
            if (initialBookingData.childrenCount !== undefined) {
                initialState.childrenCount = initialBookingData.childrenCount;
            }
            initialBookingDataApplied.current = true;
            shouldUpdate = true;
        }
        
        // Первая инициализация или есть что обновить
        if (!isInitialized.current || shouldUpdate) {
            setForm(initialState);
            isInitialized.current = true;
        }
    }, [
        user, 
        setForm, 
        preSelectedRestaurant?.id, 
        preSelectedRestaurant?.title, 
        preSelectedRestaurant?.address,
        initialDateValue,
        initialTimeSlotStart,
        initialBookingData,
    ]);

    // ============================================
    // Load Available Dates
    // ============================================

    useEffect(() => {
        if (!auth?.access_token || !form.restaurant?.value || form.restaurant.value === 'unset') return;

        setLoading(prev => ({ ...prev, dates: true }));

        APIGetAvailableDays(auth.access_token, String(form.restaurant.value), 1)
            .then((res) => {
                setAvailableDates(
                    res.data.map((v: string) => ({
                        title: formatDate(v),
                        value: v,
                    }))
                );
            })
            .catch((err) => {
                console.error('Error fetching available days:', err);
            })
            .finally(() => {
                setLoading(prev => ({ ...prev, dates: false }));
            });
    }, [auth?.access_token, form.restaurant?.value, form.guestCount]);

    // ============================================
    // Load Available Time Slots
    // ============================================

    useEffect(() => {
        if (
            form.restaurant?.value === 'unset' ||
            !auth?.access_token ||
            form.date?.value === 'unset' ||
            !form.date?.value ||
            !form.guestCount
        ) {
            return;
        }

        setLoading(prev => ({ ...prev, timeslots: true }));
        setErrors(prev => ({ ...prev, timeslots: false }));

        APIGetAvailableTimeSlots(
            auth.access_token,
            String(form.restaurant.value),
            String(form.date.value),
            form.guestCount
        )
            .then((res) => setAvailableTimeslots(res.data))
            .catch((err) => {
                console.error('Error fetching timeslots:', err);
                setErrors(prev => ({ ...prev, timeslots: true }));
            })
            .finally(() => {
                setLoading(prev => ({ ...prev, timeslots: false }));
            });
    }, [auth?.access_token, form.date?.value, form.guestCount, form.restaurant?.value]);

    // ============================================
    // Certificate Claim (after onboarding)
    // ============================================

    useEffect(() => {
        if (
            auth?.access_token &&
            certificateParams?.certificate &&
            certificateParams?.certificateId &&
            certificates.length === 0
        ) {
            APIPostCertificateClaim(
                String(auth.access_token),
                Number(user?.id),
                certificateParams.certificateId,
                certificateParams.certificate.recipient_name
            )
                .then(() => {
                    APIGetCertificates(auth.access_token, Number(user?.id))
                        .then((response) => setCertificates(response.data))
                        .catch((err) => console.error('Error fetching certificates:', err));
                })
                .catch((err) => {
                    console.error('Certificate claim error:', err);
                    showToast('Произошла ошибка. Не удалось получить сертификат.');
                });
        }
    }, [
        certificateParams?.certificate,
        certificateParams?.certificateId,
        auth?.access_token,
        certificates.length,
        user?.id,
        showToast,
        setCertificates,
    ]);

    // ============================================
    // Form Update Handlers
    // ============================================

    const handleRestaurantSelect = useCallback((restaurant: PickerValue) => {
        updateForm({ restaurant, selectedTimeSlot: null });
    }, [updateForm]);

    const handleDateSelect = useCallback((date: PickerValue) => {
        updateForm({ date, selectedTimeSlot: null });
    }, [updateForm]);

    const handleGuestCountChange = useCallback((value: number | ((prev: number) => number)) => {
        if (typeof value === 'function') {
            updateForm({ guestCount: value(form.guestCount ?? 0) });
        } else {
            updateForm({ guestCount: value });
        }
    }, [updateForm, form.guestCount]);

    const handleChildrenCountChange = useCallback((value: number | ((prev: number) => number)) => {
        if (typeof value === 'function') {
            updateForm({ childrenCount: value(form.childrenCount ?? 0) });
        } else {
            updateForm({ childrenCount: value });
        }
    }, [updateForm, form.childrenCount]);

    const handleTimeSlotSelect = useCallback((selectedTimeSlot: ITimeSlot | null) => {
        updateForm({ selectedTimeSlot });
    }, [updateForm]);

    const handleConfirmationChange = useCallback((value: IConfirmationType | ((prev: IConfirmationType) => IConfirmationType)) => {
        const confirmation = typeof value === 'function' ? value(form.confirmation) : value;
        updateForm({ confirmation });
    }, [updateForm, form.confirmation]);

    const handleFieldUpdate = useCallback((update: Partial<IBookingFormState>) => {
        updateForm(update);
    }, [updateForm]);

    // ============================================
    // Error Popup Control
    // ============================================

    const setErrorPopup = useCallback((popup: boolean) => {
        setErrors(prev => ({ ...prev, popup }));
    }, []);

    // ============================================
    // Create Booking
    // ============================================

    const createBooking = useCallback(() => {
        // Redirect to onboarding if not completed
        if (!user?.complete_onboarding) {
            navigate('/onboarding/3', {
                state: {
                    id: Number(form.restaurant?.value ?? 0),
                    date: form.date,
                    time: form.selectedTimeSlot,
                    sharedRestaurant: isSharedRestaurant || !!preSelectedRestaurant,
                },
            });
            return;
        }

        // Validate form
        if (!triggerValidation() || !auth?.access_token || !form.selectedTimeSlot) {
            return;
        }

        setLoading(prev => ({ ...prev, submit: true }));

        const totalGuests = form.guestCount + form.childrenCount;

        APICreateBooking(
            auth.access_token,
            String(form.restaurant?.value ?? ''),
            String(form.date?.value ?? ''),
            getTimeShort(form.selectedTimeSlot.start_datetime),
            form.guestCount,
            form.childrenCount,
            form.userName ?? '',
            form.userPhone ?? '',
            form.userEmail ?? '',
            form.commentary ?? '',
            comms,
            form.confirmation?.text ?? '',
            totalGuests < 8 ? false : form.preOrder,
            null,
            form.certificateId
        )
            .then((res) => {
                if (res.data?.error) {
                    setErrors(prev => ({ ...prev, popup: true, botError: true }));
                    return;
                }
                navigate(`/myBookings/${res.data.id}`);
            })
            .catch((err) => {
                console.error('Booking creation error:', err);
                setErrors(prev => ({
                    ...prev,
                    popup: true,
                    popupCount: prev.popupCount + 1,
                }));
            })
            .finally(() => {
                setLoading(prev => ({ ...prev, submit: false }));
            });
    }, [
        user?.complete_onboarding,
        navigate,
        form,
        triggerValidation,
        auth?.access_token,
        comms,
        isSharedRestaurant,
        preSelectedRestaurant,
    ]);

    return {
        // Form state
        form,
        
        // Validation
        isFormValid,
        validationDisplay,
        triggerValidation,
        
        // Data from API
        availableDates,
        availableTimeslots,
        canShowTimeSlots,
        
        // Loading & Error states
        loading,
        errors,
        setErrorPopup,
        
        // Form handlers
        handlers: {
            selectRestaurant: handleRestaurantSelect,
            selectDate: handleDateSelect,
            setGuestCount: handleGuestCountChange,
            setChildrenCount: handleChildrenCountChange,
            selectTimeSlot: handleTimeSlotSelect,
            setConfirmation: handleConfirmationChange,
            updateField: handleFieldUpdate,
        },
        
        // Actions
        createBooking,
        
        // Info
        preSelectedRestaurant,
        isSharedRestaurant,
    };
};
