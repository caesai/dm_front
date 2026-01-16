/**
 * @fileoverview Атомы для управления состоянием формы бронирования.
 * 
 * ## Разделение состояния
 * 
 * Для предотвращения конфликтов состояния между разными страницами бронирования,
 * используются отдельные атомы для каждого типа:
 * 
 * - {@link eventBookingFormAtom} - бронирование на мероприятие (EventBookingPage)
 * - {@link restaurantBookingFormAtom} - бронирование конкретного ресторана (RestaurantBookingPage)
 * - {@link commonBookingFormAtom} - общее бронирование с выбором ресторана (BookingPage)
 * - {@link previewBookingFormAtom} - превью бронирования на странице ресторана (BookingsBlock)
 * 
 * Каждый атом содержит полное состояние формы ({@link IBookingFormState}),
 * что обеспечивает изоляцию и предотвращает перезапись данных при навигации.
 * 
 * ## Синхронизация данных между страницами
 * 
 * {@link previewBookingFormAtom} используется для синхронизации данных между
 * {@link RestaurantPage} и {@link RestaurantBookingPage}:
 * 
 * 1. Пользователь выбирает дату и время в {@link BookingsBlock} на странице ресторана
 * 2. Данные сохраняются в {@link previewBookingFormAtom}
 * 3. При переходе на {@link RestaurantBookingPage}, начальные данные читаются из этого атома
 * 4. {@link RestaurantBookingPage} использует свой {@link restaurantBookingFormAtom} для работы
 * 
 * Это обеспечивает согласованность данных без использования location.state.
 * 
 * ## Использование
 * 
 * В компонентах используйте хук {@link useBookingForm} с параметром `formType`:
 * 
 * ```typescript
 * const { form, handlers } = useBookingForm({ formType: 'event' });
 * ```
 * 
 * @module atoms/bookingFormAtom
 * 
 * @see {@link useBookingForm} - хук для работы с формой бронирования
 * @see {@link BookingFormType} - типы форм бронирования
 */

import { atom } from 'jotai';
import { atomWithReset, RESET } from 'jotai/utils';
import { PickerValue } from '@/lib/react-mobile-picker/components/Picker.tsx';
import { ITimeSlot } from '@/pages/BookingPage/BookingPage.types.ts';
import { IConfirmationType } from '@/components/ConfirmationSelect/ConfirmationSelect.types.ts';

/**
 * Начальное значение для picker-селекторов
 */
export const INITIAL_PICKER_VALUE: PickerValue = {
    title: 'unset',
    value: 'unset',
};

/**
 * Список способов подтверждения бронирования
 */
export const CONFIRMATION_OPTIONS: IConfirmationType[] = [
    { id: 'telegram', text: 'В Telegram' },
    { id: 'phone', text: 'По телефону' },
    { id: 'none', text: 'Без подтверждения' },
];

/**
 * Типы форм бронирования для разделения состояния.
 * Каждый тип использует отдельный атом для предотвращения конфликтов состояния.
 * 
 * @type {'event'} - Бронирование на мероприятие (EventBookingPage)
 * @type {'restaurant'} - Бронирование конкретного ресторана (RestaurantBookingPage)
 * @type {'common'} - Общее бронирование с выбором ресторана (BookingPage)
 * @type {'preview'} - Превью бронирования на странице ресторана (BookingsBlock)
 */
export type BookingFormType = 'event' | 'restaurant' | 'common' | 'preview';

/**
 * Интерфейс состояния формы бронирования
 */
export interface IBookingFormState {
    // Выбор ресторана и времени
    restaurant: PickerValue;
    date: PickerValue;
    selectedTimeSlot: ITimeSlot | null;
    
    // Гости
    guestCount: number;
    childrenCount: number;
    
    // Контактные данные
    userName: string;
    userPhone: string;
    userEmail: string;
    
    // Дополнительные опции
    commentary: string;
    confirmation: IConfirmationType;
    preOrder: boolean;
    certificateId: string | null;
}

/**
 * Начальное состояние формы бронирования
 */
export const getInitialBookingFormState = (user?: { 
    first_name?: string; 
    phone_number?: string; 
    email?: string | null; 
}): IBookingFormState => ({
    restaurant: INITIAL_PICKER_VALUE,
    date: INITIAL_PICKER_VALUE,
    selectedTimeSlot: null,
    guestCount: 0,
    childrenCount: 0,
    userName: user?.first_name ?? '',
    userPhone: user?.phone_number ?? '',
    userEmail: user?.email ?? '',
    commentary: '',
    confirmation: CONFIRMATION_OPTIONS[0],
    preOrder: false,
    certificateId: null,
});

// ============================================
// Разделённые атомы для каждого типа бронирования
// ============================================

/**
 * Атом формы бронирования на мероприятие.
 * Используется в {@link EventBookingPage}.
 */
export const eventBookingFormAtom = atomWithReset<IBookingFormState>(getInitialBookingFormState());

/**
 * Атом формы бронирования конкретного ресторана.
 * Используется в {@link RestaurantBookingPage}.
 */
export const restaurantBookingFormAtom = atomWithReset<IBookingFormState>(getInitialBookingFormState());

/**
 * Атом общей формы бронирования (выбор ресторана пользователем).
 * Используется в {@link BookingPage}.
 */
export const commonBookingFormAtom = atomWithReset<IBookingFormState>(getInitialBookingFormState());

