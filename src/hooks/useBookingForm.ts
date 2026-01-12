/**
 * @fileoverview Комплексный хук для управления формой бронирования столиков в ресторане.
 * 
 * Хук инкапсулирует всю логику формы бронирования:
 * - Управление состоянием формы через Jotai atoms
 * - Валидация полей формы
 * - API-запросы для загрузки доступных дат и временных слотов
 * - Обработка сертификатов
 * - Создание бронирования
 * 
 * @module hooks/useBookingForm
 * 
 * @example
 * // Пример 1: Общая страница бронирования (BookingPage)
 * // Пользователь сам выбирает ресторан из списка
 * const { form, handlers, createBooking } = useBookingForm({
 *     certificateParams: {
 *         certificate: state?.certificate,
 *         certificateId: state?.certificateId,
 *     },
 * });
 * 
 * @example
 * // Пример 2: Бронирование с предвыбранным рестораном (RestaurantBookingPage)
 * // Пользователь переходит со страницы ресторана
 * const { form, handlers, createBooking } = useBookingForm({
 *     preSelectedRestaurant: {
 *         id: String(currentRestaurant.id),
 *         title: currentRestaurant.title,
 *         address: currentRestaurant.address,
 *     },
 *     initialBookingData: {
 *         bookedDate: state.bookedDate,
 *         bookedTime: state.bookedTime,
 *         guestCount: 1,
 *         childrenCount: 0,
 *     },
 *     isSharedRestaurant: state?.sharedRestaurant,
 * });
 * 
 * @example
 * // Пример 3: Бронирование на мероприятие (EventBookingPage)
 * // Ресторан и дата берутся из данных мероприятия
 * const { form, handlers, createBooking } = useBookingForm({
 *     eventData: {
 *         id: selectedEvent.id,
 *         name: selectedEvent.name,
 *         dateStart: selectedEvent.date_start,
 *         dateEnd: selectedEvent.date_end,
 *         restaurantId: String(selectedEvent.restaurant.id),
 *         restaurantTitle: selectedEvent.restaurant.title,
 *         restaurantAddress: selectedEvent.restaurant.address,
 *     },
 * });
 */

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

// ============================================
// Константы
// ============================================

/**
 * Регулярное выражение для валидации российского телефона.
 * Поддерживает форматы: +7XXXXXXXXXX, 8XXXXXXXXXX, +7 XXX XXX XX XX и т.д.
 * @constant
 */
const PHONE_REGEX = /^\+?([87])[- ]?(\d{3})[- ]?(\d{3})[- ]?(\d{2})[- ]?(\d{2})$/;

/**
 * Длительность отображения ошибки валидации в миллисекундах.
 * После этого времени ошибки сбрасываются.
 * @constant
 */
const VALIDATION_ERROR_DURATION = 5000;

// ============================================
// Интерфейсы
// ============================================

/**
 * Интерфейс для отображения ошибок валидации в UI.
 * Все поля имеют значение `true` когда поле валидно, `false` когда есть ошибка.
 * @interface
 */
export interface IValidationDisplay {
    /** Имя пользователя заполнено */
    nameValid: boolean;
    /** Телефон соответствует формату */
    phoneValid: boolean;
    /** Дата бронирования выбрана */
    dateValid: boolean;
    /** Временной слот выбран */
    timeSlotValid: boolean;
    /** Количество гостей больше 0 */
    guestsValid: boolean;
}

/**
 * Состояние загрузки различных данных.
 * @interface
 */
export interface ILoadingState {
    /** Загрузка доступных временных слотов */
    timeslots: boolean;
    /** Загрузка доступных дат */
    dates: boolean;
    /** Отправка формы бронирования */
    submit: boolean;
}

/**
 * Состояние ошибок формы и API.
 * @interface
 */
export interface IErrorState {
    /** Ошибка загрузки временных слотов */
    timeslots: boolean;
    /** Показывать popup с ошибкой */
    popup: boolean;
    /** Ошибка от бота (специфичная ошибка бэкенда) */
    botError: boolean;
    /** Счётчик попыток для отображения разных сообщений об ошибках */
    popupCount: number;
}

/**
 * Параметры для активации подарочного сертификата.
 * Используется при переходе на страницу бронирования со страницы сертификата.
 * @interface
 */
interface ICertificateClaimParams {
    /** Данные сертификата с именем получателя */
    certificate?: {
        recipient_name: string;
    };
    /** ID сертификата для активации */
    certificateId?: string;
}

/**
 * Данные предвыбранного ресторана.
 * Используется в {@link RestaurantBookingPage} когда пользователь переходит
 * со страницы конкретного ресторана.
 * @interface
 */
interface IPreSelectedRestaurant {
    /** ID ресторана */
    id: string;
    /** Название ресторана */
    title: string;
    /** Адрес ресторана (опционально) */
    address?: string;
}

