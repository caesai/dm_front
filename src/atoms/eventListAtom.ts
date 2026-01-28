import { Atom, atom } from 'jotai';
import { IEvent } from '@/types/events.types.ts';

/**
 * Атом для хранения количества гостей
 * @type {Atom<number>}
 */
export const guestCountAtom: Atom<number> = atom<number>(0);

/**
 * Атом для хранения количества детей
 * @type {Atom<number>}
 */
export const childrenCountAtom: Atom<number> = atom<number>(0);

/**
 * Интерфейс для представления выбранного события
 * @interface ISelectedEvent
 */
interface ISelectedEvent {
    /**
     * Название события
     * @type {string}
     */
    title?: string;
    /**
     * ID события
     * @type {number}
     */
    id: number;
    /**
     * Дата начала события
     * @type {string}
     */
    startDate?: string;
    /**
     * Дата окончания события
     * @type {string}
     */
    endDate?: string;
    /**
     * Цена события
     * @type {number}
     */
    price?: number;
}

/**
 * Атом для хранения выбранного события
 * @type {Atom<ISelectedEvent | null>}
 */
export const selectedEventAtom: Atom<ISelectedEvent | null> = atom<ISelectedEvent | null>(null);

/**
 * Атом для хранения списка событий
 * @type {Atom<IEvent[] | null>}
 */
export const eventsListAtom: Atom<IEvent[] | null> = atom<IEvent[] | null>(null);
