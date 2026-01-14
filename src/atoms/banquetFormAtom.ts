/**
 * @fileoverview Атом для хранения данных формы бронирования банкета.
 */
import { atom } from 'jotai';
import { atomWithReset, RESET } from 'jotai/utils';
import { PickerValue } from '@/lib/react-mobile-picker/components/Picker.tsx';
import { IRestaurant } from '@/types/restaurant.types.ts';

/**
 * Интерфейс для цены банкета
 */
export interface IBanquetPrice {
    deposit: number | null;
    totalDeposit: number;
    serviceFee: number;
    total: number;
}

/**
 * Интерфейс состояния формы бронирования банкета
 */
export interface IBanquetFormState {
    // Основная информация
    name: string | undefined;
    date: Date | null;
    timeFrom: string;
    timeTo: string;
    guestCount: PickerValue;
    reason: string;
    
    // Ресторан
    currentRestaurant: IRestaurant | undefined;
    restaurantId: string;
    optionId: string;
    
    // Дополнительные услуги
    additionalOptions: { id: number; name: string }[];
    selectedServices: string[];
    withAdditionalPage: boolean;
    
    // Цена
    price: IBanquetPrice | null;
}

/**
 * Начальное состояние формы бронирования банкета
 */
export const getInitialBanquetFormState = (): IBanquetFormState => ({
    name: undefined,
    date: null,
    timeFrom: 'с',
    timeTo: 'до',
    guestCount: {
        value: 'unset',
        title: '',
    },
    reason: '',
    currentRestaurant: undefined,
    restaurantId: '',
    optionId: '',
    additionalOptions: [],
    selectedServices: [],
    withAdditionalPage: false,
    price: null,
});

/**
 * Основной атом формы бронирования банкета с возможностью сброса
 */
export const banquetFormAtom = atomWithReset<IBanquetFormState>(getInitialBanquetFormState());

/**
 * Атом для обновления отдельных полей формы
 */
export const updateBanquetFormAtom = atom(
    null,
    (get, set, update: Partial<IBanquetFormState>) => {
        const current = get(banquetFormAtom);
        set(banquetFormAtom, { ...current, ...update });
    }
);

/**
 * Атом для сброса формы к начальному состоянию
 */
export const resetBanquetFormAtom = atom(
    null,
    (_get, set) => {
        set(banquetFormAtom, RESET);
    }
);

// ============================================
// Derived atoms для отдельных полей
// ============================================

/** Атом даты */
export const banquetDateAtom = atom(
    (get) => get(banquetFormAtom).date,
    (_get, set, date: Date | null) => {
        set(updateBanquetFormAtom, { date });
    }
);

/** Атом времени начала */
export const banquetTimeFromAtom = atom(
    (get) => get(banquetFormAtom).timeFrom,
    (_get, set, timeFrom: string) => {
        set(updateBanquetFormAtom, { timeFrom });
    }
);

/** Атом времени окончания */
export const banquetTimeToAtom = atom(
    (get) => get(banquetFormAtom).timeTo,
    (_get, set, timeTo: string) => {
        set(updateBanquetFormAtom, { timeTo });
    }
);

/** Атом количества гостей */
export const banquetGuestCountAtom = atom(
    (get) => get(banquetFormAtom).guestCount,
    (_get, set, guestCount: PickerValue) => {
        set(updateBanquetFormAtom, { guestCount });
    }
);

/** Атом повода */
export const banquetReasonAtom = atom(
    (get) => get(banquetFormAtom).reason,
    (_get, set, reason: string) => {
        set(updateBanquetFormAtom, { reason });
    }
);

/** Атом выбранных дополнительных услуг */
export const banquetSelectedServicesAtom = atom(
    (get) => get(banquetFormAtom).selectedServices,
    (_get, set, selectedServices: string[]) => {
        set(updateBanquetFormAtom, { selectedServices });
    }
);

/** Атом цены */
export const banquetPriceAtom = atom(
    (get) => get(banquetFormAtom).price,
    (_get, set, price: IBanquetPrice | null) => {
        set(updateBanquetFormAtom, { price });
    }
);

// ============================================
// Вычисляемые атомы
// ============================================

/** Проверка, заполнены ли основные поля */
export const isBanquetFormValidAtom = atom((get) => {
    const form = get(banquetFormAtom);
    return (
        form.date !== null &&
        form.timeFrom !== 'с' &&
        form.timeTo !== 'до' &&
        form.guestCount.value !== 'unset' &&
        form.reason !== ''
    );
});

/** Проверка, есть ли дополнительные услуги */
export const hasAdditionalOptionsAtom = atom((get) => {
    const form = get(banquetFormAtom);
    return form.additionalOptions && form.additionalOptions.length > 0;
});