/**
 * Начальные данные бронирования из navigation state.
 * Позволяет предзаполнить форму данными, переданными с предыдущей страницы.
 * @interface
 */
interface IInitialBookingData {
    /** Предвыбранная дата бронирования */
    bookedDate?: PickerValue;
    /** Предвыбранный временной слот */
    bookedTime?: ITimeSlot;
    /** Начальное количество гостей */
    guestCount?: number;
    /** Начальное количество детей */
    childrenCount?: number;
}

/**
 * Данные мероприятия для бронирования на event.
 * Используется в {@link EventBookingPage} для автоматической установки
 * ресторана и даты из данных мероприятия.
 * @interface
 */
interface IEventData {
    /** ID мероприятия - передаётся в API для связи бронирования с событием */
    id: number;
    /** Название мероприятия (для отображения) */
    name: string;
    /** Дата и время начала мероприятия (ISO string) */
    dateStart: string;
    /** Дата и время окончания мероприятия (ISO string, опционально) */
    dateEnd?: string;
    /** ID ресторана, в котором проходит мероприятие */
    restaurantId: string;
    /** Название ресторана (для отображения) */
    restaurantTitle?: string;
    /** Адрес ресторана (для отображения) */
    restaurantAddress?: string;
}

/**
 * Опции хука useBookingForm.
 * Позволяют настроить поведение хука для разных сценариев использования.
 * 
 * @interface
 * @see {@link BookingPage} - общая страница бронирования (без опций или с certificateParams)
 * @see {@link RestaurantBookingPage} - бронирование с preSelectedRestaurant
 * @see {@link EventBookingPage} - бронирование с eventData
 */
export interface IUseBookingFormOptions {
    /** 
     * Параметры для активации сертификата.
     * Используется когда пользователь переходит на бронирование со страницы сертификата.
     */
    certificateParams?: ICertificateClaimParams;
    
    /** 
     * Предвыбранный ресторан.
     * Устанавливается автоматически при переходе со страницы ресторана.
     * Ресторан нельзя будет изменить в форме.
     */
    preSelectedRestaurant?: IPreSelectedRestaurant;
    
    /** 
     * Начальные данные бронирования из location.state.
     * Позволяет предзаполнить дату, время и количество гостей.
     */
    initialBookingData?: IInitialBookingData;
    
    /** 
     * Флаг, что пользователь пришёл по shared ссылке.
     * Влияет на навигацию - при нажатии "Назад" перейдёт на главную.
     */
    isSharedRestaurant?: boolean;
    
    /** 
     * Данные мероприятия для бронирования на event.
     * При наличии автоматически устанавливает ресторан и дату из события.
     * При успешном бронировании переходит на страницу билета.
     */
    eventData?: IEventData;
}

/**
 * Комплексный хук для управления формой бронирования столика.
 * 
 * Включает:
 * - **State management** - управление состоянием формы через Jotai
 * - **Validation** - валидация полей с визуальной обратной связью
 * - **API calls** - загрузка дат, слотов, создание бронирования
 * - **Certificate handling** - активация подарочных сертификатов
 * 
 * @param options - Опции конфигурации хука
 * @param options.certificateParams - Параметры сертификата для активации
 * @param options.preSelectedRestaurant - Предвыбранный ресторан (для RestaurantBookingPage)
 * @param options.initialBookingData - Начальные данные формы из navigation state
 * @param options.isSharedRestaurant - Флаг перехода по shared-ссылке
 * @param options.eventData - Данные мероприятия (для EventBookingPage)
 * 
 * @returns Объект с состоянием формы, обработчиками и методами
 * @returns form - Текущее состояние формы бронирования
 * @returns isFormValid - Форма полностью валидна и готова к отправке
 * @returns validationDisplay - Состояние валидации для отображения ошибок в UI
 * @returns triggerValidation - Функция для ручного запуска валидации
 * @returns availableDates - Список доступных дат для бронирования
 * @returns availableTimeslots - Список доступных временных слотов
 * @returns canShowTimeSlots - Флаг: можно показывать временные слоты
 * @returns loading - Состояние загрузки (dates, timeslots, submit)
 * @returns errors - Состояние ошибок
 * @returns setErrorPopup - Управление popup с ошибкой
 * @returns handlers - Объект с обработчиками изменений полей формы
 * @returns createBooking - Функция создания бронирования
 * @returns preSelectedRestaurant - Предвыбранный ресторан (если передан)
 * @returns isSharedRestaurant - Флаг shared-ссылки
 * @returns isEventBooking - Это бронирование на мероприятие
 * @returns eventData - Данные мероприятия (если переданы)
 */