/**
 * Атом формы превью бронирования на странице ресторана.
 * Используется в {@link BookingsBlock} на {@link RestaurantPage}.
 */
export const previewBookingFormAtom = atomWithReset<IBookingFormState>(getInitialBookingFormState());

/**
 * @deprecated Используйте типизированные атомы: eventBookingFormAtom, restaurantBookingFormAtom, commonBookingFormAtom, previewBookingFormAtom
 * Основной атом формы бронирования с возможностью сброса (для обратной совместимости)
 */
export const bookingFormAtom = atomWithReset<IBookingFormState>(getInitialBookingFormState());

/**
 * Получает атом формы бронирования по типу.
 * 
 * @param formType - Тип формы бронирования
 * @returns Атом формы для указанного типа
 * 
 * @example
 * const formAtom = getBookingFormAtomByType('event');
 * const [form, setForm] = useAtom(formAtom);
 */
export const getBookingFormAtomByType = (formType: BookingFormType) => {
    switch (formType) {
        case 'event':
            return eventBookingFormAtom;
        case 'restaurant':
            return restaurantBookingFormAtom;
        case 'common':
            return commonBookingFormAtom;
        case 'preview':
            return previewBookingFormAtom;
        default:
            return bookingFormAtom;
    }
};

/**
 * @deprecated Используйте getBookingFormAtomByType для получения правильного атома
 * Атом для обновления отдельных полей формы
 */
export const updateBookingFormAtom = atom(
    null,
    (get, set, update: Partial<IBookingFormState>) => {
        const current = get(bookingFormAtom);
        set(bookingFormAtom, { ...current, ...update });
    }
);

/**
 * @deprecated Используйте getBookingFormAtomByType для получения правильного атома
 * Атом для сброса формы к начальному состоянию
 */
export const resetBookingFormAtom = atom(
    null,
    (_get, set) => {
        set(bookingFormAtom, RESET);
    }
);

// ============================================
// Derived atoms для отдельных полей
// ============================================

/** Атом ресторана */
export const bookingRestaurantAtom = atom(
    (get) => get(bookingFormAtom).restaurant,
    (_get, set, restaurant: PickerValue) => {
        set(updateBookingFormAtom, { restaurant });
    }
);

/** Атом даты */
export const bookingDateFormAtom = atom(
    (get) => get(bookingFormAtom).date,
    (_get, set, date: PickerValue) => {
        set(updateBookingFormAtom, { date, selectedTimeSlot: null });
    }
);

/** Атом выбранного времени */
export const bookingTimeSlotAtom = atom(
    (get) => get(bookingFormAtom).selectedTimeSlot,
    (_get, set, selectedTimeSlot: ITimeSlot | null) => {
        set(updateBookingFormAtom, { selectedTimeSlot });
    }
);

/** Атом количества гостей */
export const bookingGuestsAtom = atom(
    (get) => ({
        guestCount: get(bookingFormAtom).guestCount,
        childrenCount: get(bookingFormAtom).childrenCount,
    }),
    (_get, set, guests: { guestCount: number; childrenCount: number }) => {
        set(updateBookingFormAtom, guests);
    }
);

/** Атом контактных данных */
export const bookingContactsAtom = atom(
    (get) => ({
        userName: get(bookingFormAtom).userName,
        userPhone: get(bookingFormAtom).userPhone,
        userEmail: get(bookingFormAtom).userEmail,
    }),
    (_get, set, contacts: { userName?: string; userPhone?: string; userEmail?: string }) => {
        set(updateBookingFormAtom, contacts);
    }
);

/** Атом комментария */
export const bookingCommentaryAtom = atom(
    (get) => get(bookingFormAtom).commentary,
    (_get, set, commentary: string) => {
        set(updateBookingFormAtom, { commentary });
    }
);

/** Атом способа подтверждения */
export const bookingConfirmationAtom = atom(
    (get) => get(bookingFormAtom).confirmation,
    (_get, set, confirmation: IConfirmationType) => {
        set(updateBookingFormAtom, { confirmation });
    }
);

/** Атом предзаказа */
export const bookingPreOrderAtom = atom(
    (get) => get(bookingFormAtom).preOrder,
    (_get, set, preOrder: boolean) => {
        set(updateBookingFormAtom, { preOrder });
    }
);

/** Атом сертификата */
export const bookingCertificateAtom = atom(
    (get) => get(bookingFormAtom).certificateId,
    (_get, set, certificateId: string | null) => {
        set(updateBookingFormAtom, { certificateId });
    }
);

// ============================================
// Вычисляемые атомы
// ============================================

/** Общее количество гостей */
export const totalGuestsAtom = atom((get) => {
    const form = get(bookingFormAtom);
    return form.guestCount + form.childrenCount;
});

/** Проверка, выбран ли ресторан */
export const isRestaurantSelectedAtom = atom(
    (get) => get(bookingFormAtom).restaurant.value !== 'unset'
);

/** Проверка, выбрана ли дата */
export const isDateSelectedAtom = atom(
    (get) => get(bookingFormAtom).date.value !== 'unset'
);

/** Проверка, можно ли показывать слоты времени */
export const canShowTimeSlotsAtom = atom((get) => {
    const form = get(bookingFormAtom);
    return form.guestCount > 0 && form.date.value !== 'unset';
});

/** Проверка, нужен ли предзаказ (для групп от 8 человек) */
export const isPreOrderAvailableAtom = atom((get) => get(totalGuestsAtom) >= 8);
