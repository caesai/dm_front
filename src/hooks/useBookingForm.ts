/**
 * @fileoverview Комплексный хук для управления формой бронирования столиков в ресторане.
 * 
 * Хук инкапсулирует всю логику формы бронирования:
 * - Управление состоянием формы через Jotai atoms (разделённые по типам)
 * - Валидация полей формы
 * - API-запросы для загрузки доступных дат и временных слотов
 * - Обработка сертификатов
 * - Создание бронирования
 * 
 * ## Разделение состояния формы
 * 
 * Каждый тип бронирования использует отдельный атом для предотвращения конфликтов:
 * - `formType: 'event'` → `eventBookingFormAtom` (EventBookingPage)
 * - `formType: 'restaurant'` → `restaurantBookingFormAtom` (RestaurantBookingPage, BookingsBlock)
 * - `formType: 'common'` → `commonBookingFormAtom` (BookingPage)
 * 
 * Это обеспечивает изоляцию состояния между страницами и предотвращает
 * перезапись данных при навигации между разными типами бронирования.
 * 
 * @module hooks/useBookingForm
 * 
 * @example
 * // Пример 1: Общая страница бронирования (BookingPage)
 * // Пользователь сам выбирает ресторан из списка
 * const { form, handlers, createBooking } = useBookingForm({
 *     formType: 'common',
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
 *     formType: 'restaurant',
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
 *     isShared: state?.sharedRestaurant,
 * });
 * 
 * @example
 * // Пример 3: Бронирование на мероприятие (EventBookingPage)
 * // Ресторан и дата берутся из данных мероприятия
 * const { form, handlers, createBooking } = useBookingForm({
 *     formType: 'event',
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
 * 
 * @example
 * // Пример 4: Превью бронирования на странице ресторана (BookingsBlock)
 * const { form, handlers } = useBookingForm({
 *     formType: 'restaurant',
 *     preSelectedRestaurant: { id: '1', title: 'Restaurant' },
 *     initialBookingData: { guestCount: 1 },
 * });
 */