export const useBookingForm = (options: IUseBookingFormOptions = {}) => {
    const {
        certificateParams,
        preSelectedRestaurant,
        initialBookingData,
        isSharedRestaurant = false,
        eventData,
    } = options;
    
    // Флаг - это бронирование на мероприятие
    const isEventBooking = !!eventData;
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
    const eventDataApplied = useRef(false);

    // Мемоизируем начальные данные бронирования, чтобы избежать лишних ререндеров
    const initialDateValue = initialBookingData?.bookedDate?.value;
    const initialTimeSlotStart = initialBookingData?.bookedTime?.start_datetime;

    useEffect(() => {
        if (!user) return;
        
        const initialState = getInitialBookingFormState(user);
        let shouldUpdate = false;
        
        // Если есть данные мероприятия (применяем только один раз)
        if (!eventDataApplied.current && eventData) {
            initialState.restaurant = {
                title: eventData.restaurantTitle || '',
                value: eventData.restaurantId,
                ...(eventData.restaurantAddress && { address: eventData.restaurantAddress }),
            };
            // Устанавливаем дату мероприятия
            initialState.date = {
                title: formatDate(eventData.dateStart),
                value: eventData.dateStart.split('T')[0], // берём только дату
            };
            eventDataApplied.current = true;
            shouldUpdate = true;
        }
        
        // Если есть предвыбранный ресторан (применяем только один раз)
        if (!preSelectedRestaurantApplied.current && preSelectedRestaurant && !eventData) {
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
        eventData?.id,
        eventData?.restaurantId,
        eventData?.dateStart,
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
                    eventId: eventData?.id,
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
            eventData?.id ?? null,
            form.certificateId
        )
            .then((res) => {
                if (res.data?.error) {
                    setErrors(prev => ({ ...prev, popup: true, botError: true }));
                    return;
                }
                // Если это бронирование на мероприятие - переходим на страницу билета
                if (isEventBooking && res.data.ticket_id) {
                    navigate(`/tickets/${res.data.ticket_id}`);
                } else {
                    navigate(`/myBookings/${res.data.id}`);
                }
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
        eventData?.id,
        isEventBooking,
    ]);

    return {
        // ============================================
        // Состояние формы
        // ============================================
        
        /** Текущее состояние всех полей формы бронирования */
        form,
        
        // ============================================
        // Валидация
        // ============================================
        
        /** `true` если все обязательные поля заполнены корректно */
        isFormValid,
        /** Состояние валидации для отображения ошибок в UI */
        validationDisplay,
        /** Функция для ручного запуска валидации (возвращает isFormValid) */
        triggerValidation,
        
        // ============================================
        // Данные из API
        // ============================================
        
        /** Список доступных дат для бронирования (загружается по ресторану) */
        availableDates,
        /** Список доступных временных слотов (загружается по дате и количеству гостей) */
        availableTimeslots,
        /** `true` когда можно показывать временные слоты (выбрана дата и количество гостей > 0) */
        canShowTimeSlots,
        
        // ============================================
        // Состояния загрузки и ошибок
        // ============================================
        
        /** Состояние загрузки: { timeslots, dates, submit } */
        loading,
        /** Состояние ошибок: { timeslots, popup, botError, popupCount } */
        errors,
        /** Функция для управления отображением popup с ошибкой */
        setErrorPopup,
        
        // ============================================
        // Обработчики изменений формы
        // ============================================
        
        /**
         * Объект с обработчиками для компонентов формы.
         * @property selectRestaurant - Выбор ресторана (для CommonBookingHeader)
         * @property selectDate - Выбор даты (для DateListSelector)
         * @property setGuestCount - Изменение количества гостей
         * @property setChildrenCount - Изменение количества детей
         * @property selectTimeSlot - Выбор временного слота
         * @property setConfirmation - Выбор способа подтверждения
         * @property updateField - Универсальный метод для обновления любого поля
         */
        handlers: {
            selectRestaurant: handleRestaurantSelect,
            selectDate: handleDateSelect,
            setGuestCount: handleGuestCountChange,
            setChildrenCount: handleChildrenCountChange,
            selectTimeSlot: handleTimeSlotSelect,
            setConfirmation: handleConfirmationChange,
            updateField: handleFieldUpdate,
        },
        
        // ============================================
        // Действия
        // ============================================
        
        /** 
         * Создаёт бронирование.
         * - Проверяет onboarding (редирект если не пройден)
         * - Запускает валидацию
         * - Отправляет API-запрос
         * - При успехе: навигация на страницу бронирования или билета (для events)
         */
        createBooking,
        
        // ============================================
        // Информация о контексте
        // ============================================
        
        /** Предвыбранный ресторан (если передан в options) */
        preSelectedRestaurant,
        /** `true` если пользователь пришёл по shared-ссылке */
        isSharedRestaurant,
        /** `true` если это бронирование на мероприятие */
        isEventBooking,
        /** Данные мероприятия (если переданы в options) */
        eventData,
    };
};