import { useEffect, useLayoutEffect, useMemo, useCallback, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAtom, useAtomValue, WritableAtom } from 'jotai';
// API
import { APICreateBooking, APIGetAvailableDays, APIGetAvailableTimeSlots } from '@/api/restaurants.api.ts';
import { APIGetCertificates, APIPostCertificateClaim } from '@/api/certificates.api.ts';
// Atoms
import { authAtom, userAtom } from '@/atoms/userAtom.ts';
import { commAtom } from '@/atoms/bookingCommAtom.ts';
import { certificatesListAtom } from '@/atoms/certificatesListAtom.ts';
import {
    bookingFormAtom,
    getInitialBookingFormState,
    getBookingFormAtomByType,
    IBookingFormState,
    BookingFormType,
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
 * @see {@link BookingPage} - общая страница бронирования (formType: 'common')
 * @see {@link RestaurantBookingPage} - бронирование с preSelectedRestaurant (formType: 'restaurant')
 * @see {@link EventBookingPage} - бронирование с eventData (formType: 'event')
 * @see {@link BookingsBlock} - превью бронирования на странице ресторана (formType: 'restaurant')
 */
export interface IUseBookingFormOptions {
    /**
     * Тип формы бронирования для разделения состояния.
     * Каждый тип использует отдельный атом для предотвращения конфликтов.
     * 
     * - 'event' - бронирование на мероприятие (EventBookingPage)
     * - 'restaurant' - бронирование конкретного ресторана (RestaurantBookingPage, BookingsBlock)
     * - 'common' - общее бронирование с выбором ресторана (BookingPage)
     * 
     * @default undefined (использует общий bookingFormAtom для обратной совместимости)
     * 
     * @example
     * // EventBookingPage
     * useBookingForm({ formType: 'event', eventData: {...} });
     * 
     * // RestaurantBookingPage или BookingsBlock
     * useBookingForm({ formType: 'restaurant', preSelectedRestaurant: {...} });
     * 
     * // BookingPage
     * useBookingForm({ formType: 'common' });
     */
    formType?: BookingFormType;
    
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
     * ID ресторана для отслеживания смены.
     * Используется для сброса формы при переходе между ресторанами.
     * Особенно важен когда preSelectedRestaurant может быть undefined
     * на момент первого рендера (пока данные загружаются).
     * 
     * @example
     * // В BookingsBlock
     * useBookingForm({
     *     formType: 'restaurant',
     *     restaurantId: restaurantId, // ID из URL params
     *     preSelectedRestaurant: currentRestaurant ? {...} : undefined,
     * });
     */
    restaurantId?: string;
    
    /** 
     * Начальные данные бронирования из location.state.
     * Позволяет предзаполнить дату, время и количество гостей.
     */
    initialBookingData?: IInitialBookingData;
    
    /** 
     * Флаг, что пользователь пришёл по shared ссылке.
     * Влияет на навигацию - при нажатии "Назад" перейдёт на главную.
     */
    isShared?: boolean;
    
    /** 
     * Данные мероприятия для бронирования на event.
     * При наличии автоматически устанавливает ресторан и дату из события.
     * При успешном бронировании переходит на страницу билета.
     */
    eventData?: IEventData;
    
    /**
     * Флаг сброса формы при монтировании компонента.
     * При true форма сбрасывается к начальному состоянию при каждом монтировании.
     * Используется на страницах бронирования для предотвращения использования
     * устаревшего состояния от предыдущих сессий.
     * 
     * @default false
     * 
     * @example
     * // На страницах бронирования (BookingPage, RestaurantBookingPage, EventBookingPage)
     * useBookingForm({ resetOnMount: true });
     * 
     * // В компонентах просмотра (BookingsBlock) - НЕ сбрасывать
     * useBookingForm({ resetOnMount: false });
     */
    resetOnMount?: boolean;
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
 * @param options.isShared - Флаг перехода по shared-ссылке
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
 * @returns isShared - Флаг shared-ссылки
 * @returns isEventBooking - Это бронирование на мероприятие
 * @returns eventData - Данные мероприятия (если переданы)
 */
export const useBookingForm = (options: IUseBookingFormOptions = {}) => {
    const {
        formType,
        certificateParams,
        preSelectedRestaurant,
        restaurantId: explicitRestaurantId,
        initialBookingData,
        isShared = false,
        eventData,
        resetOnMount = false,
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

    // Выбираем атом формы в зависимости от типа
    // Используем useMemo для стабильной ссылки на атом
    const selectedFormAtom = useMemo(() => {
        return formType ? getBookingFormAtomByType(formType) : bookingFormAtom;
    }, [formType]);

    // Form state - используем выбранный атом
    const [formState, setForm] = useAtom(selectedFormAtom);
    
    // Создаём функцию обновления для конкретного атома
    const updateForm = useCallback((update: Partial<IBookingFormState>) => {
        setForm((current) => ({ ...current, ...update }));
    }, [setForm]);
    
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

    /**
     * Проверка валидности формы.
     * 
     * Для пользователей без complete_onboarding (незарегистрированные или не прошедшие онбординг):
     * - Проверяется только timeSlot и guests
     * - Имя и телефон не требуются, так как пользователь будет перенаправлен на онбординг
     * 
     * Для пользователей с complete_onboarding:
     * - Полная валидация: name, phone, timeSlot, guests
     */
    const isFormValid = useMemo(() => {
        // Базовая валидация для всех пользователей
        const baseValidation = validation.timeSlot && validation.guests;
        
        // Для незарегистрированных пользователей или без онбординга - достаточно базовой валидации
        if (!user?.complete_onboarding) {
            return baseValidation;
        }
        
        // Для зарегистрированных пользователей - полная валидация
        return baseValidation && validation.name && validation.phone;
    }, [validation, user?.complete_onboarding]);

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
    const userDataApplied = useRef(false);
    /** Флаг автоматического выбора первого временного слота для мероприятий */
    const autoTimeSlotSelected = useRef(false);
    /** Ref для отслеживания, была ли уже установлена дата для текущего ресторана */
    const dateInitializedForRestaurantRef = useRef<string | null>(null);

    // Мемоизируем начальные данные бронирования, чтобы избежать лишних ререндеров
    const initialDateValue = initialBookingData?.bookedDate?.value;
    const initialTimeSlotStart = initialBookingData?.bookedTime?.start_datetime;
    const initialGuestCount = initialBookingData?.guestCount;
    const initialChildrenCount = initialBookingData?.childrenCount;
    
    // Определяем ID ресторана из props (explicitRestaurantId имеет приоритет)
    const targetRestaurantId = explicitRestaurantId || preSelectedRestaurant?.id || eventData?.restaurantId;
    
    // Ref для отслеживания предыдущего restaurantId (для надежного сброса)
    const previousRestaurantIdRef = useRef<string | undefined>(undefined);
    
    // Сброс формы при изменении ресторана (useLayoutEffect выполняется синхронно перед useEffect)
    // Используем explicitRestaurantId для надежного сброса даже когда preSelectedRestaurant undefined
    useLayoutEffect(() => {
        const currentRestaurantIdInForm = formState?.restaurant?.value;
        const previousRestaurantId = previousRestaurantIdRef.current;
        
        // Определяем новый restaurantId для сравнения
        const newRestaurantId = explicitRestaurantId || targetRestaurantId;
        
        // Определяем, нужен ли сброс:
        // 1. Если явно переданный restaurantId изменился (сравниваем с предыдущим через ref)
        // 2. ИЛИ если targetRestaurantId отличается от того, что сохранено в форме
        const restaurantChangedViaRef = (
            newRestaurantId && 
            previousRestaurantId && 
            previousRestaurantId !== newRestaurantId
        );
        
        const restaurantChangedViaForm = (
            targetRestaurantId && 
            currentRestaurantIdInForm && 
            currentRestaurantIdInForm !== 'unset' &&
            currentRestaurantIdInForm !== targetRestaurantId
        );
        
        const needsReset = restaurantChangedViaRef || restaurantChangedViaForm;
        
        // Обновляем ref с текущим restaurantId (ПОСЛЕ проверки needsReset)
        if (newRestaurantId) {
            previousRestaurantIdRef.current = newRestaurantId;
        }
        
        if (needsReset) {
            // Сбрасываем форму к начальному состоянию
            const initialState = getInitialBookingFormState();
            
            // Устанавливаем новый ресторан
            if (preSelectedRestaurant) {
                initialState.restaurant = {
                    title: preSelectedRestaurant.title,
                    value: preSelectedRestaurant.id,
                    ...(preSelectedRestaurant.address && { address: preSelectedRestaurant.address }),
                };
            } else if (eventData) {
                initialState.restaurant = {
                    title: eventData.restaurantTitle || '',
                    value: eventData.restaurantId,
                    ...(eventData.restaurantAddress && { address: eventData.restaurantAddress }),
                };
            } else if (explicitRestaurantId) {
                // Если есть только explicitRestaurantId, устанавливаем его
                // (preSelectedRestaurant появится позже после загрузки)
                initialState.restaurant = {
                    title: '',
                    value: explicitRestaurantId,
                };
            }
            
            // Устанавливаем начальное количество гостей из initialBookingData
            if (initialGuestCount !== undefined) {
                initialState.guestCount = initialGuestCount;
            }
            if (initialChildrenCount !== undefined) {
                initialState.childrenCount = initialChildrenCount;
            }
            
            setForm(initialState);
            
            // Сбрасываем все флаги инициализации для полной реинициализации
            isInitialized.current = false;
            initialBookingDataApplied.current = false;
            preSelectedRestaurantApplied.current = false;
            eventDataApplied.current = false;
            autoTimeSlotSelected.current = false;
            // Также сбрасываем флаг инициализации даты для нового ресторана
            dateInitializedForRestaurantRef.current = null;
        }
    }, [explicitRestaurantId, targetRestaurantId, preSelectedRestaurant, eventData, 
        formState?.restaurant?.value, setForm, initialGuestCount, initialChildrenCount]);

    // Инициализация формы (ресторан, дата, гости) - НЕ зависит от user
    useEffect(() => {
        // Первая инициализация - устанавливаем состояние без данных пользователя
        if (!isInitialized.current) {
            const initialState = getInitialBookingFormState(); // без user
            
            // Сохраняем существующие данные из bookingFormAtom, если они уже установлены
            // (например, дата и время выбраны в BookingsBlock на странице ресторана)
            // НО: если resetOnMount = true, игнорируем существующие данные для свежего старта
            const existingDate = !resetOnMount && formState?.date?.value !== 'unset' ? formState.date : null;
            const existingTimeSlot = !resetOnMount ? (formState?.selectedTimeSlot || null) : null;
            const existingGuestCount = !resetOnMount && formState?.guestCount > 0 ? formState.guestCount : 0;
            const existingChildrenCount = !resetOnMount ? (formState?.childrenCount ?? 0) : 0;
            
            // Если есть данные мероприятия
            if (eventData) {
                initialState.restaurant = {
                    title: eventData.restaurantTitle || '',
                    value: eventData.restaurantId,
                    ...(eventData.restaurantAddress && { address: eventData.restaurantAddress }),
                };
                initialState.date = {
                    title: formatDate(eventData.dateStart),
                    value: eventData.dateStart.split('T')[0],
                };
                // Для мероприятий устанавливаем минимум 1 гостя, если не задано в initialBookingData
                if (initialGuestCount === undefined && initialState.guestCount === 0) {
                    initialState.guestCount = 1;
                }
                eventDataApplied.current = true;
            }
            
            // Если есть предвыбранный ресторан (и нет eventData)
            if (preSelectedRestaurant && !eventData) {
                initialState.restaurant = {
                    title: preSelectedRestaurant.title,
                    value: preSelectedRestaurant.id,
                    ...(preSelectedRestaurant.address && { address: preSelectedRestaurant.address }),
                };
                preSelectedRestaurantApplied.current = true;
            }
            
            // Если есть начальные данные бронирования из props
            if (initialBookingData) {
                if (initialBookingData.bookedDate) {
                    initialState.date = initialBookingData.bookedDate;
                }
                if (initialBookingData.bookedTime) {
                    initialState.selectedTimeSlot = initialBookingData.bookedTime;
                }
                if (initialGuestCount !== undefined) {
                    initialState.guestCount = initialGuestCount;
                }
                if (initialChildrenCount !== undefined) {
                    initialState.childrenCount = initialChildrenCount;
                }
                initialBookingDataApplied.current = true;
            }
            
            // Применяем существующие данные из атома, НО только если нет initialBookingData с этими данными.
            // initialBookingData (из props) имеет приоритет,
            // так как он содержит актуальные данные, выбранные пользователем перед переходом.
            // Существующие данные из атома используются только как fallback.
            if (!eventData && !resetOnMount) {
                // Применяем существующую дату только если НЕТ bookedDate в initialBookingData
                if (existingDate && !initialBookingData?.bookedDate) {
                    initialState.date = existingDate;
                }
                // Применяем существующий слот только если НЕТ bookedTime в initialBookingData
                if (existingTimeSlot && !initialBookingData?.bookedTime) {
                    initialState.selectedTimeSlot = existingTimeSlot;
                }
                // Применяем количество гостей только если НЕТ guestCount в initialBookingData
                if (existingGuestCount > 0 && initialGuestCount === undefined) {
                    initialState.guestCount = existingGuestCount;
                }
                // Применяем количество детей только если НЕТ childrenCount в initialBookingData
                if (existingChildrenCount > 0 && initialChildrenCount === undefined) {
                    initialState.childrenCount = existingChildrenCount;
                }
            }
            
            setForm(initialState);
            isInitialized.current = true;
            return;
        }
        
        // После инициализации - используем updateForm для частичных обновлений
        const partialUpdate: Partial<IBookingFormState> = {};
        
        // Применяем данные мероприятия (один раз)
        if (!eventDataApplied.current && eventData) {
            partialUpdate.restaurant = {
                title: eventData.restaurantTitle || '',
                value: eventData.restaurantId,
                ...(eventData.restaurantAddress && { address: eventData.restaurantAddress }),
            };
            partialUpdate.date = {
                title: formatDate(eventData.dateStart),
                value: eventData.dateStart.split('T')[0],
            };
            // Для мероприятий устанавливаем минимум 1 гостя, если не задано
            if (initialGuestCount === undefined && form.guestCount === 0) {
                partialUpdate.guestCount = 1;
            }
            eventDataApplied.current = true;
        }
        
        // Применяем предвыбранный ресторан (один раз)
        if (!preSelectedRestaurantApplied.current && preSelectedRestaurant && !eventData) {
            partialUpdate.restaurant = {
                title: preSelectedRestaurant.title,
                value: preSelectedRestaurant.id,
                ...(preSelectedRestaurant.address && { address: preSelectedRestaurant.address }),
            };
            preSelectedRestaurantApplied.current = true;
        }
        
        // Применяем начальные данные бронирования (один раз)
        if (!initialBookingDataApplied.current && initialBookingData) {
            if (initialBookingData.bookedDate) {
                partialUpdate.date = initialBookingData.bookedDate;
            }
            if (initialBookingData.bookedTime) {
                partialUpdate.selectedTimeSlot = initialBookingData.bookedTime;
            }
            if (initialGuestCount !== undefined) {
                partialUpdate.guestCount = initialGuestCount;
            }
            if (initialChildrenCount !== undefined) {
                partialUpdate.childrenCount = initialChildrenCount;
            }
            initialBookingDataApplied.current = true;
        }
        
        // Обновляем только если есть что обновлять
        if (Object.keys(partialUpdate).length > 0) {
            updateForm(partialUpdate);
        }
    }, [
        setForm,
        updateForm,
        preSelectedRestaurant?.id, 
        preSelectedRestaurant?.title, 
        preSelectedRestaurant?.address,
        initialDateValue,
        initialTimeSlotStart,
        initialGuestCount,
        initialChildrenCount,
        eventData?.id,
        eventData?.restaurantId,
        eventData?.dateStart,
    ]);

    // Обновление контактных данных пользователя - когда user появляется
    useEffect(() => {
        if (!user || userDataApplied.current) return;
        
        // Обновляем контактные данные из профиля пользователя
        updateForm({
            userName: user.first_name ?? '',
            userPhone: user.phone_number ?? '',
            userEmail: user.email ?? '',
        });
        userDataApplied.current = true;
    }, [user, updateForm]);

    // ============================================
    // Load Available Dates
    // ============================================

    useEffect(() => {
        if (!auth?.access_token || !form.restaurant?.value || form.restaurant.value === 'unset') return;

        const restaurantId = String(form.restaurant.value);

        setLoading(prev => ({ ...prev, dates: true }));

        APIGetAvailableDays(auth.access_token, restaurantId, 1)
            .then((res) => {
                const formattedDates = res.data.map((v: string) => ({
                    title: formatDate(v),
                    value: v,
                }));
                setAvailableDates(formattedDates);
                
                // Автоматически устанавливаем первую дату только если:
                // 1. Есть доступные даты
                // 2. Дата для этого ресторана ещё не была инициализирована
                // 3. Текущая дата = 'unset' (не была установлена из initialBookingData или eventData)
                // НЕ перезаписываем дату из initialBookingData.bookedDate или eventData.dateStart
                if (
                    formattedDates.length > 0 && 
                    dateInitializedForRestaurantRef.current !== restaurantId
                ) {
                    // Проверяем текущее значение даты в форме через getter атома
                    // Если дата 'unset', устанавливаем первую доступную дату
                    if (form.date?.value === 'unset') {
                        updateForm({ date: formattedDates[0] });
                    }
                    // Помечаем ресторан как обработанный в любом случае
                    dateInitializedForRestaurantRef.current = restaurantId;
                }
            })
            .catch((err) => {
                console.error('Error fetching available days:', err);
            })
            .finally(() => {
                setLoading(prev => ({ ...prev, dates: false }));
            });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [auth?.access_token, form.restaurant?.value, form.guestCount, updateForm]);

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

        // Флаг для отмены обновления состояния после размонтирования
        let isCancelled = false;

        setLoading(prev => ({ ...prev, timeslots: true }));
        setErrors(prev => ({ ...prev, timeslots: false }));

        APIGetAvailableTimeSlots(
            auth.access_token,
            String(form.restaurant.value),
            String(form.date.value),
            form.guestCount
        )
            .then((res) => {
                // Предотвращаем обновление состояния после размонтирования
                if (isCancelled) return;
                
                const newTimeslots: ITimeSlot[] = res.data;
                setAvailableTimeslots(newTimeslots);
                
                // Для мероприятий: автоматический выбор слота с улучшенной логикой
                if (isEventBooking && newTimeslots.length > 0 && eventData?.dateStart) {
                    // Извлекаем время начала мероприятия (HH:mm)
                    // Поддерживаем форматы: 'YYYY-MM-DD HH:mm:ss' и 'YYYY-MM-DDTHH:mm:ss'
                    const extractTime = (datetime: string): string | undefined => {
                        // Разделяем по 'T' или пробелу
                        const timePart = datetime.split(/[T\s]/)[1];
                        return timePart?.slice(0, 5); // 'HH:mm'
                    };
                    
                    const eventStartTime = extractTime(eventData.dateStart);
                    
                    // Проверяем, есть ли текущий выбранный слот в новом списке
                    const currentSlotStillAvailable = form.selectedTimeSlot && newTimeslots.some(
                        (slot: ITimeSlot) => slot.start_datetime === form.selectedTimeSlot?.start_datetime
                    );
                    
                    // Если слот ещё не был автоматически выбран ИЛИ текущий слот больше недоступен
                    if (!autoTimeSlotSelected.current || !currentSlotStillAvailable) {
                        // Ищем слот с matching временем начала мероприятия
                        const matchingSlot = eventStartTime 
                            ? newTimeslots.find((slot: ITimeSlot) => {
                                const slotTime = extractTime(slot.start_datetime);
                                return slotTime === eventStartTime;
                            })
                            : undefined;
                        
                        // Выбираем: слот мероприятия > текущий доступный слот > первый доступный
                        const slotToSelect = matchingSlot || 
                            (currentSlotStillAvailable ? form.selectedTimeSlot : newTimeslots[0]);
                        
                        if (slotToSelect && slotToSelect !== form.selectedTimeSlot) {
                            updateForm({ selectedTimeSlot: slotToSelect });
                        }
                        autoTimeSlotSelected.current = true;
                    }
                }
            })
            .catch((err) => {
                if (isCancelled) return;
                console.error('Error fetching timeslots:', err);
                setErrors(prev => ({ ...prev, timeslots: true }));
            })
            .finally(() => {
                if (isCancelled) return;
                setLoading(prev => ({ ...prev, timeslots: false }));
            });
        
        // Cleanup function для отмены обновлений после размонтирования
        return () => {
            isCancelled = true;
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [auth?.access_token, form.date?.value, form.guestCount, form.restaurant?.value, isEventBooking, eventData?.dateStart]);

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
        // Сбрасываем флаг автовыбора при смене ресторана
        autoTimeSlotSelected.current = false;
        updateForm({ restaurant, selectedTimeSlot: null });
    }, [updateForm]);

    const handleDateSelect = useCallback((date: PickerValue) => {
        // Сбрасываем флаг автовыбора при смене даты
        autoTimeSlotSelected.current = false;
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
                    sharedRestaurant: isShared || !!preSelectedRestaurant,
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
        isShared,
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
        isShared,
        /** `true` если это бронирование на мероприятие */
        isEventBooking,
        /** Данные мероприятия (если переданы в options) */
        eventData,
    };
};
